package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import QwaBar4.bank.Service.UserModelService;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Service.AuditLogService;

@RestController
@RequestMapping("/api")
public class UserController {

	private final UserModelRepository userRepo;
    private final UserModelService userModelService;
    private final AccountModelRepository accountRepo;
    
    @Autowired
	private AuditLogService auditLogService;

    @Autowired
    public UserController(UserModelService userModelService, AccountModelRepository accountRepo, UserModelRepository userRepo) {
        this.userModelService = userModelService;
        this.accountRepo = accountRepo;
        this.userRepo = userRepo;
    }
    
    @Transactional
    public void deleteByUsername(String username) {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        if (user.getAccount() != null) {
            accountRepo.delete(user.getAccount());
        }
        
        userRepo.delete(user);
    }

	@GetMapping("/check-username")
	public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
		System.out.println("Checking username: " + username);
		boolean exists = userModelService.existsByUsernameIgnoreCase(username);
		System.out.println("Exists: " + exists); 
		return ResponseEntity.ok(exists);
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
		    userModelService.deleteByUsername(username);
		    auditLogService.logAction("DELETED ACCOUNT", username, "User deleted account"); 
		    return ResponseEntity.noContent().build();
		} catch (Exception e) {
		    return ResponseEntity.internalServerError()
		        .body("Deletion failed: " + e.getMessage());
		}
	}
    
    @GetMapping("/check-email")
	public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
		boolean exists = userModelService.existsByEmailIgnoreCase(email);
		return ResponseEntity.ok(exists);
}
}
