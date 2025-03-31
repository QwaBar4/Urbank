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

            return ResponseEntity.ok().body(Map.of("token", token, "newPassword", newPassword, "confirmPassword", confirmPassword));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Password reset failed: " + e.getMessage()));
        }
    }
}
