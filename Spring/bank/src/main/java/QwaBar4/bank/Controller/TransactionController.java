package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.*;
import QwaBar4.bank.Utils.AccountNumberUtils;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;
    private final UserModelRepository userRepo;
    private final TransactionService transactionService;
	private final AccountNumberUtils accountNumberUtils;

    @Autowired
    public TransactionController(AccountModelRepository accountRepo,
                                  TransactionModelRepository transactionRepo,
                                  UserModelRepository userRepo,
                                  TransactionService transactionService,
                                  AccountNumberUtils accountNumberUtils) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.transactionService = transactionService;
        this.accountNumberUtils = accountNumberUtils;
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(
        @RequestBody TransferRequestDTO request,
        Authentication authentication
    ) {
        try {
        	String srcAcc = accountNumberUtils.convertFormattedNumberToUuid(request.getSourceAccount());
        	String tgtACc = accountNumberUtils.convertFormattedNumberToUuid(request.getTargetAccount());
            TransactionDTO transaction = transactionService.processTransfer(
                srcAcc,
                tgtACc,
                request.getAmount(),
                request.getDescription(),
                authentication.getName()
            );
            return ResponseEntity.ok(transaction);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

	@GetMapping("/history")
	public ResponseEntity<List<TransactionDTO>> getTransactionHistory(Authentication authentication) {
		UserModel user = userRepo.findByUsername(authentication.getName())
		    .orElseThrow(() -> new RuntimeException("User not found"));

		List<TransactionDTO> transactions = transactionService.getUserTransactions(user.getId());
		return ResponseEntity.ok(transactions);
	}

    @GetMapping("/balance")
    public ResponseEntity<BigDecimal> getAccountBalance(Authentication authentication) {
        BigDecimal balance = transactionService.getAccountBalance(authentication.getName());
        return ResponseEntity.ok(balance);
    }

	@PostMapping("/deposit")
	public ResponseEntity<?> depositFunds(
		@RequestBody DepositWithdrawRequestDTO request,
		Authentication authentication
	) {
		try {
		    String accNumber = accountNumberUtils.convertFormattedNumberToUuid(request.getAccountNumber());

		    TransactionDTO transaction = transactionService.processDeposit(
		        accNumber,
		        request.getAmount(),
		        request.getDescription(),
		        authentication.getName()
		    );

		    BigDecimal newBalance = accountRepo.findByAccountNumber(accNumber)
		        .orElseThrow(() -> new RuntimeException("Account not found")).getBalance();

		    Map<String, Object> response = new HashMap<>();
		    response.put("transaction", transaction);
		    response.put("newBalance", newBalance);

		    return ResponseEntity.ok(response);
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
        	String accNumber = accountNumberUtils.convertFormattedNumberToUuid(request.getAccountNumber());
        	
            Map<String, Object> result = transactionService.processWithdrawal(
                accNumber,
                request.getAmount(),
                request.getDescription(),
                authentication.getName()
            );

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

	@GetMapping("/accounts/{accountNumber}")
	public ResponseEntity<Map<String, Object>> getAccountDetails(@PathVariable String accountNumber) {
		try {
		    String encodedAccountNumber = accountNumberUtils.convertFormattedNumberToUuid(accountNumber);
		    
		    AccountModel account = accountRepo.findByAccountNumber(encodedAccountNumber)
		        .orElseThrow(() -> new RuntimeException("Account not found"));

		    Map<String, Object> response = new HashMap<>();
		    response.put("accountNumber", account.getAccountNumber());
		    response.put("ownerName", account.getUser ().getUsername());

		    return ResponseEntity.ok(response);
		} catch (Exception e) {
		    System.err.println("Error retrieving account: " + e.getMessage());
		    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
		}
	}
}
