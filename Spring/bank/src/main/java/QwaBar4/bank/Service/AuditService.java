package QwaBar4.bank.Service;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import QwaBar4.bank.Service.TransactionService;

@Service
public class AuditService {


    /**
     * Logs a transaction attempt.
     *
     * @param account     the account involved in the transaction
     * @param type        the type of transaction (e.g., TRANSFER, DEPOSIT)
     * @param amount      the amount involved in the transaction
     * @param username    the username of the user performing the transaction
     */
    public void logTransactionAttempt(String account, TransactionType type, double amount, String username) {
        // Log to console (for demonstration purposes)
        System.out.println("Audit Log - Account: " + account +
                           ", Type: " + type +
                           ", Amount: " + amount +
                           ", Username: " + username +
                           ", Timestamp: " + LocalDateTime.now());

    }
}
