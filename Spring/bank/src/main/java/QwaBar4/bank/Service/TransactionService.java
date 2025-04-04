package QwaBar4.bank.Service;

import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;
    private final UserModelRepository userRepo;

    public TransactionService(AccountModelRepository accountRepo,
                            TransactionModelRepository transactionRepo,
                            UserModelRepository userRepo) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public TransactionDTO processTransfer(String sourceAccount, String targetAccount, 
                                        double amount, String username) {
        // Validate accounts
        AccountModel source = accountRepo.findByAccountNumber(sourceAccount)
            .orElseThrow(() -> new RuntimeException("Source account not found"));
        
        if (!source.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        AccountModel target = accountRepo.findByAccountNumber(targetAccount)
            .orElseThrow(() -> new RuntimeException("Target account not found"));

        // Validate balance
        if (source.getBalance() < amount) {
            throw new RuntimeException("Insufficient funds");
        }

        // Update balances
        source.setBalance(source.getBalance() - amount);
        target.setBalance(target.getBalance() + amount);
        
        // Save accounts
        accountRepo.save(source);
        accountRepo.save(target);
        
        // Create transaction record
        TransactionModel transaction = new TransactionModel();
        transaction.setType("TRANSFER");
        transaction.setAmount(amount);
        transaction.setSourceAccount(source);
        transaction.setTargetAccount(target);
        transaction.setTimestamp(LocalDateTime.now());
        transaction = transactionRepo.save(transaction);
        
        return convertToDTO(transaction);
    }

    public List<TransactionDTO> getUserTransactions(String username) {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<TransactionModel> transactions = transactionRepo
            .findBySourceAccountOrTargetAccountOrderByTimestampDesc(
                user.getAccount(), 
                user.getAccount()
            );
        
        return transactions.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public Double getAccountBalance(String username) {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getAccount().getBalance();
    }

    private TransactionDTO convertToDTO(TransactionModel transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setTimestamp(transaction.getTimestamp());
        
        if (transaction.getSourceAccount() != null) {
            dto.setSourceAccountNumber(transaction.getSourceAccount().getAccountNumber());
        }
        
        if (transaction.getTargetAccount() != null) {
            dto.setTargetAccountNumber(transaction.getTargetAccount().getAccountNumber());
        }
        
        return dto;
    }
}
