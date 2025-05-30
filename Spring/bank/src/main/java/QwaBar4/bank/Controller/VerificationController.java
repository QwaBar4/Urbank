package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import QwaBar4.bank.Service.EmailVerificationService;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Security.JwtUtil;
import QwaBar4.bank.Model.UserModel;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class VerificationController {

    private final EmailVerificationService verificationService;
    private final JwtUtil jwtUtil;
    private final UserModelRepository userModelRepository;

    @Autowired
    public VerificationController(EmailVerificationService verificationService, JwtUtil jwtUtil, UserModelRepository userModelRepository) {
        this.verificationService = verificationService;
        this.jwtUtil = jwtUtil;
        this.userModelRepository = userModelRepository;
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
        UserModel user = userModelRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("User  not found"));
        verificationService.sendCode(email, 1);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/email-verification-code")
	public ResponseEntity<?> sendEmailVerificationCode(@RequestBody Map<String, String> request) {
		String email = request.get("email");
        UserModel user = userModelRepository.findByEmailIgnoreCase(email)
                    .orElseThrow(() -> new RuntimeException("User  not found"));
        verificationService.sendCode(email, 2);
        return ResponseEntity.ok().build();
	}

    
    @PostMapping("/verify-email-code")
    public ResponseEntity<?> verifyOldEmailCode(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String code = request.get("code");

        if (!verificationService.verifyCode(email, code)) {
            return ResponseEntity.badRequest().body("Invalid code");
        }

        String token = jwtUtil.generateEmailUpdateToken(email);
        return ResponseEntity.ok(Map.of("token", token));
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
