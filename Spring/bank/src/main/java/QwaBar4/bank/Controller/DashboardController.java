package QwaBar4.bank.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;

import java.util.HashMap;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class DashboardController {

    private final UserModelRepository userModelRepository;

    @Autowired
    public DashboardController(UserModelRepository userModelRepository) {
        this.userModelRepository = userModelRepository;
    }

    @GetMapping("/api/csrf")
    public ResponseEntity<Void> getCsrfToken(HttpServletRequest request) {
        return ResponseEntity.ok()
            .header("X-CSRF-TOKEN", request.getAttribute("_csrf").toString())
            .build();
    }

    @GetMapping(value = {"/api/index", "/api/user/dashboard"}, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserModel user = userModelRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            
            Map<String, Object> accountInfo = new HashMap<>();
            accountInfo.put("accountNumber", user.getAccount().getAccountNumber());
            accountInfo.put("balance", user.getAccount().getBalance());
            
            response.put("account", accountInfo);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }
}
