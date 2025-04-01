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
import io.jsonwebtoken.JwtException;

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
		    if (!request.containsKey("token") || request.get("token").isEmpty()) {
		        return ResponseEntity.badRequest().body(Map.of("error", "Reset token is required"));
		    }
		    
		    String token = request.get("token");
		    String email;

		    try {
		        email = jwtUtil.getEmailFromToken(token);
		    } catch (JwtException e) {
		        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		            .body(Map.of("error", "Invalid or expired token"));
		    }

		    if (email == null || email.isEmpty()) {
		        return ResponseEntity.badRequest().body(Map.of("error", "Invalid token"));
		    }

		    UserModel user = userRepository.findByEmailIgnoreCase(email)
		        .orElseThrow(() -> new RuntimeException("User not found"));

		    String newPassword = request.get("newPassword");
		    String confirmPassword = request.get("confirmPassword");
		    
		    if (newPassword == null || newPassword.isEmpty()) {
		        return ResponseEntity.badRequest().body(Map.of("error", "Password is required"));
		    }

		    if (!newPassword.equals(confirmPassword)) {
		        return ResponseEntity.badRequest().body(Map.of("error", "Passwords mismatch"));
		    }

		    user.setPassword(passwordEncoder.encode(newPassword));
		    userRepository.save(user);

		    return ResponseEntity.ok(Map.of("message", "Password updated"));
		} catch (RuntimeException e) {
		    return ResponseEntity.status(HttpStatus.NOT_FOUND)
		        .body(Map.of("error", "User not found"));
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		        .body(Map.of("error", "Server error: " + e.getMessage()));
		}
	}
}
