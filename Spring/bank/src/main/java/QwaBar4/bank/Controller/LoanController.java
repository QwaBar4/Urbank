package QwaBar4.bank.Controller;

import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import QwaBar4.bank.DTO.LoanApplicationDTO;
import QwaBar4.bank.Service.LoanService;
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
}
