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
    private String description;
    private LocalDateTime timestamp;
    
    @ManyToOne
    @JoinColumn(name = "source_account_id")
    private AccountModel sourceAccount;
    
    @ManyToOne
    @JoinColumn(name = "target_account_id")
    private AccountModel targetAccount;
    
    @Column(precision = 19, scale = 2)
    private BigDecimal amount;

    @ManyToOne
    @JoinColumn(name = "user_id") 
    private UserModel user;

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

    public BigDecimal getAmount() { // Change to BigDecimal
        return amount;
    }

    public void setAmount(BigDecimal amount) { // Change to BigDecimal
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
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

    public UserModel getUser () {
        return user;
    }

    public void setUser (UserModel user) {
        this.user = user;
    }
}
