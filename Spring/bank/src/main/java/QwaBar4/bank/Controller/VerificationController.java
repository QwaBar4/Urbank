package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import QwaBar4.bank.Service.EmailVerificationService;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class VerificationController {

    private final EmailVerificationService verificationService;

    @Autowired
    public VerificationController(EmailVerificationService verificationService) {
        this.verificationService = verificationService;
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

    @PostMapping("/verify-code")
    public ResponseEntity<?> verifyCode(@RequestBody Map<String, String> request) {
        boolean isValid = verificationService.verifyCode(
            request.get("email"),
            request.get("code")
        );
        return ResponseEntity.ok(Collections.singletonMap("valid", isValid));
    }
}
