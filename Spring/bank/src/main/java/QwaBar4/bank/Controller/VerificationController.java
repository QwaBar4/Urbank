package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Security.JwtUtil;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class VerificationController {

    private final EmailVerificationService verificationService;
    private final JwtUtil jwtUtil;

    @Autowired
    public VerificationController(EmailVerificationService verificationService, JwtUtil jwtUtil) {
        this.verificationService = verificationService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        verificationService.sendVerificationCode(email);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/send-recovery-code")
    public ResponseEntity<?> sendRecoveryCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        verificationService.sendRecoveryCode(email);
        return ResponseEntity.ok().build();
    }
    
	@PostMapping("/verify-recovery-code")
	public ResponseEntity<?> verifyRecoveryCode(@RequestBody Map<String, String> request) {
		String email = request.get("email");
		String code = request.get("code");
		
        if (!request.containsKey("email") || request.get("email").isEmpty()) {
            return ResponseEntity.badRequest().body("Email is required");
        }
        if (!request.containsKey("code") || request.get("code").isEmpty()) {
            return ResponseEntity.badRequest().body("Verification code is required");
        }
        
		email = email.trim().toLowerCase();

		if (!verificationService.verifyCode(email, code)) {
		    return ResponseEntity.badRequest().body("Invalid code");
		}

		String token = jwtUtil.generatePasswordResetToken(email);
		return ResponseEntity.ok(Map.of("token", token));
	}

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        boolean isValid = verificationService.verifyCode(
            request.get("email"),
            request.get("code")
        );
        return ResponseEntity.ok(Collections.singletonMap("valid", isValid));
    }
}
