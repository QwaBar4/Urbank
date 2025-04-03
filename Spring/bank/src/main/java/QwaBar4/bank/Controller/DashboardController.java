package QwaBar4.bank.Controller;

import org.modelmapper.ModelMapper;
import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.DTO.AccountSummaryDTO;
import QwaBar4.bank.DTO.DashboardDTO;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class DashboardController {

    private final UserModelRepository userModelRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public DashboardController(UserModelRepository userModelRepository, 
                             ModelMapper modelMapper) {
        this.userModelRepository = userModelRepository;
        this.modelMapper = modelMapper;
    }

    @GetMapping("/api/csrf")
    public ResponseEntity<Void> getCsrfToken(HttpServletRequest request) {
        return ResponseEntity.ok()
            .header("X-CSRF-TOKEN", request.getAttribute("_csrf").toString())
            .build();
    }

    @GetMapping(value = "/api/user/dashboard", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<DashboardDTO> getDashboardData() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserModel user = userModelRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            AccountSummaryDTO accountDTO = modelMapper.map(user.getAccount(), AccountSummaryDTO.class);
            DashboardDTO response = new DashboardDTO(user.getUsername(), accountDTO);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new DashboardDTO());
        }
    }

    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().build();
    }

    public static class DashboardResponse {
        private final String username;
        private final AccountModel account;

        public DashboardResponse(String username, AccountModel account) {
            this.username = username;
            this.account = account;
        }

        // Add getters
        public String getUsername() {
            return username;
        }

        public AccountModel getAccount() {
            return account;
        }
    }
}
