package QwaBar4.bank.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;
import java.util.Collections;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import java.util.HashMap;
import java.util.Map;


@RestController
public class IndexController {
    
    private final UserModelRepository userModelRepository;
    
    public IndexController(UserModelRepository userModelRepository) {
        this.userModelRepository = userModelRepository;
    }
    
    @GetMapping("/api/user")
    public ResponseEntity<Map<String, Object>> getInitialData() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserModel user = userModelRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("accountNumber", user.getAccount().getAccountNumber());
            response.put("roles", user.getRoles());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }
    

    private static class IndexResponse {
        private final String username;
        private final AccountModel account;

        public IndexResponse(String username, AccountModel account) {
            this.username = username;
            this.account = account;
        }

        public String getUsername() {
            return username;
        }

        public AccountModel getAccount() {
            return account;
        }
    }
}
