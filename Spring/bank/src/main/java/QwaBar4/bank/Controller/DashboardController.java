package QwaBar4.bank.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import java.util.Collections;
import org.springframework.web.bind.annotation.*;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.DTO.AccountDTO;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Service.AuditLogService;

import java.util.HashMap;
import java.util.Map;
import java.util.List;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class DashboardController {

    private final UserModelRepository userModelRepository;
    
    @Autowired
	private AuditLogService auditLogService;

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

    @GetMapping("/api/user/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardData() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserModel user = userModelRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User  not found"));

            AccountModel account = user.getAccount();
            AccountDTO accountDTO = new AccountDTO(
                account.getId(),
                account.getAccountNumber(),
                account.getBalance(),
                account.getDailyTransferLimit(),
                account.getDailyWithdrawalLimit()
            );

            Map<String, Object> response = new HashMap<>();
            response.put("username", user.getUsername());
            response.put("account", accountDTO);
            response.put("roles", user.getRoles()); 

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("error", e.getMessage()));
        }
    }

	@GetMapping("/api/admin/dashboard")
	public ResponseEntity<Map<String, Object>> getAdminDashboardData() {
		try {
		    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		    if (authentication == null) {
		        return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(Collections.singletonMap("error", "User  not authenticated"));
		    }

		    System.out.println("User  Roles: " + authentication.getAuthorities());

		    if (!authentication.getAuthorities().stream()
		            .anyMatch(grantedAuthority -> grantedAuthority.getAuthority().equals("ROLE_ADMIN"))) {
		        return ResponseEntity.status(HttpStatus.FORBIDDEN)
		                .body(Collections.singletonMap("error", "Access denied: Admin role required"));
		    }

		    List<UserModel> users = userModelRepository.findAll();
		    Map<String, Object> response = new HashMap<>();
		    response.put("users", users);
		    response.put("totalUsers", users.size());

		    return ResponseEntity.ok(response);
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		            .body(Collections.singletonMap("error", e.getMessage()));
		}
	}

    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        SecurityContextHolder.clearContext();
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        auditLogService.logAction("LOG OUT", authentication.getName(), "User logged out"); 
        return ResponseEntity.ok().build();
    }
}
