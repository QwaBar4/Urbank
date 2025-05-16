package QwaBar4.bank.Service;

import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Exception.TransactionLimitException;
import QwaBar4.bank.Utils.AccountNumberUtils;
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
    private final AnonymizationService anonymizationService;
    private final EncryptionService encryptionService;
    private final AccountNumberUtils accountNumberUtils;

    @Autowired
    public TransactionService(AccountModelRepository accountRepo,
                              TransactionModelRepository transactionRepo,
                              UserModelRepository userRepo,
                              AnonymizationService anonymizationService,
                              EncryptionService encryptionService,
                              AccountNumberUtils accountNumberUtils) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
        this.anonymizationService = anonymizationService;
        this.encryptionService = encryptionService;
        this.accountNumberUtils = accountNumberUtils;
    }

    @Transactional
    public TransactionDTO processTransfer(String sourceAccount, String targetAccount, BigDecimal amount, String description, String username) {
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

        transactionRepo.save(transaction);
        return convertToDTO(transaction);
    }

    public List<TransactionDTO> getUserTransactions(Long userId) {
        UserModel user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
		
        String userAccountNumber = accountNumberUtils.convertFormattedNumberToUuid(user.getAccount().getAccountNumber());
        String anonymizedAccount = anonymizationService.anonymize(userAccountNumber);

        List<TransactionModel> transactions = transactionRepo.findBySourceAccountOrTargetAccountOrderByTimestampDesc(
                anonymizedAccount,
                anonymizedAccount
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
		UserModel user = userRepo.findById(userId)
		        .orElseThrow(() -> new RuntimeException("User not found"));
		        
		String formattedAccountNumber = user.getAccount().getAccountNumber();
		String accountNumber = accountNumberUtils.convertFormattedNumberToUuid(formattedAccountNumber);
		String anonymizedAccount = anonymizationService.anonymize(accountNumber);

		List<TransactionModel> transactions = transactionRepo.findByAccountNumbers(anonymizedAccount);

		return transactions.stream().map(transaction -> {
		    String source = anonymizationService.deanonymize(transaction.getSourceAccountNumber());
		    String target = anonymizationService.deanonymize(transaction.getTargetAccountNumber());

		    TransactionDTO dto = new TransactionDTO();
		    dto.setId(transaction.getId());
		    dto.setType(transaction.getType());
		    dto.setAmount(transaction.getAmount());
		    dto.setTimestamp(transaction.getTimestamp());
		    dto.setDescription(encryptionService.decrypt(transaction.getEncryptedDescription()));
		    dto.setSourceAccountNumber(source);
		    dto.setTargetAccountNumber(target);

		    // Fetch real usernames using deanonymized account numbers
		    dto.setSourceAccountOwner(getUsernameByAccountNumber(source));
		    dto.setTargetAccountOwner(getUsernameByAccountNumber(target));

		    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		    UserModel currentUser = userRepo.findByUsername(authentication.getName())
		            .orElseThrow(() -> new RuntimeException("User not found"));

		    boolean isOutgoing = transaction.getSourceAccountNumber() != null &&
		            source.equals(currentUser.getAccount().getAccountNumber());

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
		        .map(account -> account.getUser().getUsername())
		        .orElse("Unknown");
	}

    public TransactionDTO processDeposit(String accountNumber, BigDecimal amount, String description, String username) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Deposit amount must be positive");
        }

        AccountModel account = accountRepo.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized deposit attempt");
        }

        account.setBalance(account.getBalance().add(amount));
        accountRepo.save(account);

        TransactionModel transaction = new TransactionModel();
        transaction.setType("DEPOSIT");
        transaction.setAmount(amount);
        transaction.setEncryptedDescription(encryptionService.encrypt(description));
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setTargetAccountNumber(anonymizationService.anonymize(accountNumber));
        transactionRepo.save(transaction);

        return convertToDTO(transaction);
    }

    public Map<String, Object> processWithdrawal(String accountNumber, BigDecimal amount, String description, String username) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Withdrawal amount must be positive");
        }

        AccountModel account = accountRepo.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        if (!account.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Unauthorized withdrawal attempt");
        }

        if (account.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient funds for withdrawal");
        }

        account.setBalance(account.getBalance().subtract(amount));
        AccountModel updatedAccount = accountRepo.save(account);

        TransactionModel transaction = new TransactionModel();
        transaction.setType("WITHDRAWAL");
        transaction.setAmount(amount);
        transaction.setEncryptedDescription(encryptionService.encrypt(description));
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setSourceAccountNumber(anonymizationService.anonymize(accountNumber));
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

        String decryptedDescription = encryptionService.decrypt(transaction.getEncryptedDescription());
        dto.setDescription(decryptedDescription);

        String sourceAccount = transaction.getSourceAccountNumber() != null ?
                accountNumberUtils.convertUuidToFormattedNumber(anonymizationService.deanonymize(transaction.getSourceAccountNumber())) : null;
        String targetAccount = transaction.getTargetAccountNumber() != null ?
                accountNumberUtils.convertUuidToFormattedNumber(anonymizationService.deanonymize(transaction.getTargetAccountNumber())) : null;

        dto.setSourceAccountNumber(sourceAccount);
        dto.setTargetAccountNumber(targetAccount);

        dto.setSourceAccountOwner(getUsernameByAccountNumber(anonymizationService.deanonymize(transaction.getSourceAccountNumber())));
        dto.setTargetAccountOwner(getUsernameByAccountNumber(anonymizationService.deanonymize(transaction.getTargetAccountNumber())));

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserModel currentUser = userRepo.findByUsername(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isOutgoing = sourceAccount != null &&
                sourceAccount.equals(currentUser.getAccount().getAccountNumber());

        if ("TRANSFER".equals(transaction.getType())) {
            dto.setAmount(isOutgoing ? transaction.getAmount().negate() : transaction.getAmount());
        } else {
            dto.setAmount(transaction.getAmount());
        }

        return dto;
    }
}
