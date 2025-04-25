package QwaBar4.bank.Service;

import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Exception.TransactionLimitException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.HashMap;

@Service
public class TransactionService {

    private static final double DAILY_TRANSFER_LIMIT = 10000.00;

    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;
    private final UserModelRepository userRepo;

    @Autowired
    private final AnonymizationService anonymizationService;

    @Autowired
    private EncryptionService encryptionService;

    @Autowired
    public TransactionService(AccountModelRepository accountRepo,
                              TransactionModelRepository transactionRepo,
                              UserModelRepository userRepo,
                              AnonymizationService anonymizationService) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.anonymizationService = anonymizationService;
    }

    @Transactional
    public TransactionDTO processTransfer(String sourceAccount, String targetAccount,
                                          BigDecimal amount, String description, String username) {
        AccountModel source = accountRepo.findByAccountNumber(sourceAccount)
                .orElseThrow(() -> new RuntimeException("Source account not found"));

        if (!source.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized access to account");
        }

        AccountModel target = accountRepo.findByAccountNumber(targetAccount)
                .orElseThrow(() -> new RuntimeException("Target account not found"));

        if (source.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds");
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Transfer amount must be positive");
        }

        // Check daily transfer limit
        BigDecimal dailyTotal = transactionRepo.getDailyTransferTotal(sourceAccount, LocalDateTime.now());
        if (dailyTotal.add(amount).compareTo(BigDecimal.valueOf(DAILY_TRANSFER_LIMIT)) > 0) {
            throw new TransactionLimitException("Daily transfer limit exceeded");
        }

        // Deduct amount from source account
        source.setBalance(source.getBalance().subtract(amount));
        accountRepo.save(source);

        // Add amount to target account
        target.setBalance(target.getBalance().add(amount));
        accountRepo.save(target);

        // Create a single transaction
        TransactionModel transaction = new TransactionModel();
        transaction.setType("TRANSFER");
        transaction.setAmount(amount);
        transaction.setEncryptedDescription(encryptionService.encrypt(description));
        transaction.setSourceAccountNumber(anonymizationService.anonymize(sourceAccount));
        transaction.setTargetAccountNumber(anonymizationService.anonymize(targetAccount));
        transaction.setTimestamp(LocalDateTime.now());

        // Maintain relationships for business logic
        transaction.setSourceAccount(source);
        transaction.setTargetAccount(target);

        transactionRepo.save(transaction);
        return convertToDTO(transaction);
    }

    public List<TransactionDTO> getUserTransactions(Long userId) {
        UserModel user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<TransactionModel> transactions = transactionRepo.findBySourceAccountOrTargetAccountOrderByTimestampDesc(
                user.getAccount(), user.getAccount()
        );

        return transactions.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public BigDecimal getAccountBalance(String username) {
        UserModel user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getAccount().getBalance();
    }

	public List<TransactionDTO> getUserTransactionsById(Long userId) {
		// Fetch transactions using the existing method
		List<TransactionModel> transactions = transactionRepo.findBySourceAccountOrTargetAccountOrderByTimestampDesc(userId);

		return transactions.stream().map(transaction -> {
		    TransactionDTO dto = new TransactionDTO();
		    dto.setId(transaction.getId());
		    dto.setType(transaction.getType());
		    dto.setAmount(transaction.getAmount());
		    dto.setTimestamp(transaction.getTimestamp());

		    // Decrypt the description
		    String decryptedDescription = encryptionService.decrypt(transaction.getEncryptedDescription());
		    dto.setDescription(decryptedDescription);

		    // Deanonymize account numbers and fetch usernames
		    String deanonymizedSource = anonymizationService.deanonymize(transaction.getSourceAccountNumber());
		    String deanonymizedTarget = anonymizationService.deanonymize(transaction.getTargetAccountNumber());
		    dto.setSourceAccountOwner(getUsernameByAccountNumber(deanonymizedSource));
		    dto.setTargetAccountOwner(getUsernameByAccountNumber(deanonymizedTarget));

		    // Determine if the current user is the source of the transaction
		    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		    UserModel currentUser  = userRepo.findByUsername(authentication.getName())
		            .orElseThrow(() -> new RuntimeException("User  not found"));

		    boolean isOutgoing = transaction.getSourceAccountNumber() != null &&
		                         deanonymizedSource.equals(currentUser .getAccount().getAccountNumber());

		    // Adjust amount for display based on transaction type
		    if ("TRANSFER".equals(transaction.getType())) {
		        dto.setAmount(isOutgoing ? transaction.getAmount().negate() : transaction.getAmount());
		    } else {
		        dto.setAmount(transaction.getAmount());
		    }

		    return dto;
		}).collect(Collectors.toList());
	}

	private String getUsernameByAccountNumber(String accountNumber) {
		return accountRepo.findByAccountNumber(accountNumber)
		                  .map(account -> account.getUser ().getUsername())
		                  .orElse("Unknown");
	}

    public TransactionDTO processDeposit(String accountNumber, BigDecimal amount, String description, String username) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) { // Use compareTo for BigDecimal
            throw new RuntimeException("Deposit amount must be positive");
        }

        AccountModel account = accountRepo.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized deposit attempt");
        }

        account.setBalance(account.getBalance().add(amount)); // Use add for BigDecimal
        accountRepo.save(account);

        TransactionModel transaction = new TransactionModel();
        transaction.setType("DEPOSIT");
        transaction.setAmount(amount); // Ensure amount is BigDecimal
        transaction.setEncryptedDescription(encryptionService.encrypt(description));
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setTargetAccount(account);
        transactionRepo.save(transaction);

        return convertToDTO(transaction);
    }

    public Map<String, Object> processWithdrawal(String accountNumber, BigDecimal amount, String description, String username) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) { // Use compareTo for BigDecimal
            throw new RuntimeException("Withdrawal amount must be positive");
        }

        AccountModel account = accountRepo.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized withdrawal attempt");
        }

        if (account.getBalance().compareTo(amount) < 0) { // Use compareTo for BigDecimal
            throw new RuntimeException("Insufficient funds for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(amount)); // Use subtract for BigDecimal
        AccountModel updatedAccount = accountRepo.save(account);

        TransactionModel transaction = new TransactionModel();
        transaction.setType("WITHDRAWAL");
        transaction.setAmount(amount); // Ensure amount is BigDecimal
        transaction.setEncryptedDescription(encryptionService.encrypt(description));
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setSourceAccount(account);
        transactionRepo.save(transaction);

        Map<String, Object> response = new HashMap<>();
        response.put("transaction", convertToDTO(transaction));
        response.put("newBalance", updatedAccount.getBalance());

        return response;
    }

    private TransactionDTO convertToDTO(TransactionModel transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setTimestamp(transaction.getTimestamp());

        // Decrypt the description
        String decryptedDescription = encryptionService.decrypt(transaction.getEncryptedDescription());
        dto.setDescription(decryptedDescription);

        // Use anonymized account numbers
        dto.setSourceAccountNumber(transaction.getSourceAccountNumber());
        dto.setTargetAccountNumber(transaction.getTargetAccountNumber());

        // Use real usernames
        if (transaction.getSourceAccount() != null) {
            dto.setSourceAccountOwner(transaction.getSourceAccount().getUser().getUsername());
        }

        if (transaction.getTargetAccount() != null) {
            dto.setTargetAccountOwner(transaction.getTargetAccount().getUser().getUsername());
        }

        // Determine if the current user is the source of the transaction
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserModel currentUser = userRepo.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOutgoing = transaction.getSourceAccount() != null &&
                              transaction.getSourceAccount().getUser().getId().equals(currentUser.getId());

        // Adjust amount for display based on transaction type
        if ("TRANSFER".equals(transaction.getType())) {
            dto.setAmount(isOutgoing ? transaction.getAmount().negate() : transaction.getAmount());
        } else {
            dto.setAmount(transaction.getAmount());
        }

        return dto;
    }
}
