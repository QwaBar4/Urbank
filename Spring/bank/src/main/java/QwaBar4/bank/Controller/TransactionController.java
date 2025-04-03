package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;

import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.TransactionDTO;
import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Model.TransactionModel;
import QwaBar4.bank.Model.TransactionModelRepository;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;
    private final UserModelRepository userModelRepository;

    @Autowired
    public TransactionController(AccountModelRepository accountRepo,
                               TransactionModelRepository transactionRepo,
                               UserModelRepository userModelRepository) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userModelRepository = userModelRepository;
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transferMoney(
        @RequestBody TransferRequest request,
        Authentication authentication
    ) {
        // Find source account
        AccountModel source = accountRepo.findByAccountNumber(request.sourceAccount())
            .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        // Verify ownership
        if (!source.getUser().getUsername().equals(authentication.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Check balance
        if (source.getBalance() < request.amount()) {
            return ResponseEntity.badRequest().body("Insufficient funds");
        }

        // Find target account
        AccountModel target = accountRepo.findByAccountNumber(request.targetAccount())
            .orElseThrow(() -> new RuntimeException("Target account not found"));

        // Update balances
        source.setBalance(source.getBalance() - request.amount());
        target.setBalance(target.getBalance() + request.amount());
        
        // Save account updates
        accountRepo.save(source);
        accountRepo.save(target);
        
        // Create transaction record
        TransactionModel transaction = new TransactionModel();
        transaction.setType("TRANSFER");
        transaction.setAmount(request.amount());
        transaction.setSourceAccount(source);
        transaction.setTargetAccount(target);
        transaction.setTimestamp(LocalDateTime.now());
        
        transactionRepo.save(transaction);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/history")
    public ResponseEntity<List<TransactionDTO>> getTransactionHistory(Authentication authentication) {
        String username = authentication.getName();
        UserModel user = userModelRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<TransactionModel> transactions = transactionRepo.findBySourceAccountOrTargetAccountOrderByTimestampDesc(
                user.getAccount(), 
                user.getAccount()
        );

        List<TransactionDTO> transactionDTOs = transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(transactionDTOs);
    }

    private TransactionDTO convertToDTO(TransactionModel transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setDescription(transaction.getDescription());
        dto.setTimestamp(transaction.getTimestamp());
        
        if (transaction.getSourceAccount() != null) {
            dto.setSourceAccountNumber(transaction.getSourceAccount().getAccountNumber());
        }
        
        if (transaction.getTargetAccount() != null) {
            dto.setTargetAccountNumber(transaction.getTargetAccount().getAccountNumber());
        }
        
        return dto;
    }
    
    record TransferRequest(String sourceAccount, String targetAccount, double amount) {}
}
