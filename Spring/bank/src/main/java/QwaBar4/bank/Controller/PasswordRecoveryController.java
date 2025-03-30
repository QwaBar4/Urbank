package QwaBar4.bank.Controller;

import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Model.UserModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import java.util.Map;

@RestController
@RequestMapping("/req/login/recovery")
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

	public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		
		if (email == null || email.isBlank()) {
		    return ResponseEntity.badRequest().body("Email is required");
		}
		
		if (!userRepository.existsByEmailIgnoreCase(email)) {
		    return ResponseEntity.badRequest().body("Email not found");
		}

		try {
		    verificationService.sendVerificationCode(email);
		    return ResponseEntity.ok("Verification code sent");
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		        .body("Failed to send verification code");
		}
	}

    @PostMapping("/verify-reset-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (!verificationService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body("Invalid or expired code");
        }

        return ResponseEntity.ok("Code verified successfully");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        String confirmPassword = request.get("confirmPassword");
        
        if (newPassword.length() < 6) {
        	return ResponseEntity.badRequest().body("Password must be at least 8 characters");
		}

        if (!newPassword.equals(confirmPassword)) {
            return ResponseEntity.badRequest().body("Passwords don't match");
        }

        return userRepository.findByEmailIgnoreCase(email)
            .map(user -> {
                user.setPassword(passwordEncoder.encode(newPassword));
                userRepository.save(user);
                return ResponseEntity.ok("Password updated successfully");
            })
            .orElse(ResponseEntity.badRequest().body("User not found"));
    }
}
