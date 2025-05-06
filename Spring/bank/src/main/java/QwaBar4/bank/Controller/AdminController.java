package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpHeaders;
import org.springframework.security.core.Authentication;
import org.springframework.http.CacheControl;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Collections;
import java.util.stream.Collectors;

import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Exception.ResourceNotFoundException;
import QwaBar4.bank.Model.AuditLogModel;
import QwaBar4.bank.Model.TransactionModel;
import QwaBar4.bank.Model.TransactionModelRepository;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.AuditLogRepository;
import QwaBar4.bank.Service.*;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserModelService userModelService;

    @Autowired
    private TransactionService transactionService;

    @Autowired
    private AESEncryptionService encryptionService;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private TransactionModelRepository transactionRepo;

    @Autowired
    private AnonymizationService anonymizationService;
    
    @Autowired
    private StatementService statementService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserModelRepository userRepository;

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDetailsDTO> getUserDetails(@PathVariable Long userId) {
        UserDetailsDTO userDetails = userModelService.getUserDetails(userId);
        return ResponseEntity.ok(userDetails);
    }
    
	@GetMapping("/users/{id}/details")
	public ResponseEntity<UserDetailsDTO> getUserDetails(
		@PathVariable Long id,
		Authentication authentication) {

		UserModel user = userRepository.findById(id)
		        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

		auditLogService.logAdminAction(
		    authentication.getName(),
		    "VIEW_USER_DETAILS",
		    "Accessed details of user ID: " + id
		);

		UserDetailsDTO dto = new UserDetailsDTO.Builder()
		        .id(user.getId())
		        .username(user.getUsername())
		        .email(user.getEmail())
		        .accountNumber(user.getAccount().getAccountNumber())
		        .balance(user.getAccount().getBalance())
		        .active(user.isActive())
		        .roles(user.getRoles())
		        .firstName(user.getFirstName())
		        .lastName(user.getLastName())
		        .middleName(user.getMiddleName())
		        .passportSeries(user.getPassportSeries())
		        .passportNumber(user.getPassportNumber())
		        .dateOfBirth(user.getDateOfBirth())
		        .build();

		auditLogService.logSensitiveDataAccess(
		    authentication.getName(),
		    user.getId(),
		    "PASSPORT_DATA_ACCESS"
		);

		return ResponseEntity.ok()
		        .cacheControl(CacheControl.noStore())
		        .header("X-Sensitive-Data", "true")
		        .body(dto);
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
		return ResponseEntity.ok(transactions);
	}

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<Map<String, String>> getTransactionDetails(
            @PathVariable Long transactionId) {

        TransactionModel transaction = transactionRepo.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        Map<String, String> details = new HashMap<>();
        details.put("originalDescription", encryptionService.decrypt(transaction.getEncryptedDescription()));
        details.put("originalSourceAccount", anonymizationService.deanonymize(transaction.getSourceAccountNumber()));
        details.put("originalTargetAccount", anonymizationService.deanonymize(transaction.getTargetAccountNumber()));

        return ResponseEntity.ok(details);
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
		try {
		    String originalUsername = userModelService.getUserDetails(userId).getUsername();
		    String anonymizedUsername = anonymizationService.anonymize(originalUsername);
		    
		    List<AuditLogModel> auditLogs = auditLogRepository.findByUsername(anonymizedUsername);
		    
		    List<AuditLogDTO> auditLogDTOs = auditLogs.stream()
		        .map(log -> new AuditLogDTO(
		            log.getId(),
		            log.getAction(),
		            anonymizationService.deanonymize(log.getUsername()),
		            log.getTimestamp(),
		            encryptionService.decrypt(log.getDetails())
		        ))
		        .collect(Collectors.toList());
		        
		    return ResponseEntity.ok(auditLogDTOs);
		} catch (Exception e) {
		    return ResponseEntity.status(500).body(Collections.emptyList());
		}
	}

	@GetMapping("/users/{userId}/statements")
	public ResponseEntity<byte[]> generateUserStatement(@PathVariable Long userId) {
		try {
		    StatementPDF statementPDF = statementService.generateStatement(userId);
		    byte[] pdfContent = statementPDF.getContent();

		    HttpHeaders headers = new HttpHeaders();
		    headers.add("Content-Disposition", "attachment; filename=transaction_statement.pdf");
		    headers.add("Content-Type", "application/pdf");

		    return new ResponseEntity<>(pdfContent, headers, HttpStatus.OK);
		} catch (Exception e) {
		    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
		            .body("Error generating PDF: ".getBytes());
		}
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
