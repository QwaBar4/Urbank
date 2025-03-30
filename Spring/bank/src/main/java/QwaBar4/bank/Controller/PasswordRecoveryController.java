package QwaBar4.bank.Controller;

import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Model.UserModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/login/recovery")
public class PasswordRecoveryController {

    private final EmailVerificationService verificationService;
    private final UserModelRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public PasswordRecoveryController(EmailVerificationService verificationService,
                                    UserModelRepository userRepository,
                                    PasswordEncoder passwordEncoder) {
        this.verificationService = verificationService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }
   
   
   
    @PostMapping("/request-code")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body("Email is required");
            }
            
            String normalizedEmail = email.trim().toLowerCase();
            
            // Check if email exists in database
            boolean emailExists = userRepository.existsByEmailIgnoreCase(normalizedEmail);
            if (!emailExists) {
                return ResponseEntity.badRequest().body("Email not found in our system");
            }

            // Send verification code
            verificationService.sendVerificationCode(normalizedEmail);
            return ResponseEntity.ok().body(Map.of("message", "Verification code sent"));
            
        } catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		        .body(Map.of("error", "Failed to send verification code"));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            if (email == null || code == null) {
                return ResponseEntity.badRequest().body("Both email and code are required");
            }

            String normalizedEmail = email.trim().toLowerCase();
            
            if (!verificationService.verifyCode(normalizedEmail, code)) {
                return ResponseEntity.badRequest().body("Invalid or expired verification code");
            }

            return ResponseEntity.ok().body(Map.of("message", "Code verified successfully"));
            
        } catch (Exception e) {
		    return ResponseEntity.badRequest()
		        .body(Map.of("error", "Invalid or expired verification code"));
        }
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");
            
            // Validate inputs
            if (email == null || newPassword == null || confirmPassword == null) {
                return ResponseEntity.badRequest().body("All fields are required");
            }
            
            if (newPassword.length() < 6) {
                return ResponseEntity.badRequest().body("Password must be at least 6 characters");
            }

            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body("Passwords do not match");
            }

            String normalizedEmail = email.trim().toLowerCase();
            
            // Find user and update password
            return userRepository.findByEmailIgnoreCase(normalizedEmail)
                .map(user -> {
                    user.setPassword(passwordEncoder.encode(newPassword));
                    userRepository.save(user);
                    return ResponseEntity.ok().body(Map.of("message", "Password reset complete"));
                })
                .orElse(ResponseEntity.ok().body(Map.of("message", "Password reset complete")));
                
        } catch (Exception e) {
		    return ResponseEntity.badRequest()
		        .body(Map.of("error", "Error reseting password"));
        }
    }
}
