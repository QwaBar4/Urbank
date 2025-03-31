package QwaBar4.bank.Controller;

import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Model.UserModel; 
import QwaBar4.bank.Security.JwtUtil; 
import QwaBar4.bank.Model.UserModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import java.util.Optional; 

import java.util.Map;

@RestController
@RequestMapping("/login/recovery")
public class PasswordRecoveryController {

    private final EmailVerificationService verificationService;
    private final UserModelRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Autowired
    public PasswordRecoveryController(EmailVerificationService verificationService,
                                    UserModelRepository userRepository,
                                    PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.verificationService = verificationService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }
   
   
   
    @PostMapping("/request-code")
    public ResponseEntity<?> requestPasswordReset(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            
            // Validate email format
            if (email == null || email.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }
            
            String normalizedEmail = email.trim().toLowerCase();
            
            // Validate email existence (mirror registration check)
            if (!userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email not found"));
            }

            // Validate email format
            if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid email format"));
            }

            verificationService.sendVerificationCode(normalizedEmail);
            return ResponseEntity.ok().body(Map.of("message", "Verification code sent"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to send verification code: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyResetCode(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String code = request.get("code");

            // Validate inputs
            if (email == null || email.isBlank() || code == null || code.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Both email and code are required"));
            }

            String normalizedEmail = email.trim().toLowerCase();
            
            // Verify code with service (case-sensitive code check)
            if (!verificationService.verifyCode(normalizedEmail, code)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired verification code"));
            }

            // Generate time-limited reset token (1 hour)
            String resetToken = jwtUtil.generatePasswordResetToken(normalizedEmail);
            return ResponseEntity.ok().body(Map.of("token", resetToken));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Verification failed: " + e.getMessage()));
        }
    }

	
    @Transactional
    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        try {
            // Validate reset token
            String token = request.get("token");
            if (token == null || !jwtUtil.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid or expired reset token"));
            }

            // Get email from token
            String normalizedEmail = jwtUtil.getEmailFromToken(token);
            
            // Validate password
            String newPassword = request.get("newPassword");
            String confirmPassword = request.get("confirmPassword");
            
            if (newPassword == null || newPassword.length() < 6) {
                return ResponseEntity.badRequest().body(Map.of("error", "Password must be at least 6 characters"));
            }
            
            if (!newPassword.equals(confirmPassword)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Passwords do not match"));
            }

            // Update password
            UserModel user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.saveAndFlush(user);

            return ResponseEntity.ok().body(Map.of("message", "Password reset successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Password reset failed: " + e.getMessage()));
        }
    }
}
