package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Collections;
import java.util.stream.Collectors;

import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Model.AuditLogModel;
import QwaBar4.bank.Model.AuditLogRepository;
import QwaBar4.bank.Service.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserModelService userModelService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
	private AuditLogRepository auditLogRepository;

	@Autowired
	private AnonymizationService anonymizationService;

	@Autowired
	private AuditLogService auditLogService;

	@GetMapping("/users/{userId}")
	public ResponseEntity<UserDetailsDTO> getUserDetails(@PathVariable Long userId) {
		UserDetailsDTO userDetails = userModelService.getUserDetails(userId);
		return ResponseEntity.ok(userDetails);
	}

	@PutMapping("/users/{userId}")
	public ResponseEntity<UserDetailsDTO> updateUserDetails(
		    @PathVariable Long userId,
		    @RequestBody UserUpdateDTO userUpdateDTO) {
		UserDetailsDTO updatedUser = userModelService.updateUserDetails(userId, userUpdateDTO);
		return ResponseEntity.ok(updatedUser);
	}

    @PostMapping("/users/{userId}/assignRole")
    public ResponseEntity<?> assignRoleToUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        userModelService.assignRoleToUser(userId, role);
        return ResponseEntity.ok("Role assigned successfully");
    }

    @PostMapping("/users/{userId}/removeRole")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        userModelService.removeRoleFromUser(userId, role);
        return ResponseEntity.ok("Role removed successfully");
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Boolean> request) {
        Boolean active = request.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().body("Active status is required");
        }
        userModelService.updateUserStatus(userId, active);
        return ResponseEntity.ok("");
    }

    @GetMapping("/users/{userId}/transactions")
    public ResponseEntity<List<TransactionDTO>> getUserTransactions(@PathVariable Long userId) {
        List<TransactionDTO> transactions = transactionService.getUserTransactionsById(userId);
        
        transactions.forEach(t -> {
        
            if (t.getSourceAccountNumber() != null) {
                t.setSourceAccountNumber(anonymizationService.anonymize(t.getSourceAccountNumber()));
            }
            if (t.getTargetAccountNumber() != null) {
                t.setTargetAccountNumber(anonymizationService.anonymize(t.getTargetAccountNumber()));
            }
            
            if (t.getSourceAccountOwner() != null) {
                t.setSourceAccountOwner(anonymizationService.anonymize(t.getSourceAccountOwner()));
            }
            if (t.getTargetAccountOwner() != null) {
                t.setTargetAccountOwner(anonymizationService.anonymize(t.getTargetAccountOwner()));
            }
        });
        
        return ResponseEntity.ok(transactions);
    }

	@DeleteMapping("/users/{userId}")
	public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
		userModelService.deleteUser(userId);
		return ResponseEntity.noContent().build();
	}

	@GetMapping("/audit-logs")
	public ResponseEntity<List<AuditLogModel>> getAuditLogs() {
		return ResponseEntity.ok(auditLogRepository.findAll());
	}

	@GetMapping("/users/{userId}/audit-logs")
	public ResponseEntity<List<AuditLogDTO>> getUserAuditLogs(@PathVariable Long userId) {
	    List<AuditLogModel> auditLogs = auditLogRepository.findByUsername(anonymizationService.anonymize(userModelService.getUserDetails(userId).getUsername()));
	    List<AuditLogDTO> auditLogDTOs = auditLogs.stream()
	        .map(log -> new AuditLogDTO(
	            log.getId(),
	            log.getAction(),
	            anonymizationService.deanonymize(log.getUsername()),
	            log.getTimestamp(),
	            anonymizationService.deanonymize(log.getDetails())
	        ))
	        .collect(Collectors.toList());
	    return ResponseEntity.ok(auditLogDTOs);
	}

	@PostMapping("/deanonymize")
	@PreAuthorize("hasRole('ADMIN')")
	public ResponseEntity<?> deanonymizeValue(
		@RequestBody Map<String, String> request
		) {
		String result = anonymizationService.deanonymize(request.get("value"));
		return ResponseEntity.ok(Collections.singletonMap("original", result));
	}
}
