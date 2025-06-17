package QwaBar4.bank.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.http.CacheControl;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import java.util.Collections;
import org.springframework.web.bind.annotation.*;

import QwaBar4.bank.DTO.ProfileDTO;
import QwaBar4.bank.DTO.UserDetailsDTO;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.DTO.AccountDTO;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Service.AuditLogService;
import QwaBar4.bank.Service.UserModelService;
import QwaBar4.bank.Service.StatementService;
import QwaBar4.bank.Service.StatementPDF;
import QwaBar4.bank.Model.UserModelRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import javax.validation.Valid;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@RestController
public class DashboardController {

    private final UserModelRepository userModelRepository;
    
    @Autowired
	private AuditLogService auditLogService;

    @Autowired
	private UserModelService userModelService;

    @Autowired
    private StatementService statementService;

    private ProfileDTO profileDTO;

    @Autowired
    private UserModelRepository userRepository;

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
    
    @GetMapping("/api/user/profile")
    public ResponseEntity<UserDetailsDTO> getProfile() {
        UserModel user = getCurrentUser();
        UserDetailsDTO dto = new UserDetailsDTO.Builder()
		        .id(null)
		        .username(user.getUsername())
		        .email(user.getEmail())
		        .accountNumber(user.getAccount().getAccountNumber())
		        .balance(user.getAccount().getBalance())
		        .roles(user.getRoles())
		        .firstName(user.getFirstName())
		        .lastName(user.getLastName())
		        .middleName(user.getMiddleName())
		        .passportSeries(user.getPassportSeries())
		        .passportNumber(user.getPassportNumber())
		        .dateOfBirth(user.getDateOfBirth())
		        .build();
        
        return ResponseEntity.ok(dto);
    }
    
	@PutMapping("/api/user/update-email")
	public ResponseEntity<?> updateEmail(@RequestBody Map<String, String> request, Authentication authentication) {
		try {
		    String oldEmail = request.get("oldEmail");
		    String newEmail = request.get("newEmail");
		    String verificationCode = request.get("verificationCode");
		    
		    UserModel user = userRepository.findByUsername(authentication.getName())
		        .orElseThrow(() -> new UsernameNotFoundException("User not found"));
		    
		    if (!user.getEmail().equalsIgnoreCase(oldEmail)) {
		        return ResponseEntity.badRequest().body("Current email doesn't match");
		    }
		    
		    if (userModelRepository.existsByEmailIgnoreCase(newEmail)) {
		        return ResponseEntity.badRequest().body("Email already in use");
		    }
		    
		    user.setEmail(newEmail);
		    userRepository.save(user);
		    
		    auditLogService.logAction("EMAIL_UPDATE", user.getUsername(), 
		        "User updated email from " + oldEmail + " to " + newEmail);
		        
		    return ResponseEntity.ok().build();
		} catch (Exception e) {
		    return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PutMapping("/api/user/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileDTO profileDTO) {
        UserModel user = getCurrentUser();
        
        user.setFirstName(profileDTO.getFirstName());
        user.setLastName(profileDTO.getLastName());
        user.setMiddleName(profileDTO.getMiddleName());
        user.setPassportSeries(profileDTO.getPassportSeries());
        user.setPassportNumber(profileDTO.getPassportNumber());
        user.setDateOfBirth(profileDTO.getDateOfBirth());
        
        userRepository.save(user);
        auditLogService.logAction("SENSITIVE_DATA_UPDATE", user.getUsername(), "Sensitive data updated");
        return ResponseEntity.ok().build();
    }

    private UserModel getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return userRepository.findByUsername(auth.getName())
               .orElseThrow(() -> new UsernameNotFoundException("User not found"));
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

	@GetMapping("/api/user/statements")
	public ResponseEntity<byte[]> generateUserStatement(@RequestParam(defaultValue = "dark") String theme) {
		try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();

            UserModel user = userModelRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User  not found"));
            
            long userId = user.getId();
            
		    StatementPDF statementPDF = statementService.generateStatement(userId, theme);
		    byte[] pdfContent = statementPDF.getContent();

		    HttpHeaders headers = new HttpHeaders();
		    headers.add("Content-Disposition", "attachment; filename=transaction_statement.pdf");
		    headers.add("Content-Type", "application/pdf");

		    return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		            .body("Error generating PDF: Maybe your transaction history is empty or data is corrupted".getBytes());
		}
	}

	@PostMapping("/api/logout")
	public ResponseEntity<?> logout(@RequestParam String username, Authentication authentication) {
		auditLogService.logAction("LOG_OUT", authentication.getName(), "User logged out");
		
		return ResponseEntity.ok().build();
	}

	@DeleteMapping("/delete-user")
	public ResponseEntity<?> deleteUser(
		@RequestParam String username,
		Authentication authentication) {
		
		if (!authentication.getName().equals(username)) {
		    return ResponseEntity.status(HttpStatus.FORBIDDEN)
		        .body("You can only delete your own account");
		}

		try {
			auditLogService.logAction("DELETED_ACCOUNT", username, "User deleted account"); 
		    userModelService.deleteByUsername(username);
		    return ResponseEntity.noContent().build();
		} catch (Exception e) {
		    return ResponseEntity.internalServerError()
		        .body("Deletion failed: " + e.getMessage());
		}
	}
}
