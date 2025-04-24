package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class TransactionModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;

    private LocalDateTime timestamp;

    @ManyToOne
    @JoinColumn(name = "source_account_id")
    private AccountModel sourceAccount;

    @ManyToOne
    @JoinColumn(name = "target_account_id")
    private AccountModel targetAccount;

    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "encrypted_description", columnDefinition = "TEXT")
    private String encryptedDescription;

    @Column(name = "source_account_number")
    private String sourceAccountNumber;

    @Column(name = "target_account_number")
    private String targetAccountNumber;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public AccountModel getSourceAccount() {
        return sourceAccount;
    }

    public void setSourceAccount(AccountModel sourceAccount) {
        this.sourceAccount = sourceAccount;
    }

    public AccountModel getTargetAccount() {
        return targetAccount;
    }

    public void setTargetAccount(AccountModel targetAccount) {
        this.targetAccount = targetAccount;
    }

    public String getEncryptedDescription() { 
        return encryptedDescription;
    }
    
    public void setEncryptedDescription(String encryptedDescription) {
        this.encryptedDescription = encryptedDescription;
    }
    
    public String getSourceAccountNumber() { 
        return sourceAccountNumber; 
    }
    
    public void setSourceAccountNumber(String sourceAccountNumber) { 
        this.sourceAccountNumber = sourceAccountNumber; 
    }
    
    public String getTargetAccountNumber() { 
        return targetAccountNumber; 
    }
    
    public void setTargetAccountNumber(String targetAccountNumber) { 
        this.targetAccountNumber = targetAccountNumber; 
    }
}
