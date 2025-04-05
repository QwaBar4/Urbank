package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;
    private final UserModelRepository userRepo;
    private final TransactionService transactionService;

    @Autowired
    public TransactionController(AccountModelRepository accountRepo,
                               TransactionModelRepository transactionRepo,
                               UserModelRepository userRepo,
                               TransactionService transactionService) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.transactionService = transactionService;
    }

	@PostMapping("/transfer")
	public ResponseEntity<?> transferMoney(
		@RequestBody TransferRequestDTO request,
		Authentication authentication
	) {
		try {
		    TransactionDTO transaction = transactionService.processTransfer(
		        request.getSourceAccount(),
		        request.getTargetAccount(),
		        request.getAmount(),
		        authentication.getName()
		    );
		    return ResponseEntity.ok(transaction);
		} catch (RuntimeException e) {
		    return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
    
    @GetMapping("/history")
    public ResponseEntity<List<TransactionDTO>> getTransactionHistory(Authentication authentication) {
        List<TransactionDTO> transactions = transactionService.getUserTransactions(authentication.getName());
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/balance")
    public ResponseEntity<Double> getAccountBalance(Authentication authentication) {
        Double balance = transactionService.getAccountBalance(authentication.getName());
        return ResponseEntity.ok(balance);
    }
    
    @PostMapping("/deposit")
	public ResponseEntity<?> depositFunds(
		@RequestBody DepositWithdrawRequestDTO request,
		Authentication authentication
	) {
		try {
		    TransactionDTO transaction = transactionService.processDeposit(
		        request.getAccountNumber(),
		        request.getAmount(),
		        request.getDescription(),
		        authentication.getName()
		    );
		    return ResponseEntity.ok(transaction);
		} catch (RuntimeException e) {
		    return ResponseEntity.badRequest().body(e.getMessage());
		}
	}

	@PostMapping("/withdraw")
	public ResponseEntity<?> withdrawFunds(
		@RequestBody DepositWithdrawRequestDTO request,
		Authentication authentication
	) {
		try {
		    TransactionDTO transaction = transactionService.processWithdrawal(
		        request.getAccountNumber(),
		        request.getAmount(),
		        request.getDescription(),
		        authentication.getName()
		    );
		    return ResponseEntity.ok(transaction);
		} catch (RuntimeException e) {
		    return ResponseEntity.badRequest().body(e.getMessage());
		}
	}
}
