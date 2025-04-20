package QwaBar4.bank.Service;

import QwaBar4.bank.Model.*;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Exception.TransactionLimitException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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


    public TransactionService(AccountModelRepository accountRepo,
                              TransactionModelRepository transactionRepo,
                              UserModelRepository userRepo) {
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
        this.userRepo = userRepo;
    }

	@Transactional
	public TransactionDTO processTransfer(String sourceAccount, String targetAccount,
		                                  BigDecimal amount, String description, String username) {
		AccountModel source = accountRepo.findByAccountNumber(sourceAccount)
		    .orElseThrow(() -> new RuntimeException("Source account not found"));

		if (!source.getUser ().getUsername().equals(username)) {
		    throw new RuntimeException("Unauthorized access to account");
		}

		AccountModel target = accountRepo.findByAccountNumber(targetAccount)
		    .orElseThrow(() -> new RuntimeException("Target account not found"));

		if (source.getBalance().compareTo(amount) < 0) {
		    throw new RuntimeException("Insufficient funds");
		}

		if (amount.compareTo(BigDecimal.valueOf(DAILY_TRANSFER_LIMIT)) > 0) {
		    throw new TransactionLimitException("Exceeds daily transfer limit");
		}

		source.setBalance(source.getBalance().subtract(amount)); 
		target.setBalance(target.getBalance().add(amount)); 

		accountRepo.save(source);
		accountRepo.save(target);

		TransactionModel transaction = new TransactionModel();
		transaction.setType("TRANSFER");
		transaction.setAmount(amount);
		transaction.setUser (source.getUser ());
		transaction.setSourceAccount(source);
		transaction.setTargetAccount(target);
		transaction.setDescription(description);
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

	public BigDecimal getAccountBalance(String username) {
		UserModel user = userRepo.findByUsername(username)
		    .orElseThrow(() -> new RuntimeException("User  not found"));
		return user.getAccount().getBalance();
	}

    
	public List<TransactionDTO> getUserTransactionsById(Long userId) {
		UserModel user = userRepo.findById(userId)
		    .orElseThrow(() -> new RuntimeException("User  not found"));
		
		List<TransactionModel> transactions = transactionRepo.findByUser (user);
		
		return transactions.stream()
		    .map(this::convertToDTO)
		    .collect(Collectors.toList());
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
		transaction.setUser(account.getUser());
		transaction.setDescription(description);
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
		transaction.setUser(account.getUser());
		transaction.setDescription(description);
		transaction.setTimestamp(LocalDateTime.now());
		transaction.setSourceAccount(account);
		transactionRepo.save(transaction);

		Map<String, Object> response = new HashMap<>();
		response.put("transaction", convertToDTO(transaction));
		response.put("new Balance", updatedAccount.getBalance());

		return response;
	}
    


	private TransactionDTO convertToDTO(TransactionModel transaction) {
		TransactionDTO dto = new TransactionDTO();
		dto.setId(transaction.getId());
		dto.setType(transaction.getType());
		dto.setAmount(transaction.getAmount());
		dto.setTimestamp(transaction.getTimestamp());
		dto.setDescription(transaction.getDescription());

		if (transaction.getUser () != null) {
		    dto.setUser (transaction.getUser ().getUsername());
		} else {
		    dto.setUser ("System Transaction");
		}

		if (transaction.getSourceAccount() != null) {
		    dto.setSourceAccountNumber(transaction.getSourceAccount().getAccountNumber());
		    dto.setSourceAccountOwner(transaction.getSourceAccount().getUser ().getUsername());
		}

		if (transaction.getTargetAccount() != null) {
		    dto.setTargetAccountNumber(transaction.getTargetAccount().getAccountNumber());
		    dto.setTargetAccountOwner(transaction.getTargetAccount().getUser ().getUsername());

		    String targetAccountName = transaction.getTargetAccount().getUser ().getUsername();
		    dto.setTransferDescription("Transfer to account: " + targetAccountName);
		}

		return dto;
	}
	
}
