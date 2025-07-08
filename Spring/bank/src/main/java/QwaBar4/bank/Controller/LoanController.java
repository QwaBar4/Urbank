package QwaBar4.bank.Controller;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.validation.Valid;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.*;
import QwaBar4.bank.Utils.AccountNumberUtils;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;
import java.util.HashMap;


@RestController
@RequestMapping("/api/loans")
public class LoanController {

    @Autowired
	private AuditLogService auditLogService;
	
    private final LoanService loanService;
    private final TransactionService transactionService;
    private final AccountNumberUtils accountNumberUtils;

    public LoanController(LoanService loanService, TransactionService transactionService, AccountNumberUtils accountNumberUtils) {
        this.loanService = loanService;
        this.transactionService = transactionService;
        this.accountNumberUtils = accountNumberUtils;
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> applyForLoan(@Valid @RequestBody LoanApplicationDTO loanDTO) {
        try {
            LoanApplicationDTO createdLoan = loanService.createLoan(loanDTO);
            auditLogService.logActionById("LOAN_APPLY", createdLoan.getAccountId(), "User applied loan"); 
            return ResponseEntity.status(HttpStatus.CREATED).body(createdLoan);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "error", "LOAN_CREATION_FAILED",
                    "message", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
                )
            );
        }
    }

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoanResponseDTO>> getAllLoans() {
        List<LoanResponseDTO> loans = loanService.getAllLoans();
        return ResponseEntity.ok(loans);
    }

    @PutMapping("/{loanId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponseDTO> approveLoan(@PathVariable Long loanId) {
        LoanResponseDTO approvedLoan = loanService.approveLoan(loanId);
        return ResponseEntity.ok(approvedLoan);
    }

    @PutMapping("/{loanId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<LoanResponseDTO> rejectLoan(@PathVariable Long loanId) {
        LoanResponseDTO rejectedLoan = loanService.rejectLoan(loanId);
        return ResponseEntity.ok(rejectedLoan);
    }
    
    @GetMapping("/my-loans")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<LoanResponseDTO>> getUserLoans() {
        List<LoanResponseDTO> loans = loanService.getLoansForCurrentUser();
        return ResponseEntity.ok(loans);
    }
    
    @PostMapping("/{loanId}/payments")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> recordPayment(
        @PathVariable Long loanId,
        @Valid @RequestBody LoanPaymentDTO paymentDTO,
        Authentication authentication
    ) {
        try {
            PaymentResponseDTO payment = loanService.recordPayment(loanId, paymentDTO);
            String accNumber = accountNumberUtils.convertFormattedNumberToUuid(paymentDTO.getAccountNumber());
            BigDecimal balance = transactionService.getAccountBalanceByNumber(accNumber);

            Map<String, Object> response = new HashMap<>();
            response.put("payment", payment);
            response.put("newBalance", balance);
            
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of(
                    "error", "PAYMENT_FAILED",
                    "message", e.getMessage(),
                    "timestamp", System.currentTimeMillis()
                )
            );
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of(
                    "error", "PAYMENT_PROCESSING_ERROR",
                    "message", "An error occurred while processing payment",
                    "timestamp", System.currentTimeMillis()
                )
            );
        }
    }
}
