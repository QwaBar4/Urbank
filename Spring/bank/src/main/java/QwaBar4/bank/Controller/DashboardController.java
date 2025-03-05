package QwaBar4.bank.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class DashboardController {

    private final UserModelRepository userModelRepository;

    public DashboardController(UserModelRepository userModelRepository) {
        this.userModelRepository = userModelRepository;
    }

    @GetMapping("/api/user/dashboard")
    public DashboardResponse getDashboardData() {
        // Get the currently authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Fetch the user details from the database
        UserModel user = userModelRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Return the dashboard data
        return new DashboardResponse(user.getUsername(), user.getAccount());
    }

    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Invalidate the session
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    // Response DTO
    private static class DashboardResponse {
        private final String username;
        private final AccountModel account;

        public DashboardResponse(String username, AccountModel account) {
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
