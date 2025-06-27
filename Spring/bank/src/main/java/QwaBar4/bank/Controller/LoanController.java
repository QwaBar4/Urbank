package QwaBar4.bank.Controller;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.LoanService;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/loans")
public class LoanController {
    private final LoanService loanService;

    public LoanController(LoanService loanService) {
        this.loanService = loanService;
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<?> applyForLoan(@Valid @RequestBody LoanApplicationDTO loanDTO) {
        try {
            LoanApplicationDTO createdLoan = loanService.createLoan(loanDTO);
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
}
