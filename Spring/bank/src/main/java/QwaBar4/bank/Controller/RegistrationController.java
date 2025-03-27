package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Security.AuthResponse;
import QwaBar4.bank.Security.JwtUtil;

import java.util.Map;
import java.util.UUID;

@RestController
public class RegistrationController {
    private final UserModelRepository userRepo;
    private final PasswordEncoder encoder;
    private final AccountModelRepository accountRepo;
    
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    public RegistrationController(UserModelRepository userRepo, PasswordEncoder encoder, AccountModelRepository accountRepo) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.accountRepo = accountRepo;
    }

	@Transactional
	@PostMapping("/req/signup")
	public ResponseEntity<?> createUser(@RequestBody UserModel user) {
		try {
			String normalizedUsername = user.getUsername().trim().toLowerCase();
			
		    if (userRepo.existsByUsernameIgnoreCase(normalizedUsername)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(new AuthResponse(null, "Username already exists", false));
        	}
		    
		    if (user.getPassword().length() < 6) {
		        return ResponseEntity.badRequest().body("Password must be at least 6 characters");
		    }

		    AccountModel account = new AccountModel();
		    account.setAccountNumber("ACC-" + UUID.randomUUID());
		    account.setBalance(0.0);

		    UserModel newUser = new UserModel();
        	newUser.setUsername(normalizedUsername);
		    newUser.setUsername(user.getUsername().trim());
		    newUser.setEmail(user.getEmail().trim().toLowerCase());
		    newUser.setPassword(encoder.encode(user.getPassword()));
		    newUser.setAccount(account);
		    
		    userRepo.save(newUser); 

			Authentication authentication = new UsernamePasswordAuthenticationToken(
		        newUser.getUsername(),
		        newUser.getPassword()
		    );
		    
		    String jwt = jwtUtil.generateToken(authentication);
		    
		    return ResponseEntity.ok(new AuthResponse(
		        jwt,
		        "User created",
		        true
		    ));
		} catch (DataIntegrityViolationException e) {
		    return ResponseEntity.status(HttpStatus.CONFLICT)
		        .body(new AuthResponse(null, "Username/email exists", false));
		}
	}
}
