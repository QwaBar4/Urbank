package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Security.AuthResponse;
import QwaBar4.bank.Security.JwtUtil;
import QwaBar4.bank.Service.EmailVerificationService;

import java.util.Map;
import java.util.UUID;

@RestController
public class RegistrationController {
    private final UserModelRepository userRepo;
    private final PasswordEncoder encoder;
    private final AccountModelRepository accountRepo;
    private final EmailVerificationService verificationService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    public RegistrationController(UserModelRepository userRepo, PasswordEncoder encoder, 
                                  AccountModelRepository accountRepo, EmailVerificationService verificationService) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.accountRepo = accountRepo;
        this.verificationService = verificationService;
    }

    @Transactional
    @PostMapping("/req/signup")
    public ResponseEntity<?> createUser (@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String code = request.get("code");

        // Verify the code before creating the user
        if (!verificationService.verifyCode(email, code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid verification code.");
        }

        try {
            String normalizedUsername = username.trim().toLowerCase();
            if (userRepo.existsByUsernameIgnoreCase(normalizedUsername)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, "Username already exists", false));
            }

            if (userRepo.existsByEmailIgnoreCase(email)) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new AuthResponse(null, "Email already exists", false));
            }

            if (password.length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }

            AccountModel account = new AccountModel();
            account.setAccountNumber("ACC-" + UUID.randomUUID());
            account.setBalance(0.0);

            UserModel newUser  = new UserModel();
            newUser .setUsername(normalizedUsername);
            newUser .setEmail(email.trim().toLowerCase());
            newUser .setPassword(encoder.encode(password));
            newUser .setAccount(account);

            userRepo.save(newUser );

            Authentication authentication = new UsernamePasswordAuthenticationToken(newUser .getUsername(), password);

        	String jwt = jwtUtil.generateToken(authentication); // Pass the Authentication object
            return ResponseEntity.ok(new AuthResponse(jwt, "User  created", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new AuthResponse(null, "Error creating user", false));
        }
    }
}
