package QwaBar4.bank.Controller;

import org.springframework.transaction.annotation.Propagation;
import org.springframework.http.HttpStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.AuthenticationException;
import java.math.BigDecimal;

import java.util.regex.Pattern;

import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Security.AuthResponse;
import QwaBar4.bank.Security.JwtUtil;
import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Service.UserCreationService;

import java.util.Map;
import java.util.UUID;


@RestController
@RequestMapping("/req")
public class RegistrationController {
    private final UserCreationService userCreationService;
    private final EmailVerificationService verificationService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Autowired
    public RegistrationController(UserCreationService userCreationService,
                                EmailVerificationService verificationService,
                                AuthenticationManager authenticationManager,
                                JwtUtil jwtUtil) {
        this.userCreationService = userCreationService;
        this.verificationService = verificationService;
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> createUser(@RequestBody Map<String, String> request) {
        // Validate required fields
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String code = request.get("code");

        if (username == null || email == null || password == null || code == null) {
            return ResponseEntity.badRequest().body("Missing required fields");
        }

        // Verify email code
        if (!verificationService.verifyCode(email, code)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                   .body(new AuthResponse(null, "Invalid verification code", false));
        }

        try {
            // Create user with only basic info
            UserModel newUser = userCreationService.createUserTransaction(username, email, password);
            
            // Attempt authentication
            return attemptAuthentication(newUser.getUsername(), password);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                   .body(new AuthResponse(null, e.getMessage(), false));
        }
    }

    private ResponseEntity<?> attemptAuthentication(String username, String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );
            String jwt = jwtUtil.generateToken(authentication);
            return ResponseEntity.ok(new AuthResponse(jwt, "User created and authenticated", true));
        } catch (AuthenticationException e) {
            return ResponseEntity.ok(new AuthResponse(null, 
                "Account created but automatic login failed. Please login manually.", 
                false));
        }
    }
}
