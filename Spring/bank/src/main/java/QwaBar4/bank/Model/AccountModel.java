package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "accounts")
public class AccountModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountNumber;

	@Column(precision = 19, scale = 2)
	private BigDecimal balance;

	@Column(precision = 19, scale = 2)
	private BigDecimal dailyTransferLimit = new BigDecimal("10000.00");

	@Column(precision = 19, scale = 2)
	private BigDecimal dailyWithdrawalLimit = new BigDecimal("2000.00");

    @Column(name = "daily_transfer_total", precision = 19, scale = 2)
    private BigDecimal dailyTransferTotal = BigDecimal.ZERO;

    @Column(name = "daily_withdrawal_total", precision = 19, scale = 2)
    private BigDecimal dailyWithdrawalTotal = BigDecimal.ZERO;

    @Column(name = "last_interest_calculation")
    private LocalDateTime lastInterestCalculation;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore 
    private UserModel user;

    @OneToMany(mappedBy = "sourceAccount", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TransactionModel> outgoingTransactions;

    @OneToMany(mappedBy = "targetAccount", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TransactionModel> incomingTransactions;

    // Business methods
    public void deposit(Double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance = this.balance.add(BigDecimal.valueOf(amount)); // Convert to BigDecimal
    }

    public void withdraw(Double amount) {
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (BigDecimal.valueOf(amount).compareTo(this.balance) > 0) { // Compare BigDecimal
            throw new IllegalArgumentException("Insufficient funds");
        }
        this.balance = this.balance.subtract(BigDecimal.valueOf(amount)); // Convert to BigDecimal
    }

    public void applyDailyInterest(double annualRate) {
        BigDecimal dailyInterest = this.balance.multiply(BigDecimal.valueOf(annualRate / 36500)); // Divide by 100 for percentage
        this.balance = this.balance.add(dailyInterest);
        this.lastInterestCalculation = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() { // Change to BigDecimal
        return balance;
    }

    public void setBalance(BigDecimal balance) { // Change to BigDecimal
        this.balance = balance;
    }

    public BigDecimal getDailyTransferLimit() { // Change to BigDecimal
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(BigDecimal dailyTransferLimit) { // Change to BigDecimal
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public BigDecimal getDailyWithdrawalLimit() { // Change to BigDecimal
        return dailyWithdrawalLimit;
    }

    public void setDailyWithdrawalLimit(BigDecimal dailyWithdrawalLimit) { // Change to BigDecimal
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    public LocalDateTime getLastInterestCalculation() {
        return lastInterestCalculation;
    }

    public UserModel getUser() {
        return user;
    }

    public void setUser(UserModel user) {
        this.user = user;
    }

    public List<TransactionModel> getOutgoingTransactions() {
        return outgoingTransactions;
    }

    public List<TransactionModel> getIncomingTransactions() {
        return incomingTransactions;
    }
    
    public void setLastInterestCalculation(LocalDateTime timestamp) {
		this.lastInterestCalculation = timestamp;
	}
    
}
