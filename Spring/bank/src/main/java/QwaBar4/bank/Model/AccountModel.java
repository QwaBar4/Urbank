package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;

@Entity
@Table(name = "accounts")
public class AccountModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String accountNumber;
    private Double balance; // Change to Double

    @Column(nullable = false)
    private Double dailyTransferLimit = 10000.0; // Default $10k limit

    @Column(nullable = false)
    private Double dailyWithdrawalLimit = 2000.0; // Change to Double

    @Column(name = "last_interest_calculation")
    private LocalDateTime lastInterestCalculation;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore 
    private UserModel user;
    
    @OneToMany(mappedBy = "sourceAccount")
    @JsonIgnore
    private List<TransactionModel> outgoingTransactions;
    
    @OneToMany(mappedBy = "targetAccount")
    @JsonIgnore
    private List<TransactionModel> incomingTransactions;

    // Business methods
    public void deposit(Double amount) { // Change to Double
        if (amount <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }
        this.balance += amount;
    }

    public void withdraw(Double amount) { // Change to Double
        if (amount <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }
        if (amount > balance) {
            throw new IllegalArgumentException("Insufficient funds");
        }
        this.balance -= amount;
    }

    public void applyDailyInterest(double annualRate) {
        double dailyInterest = this.balance * (annualRate / 36500); // Divide by 100 for percentage
        this.balance += dailyInterest;
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

    public Double getBalance() { // Change to Double
        return balance;
    }

    public void setBalance(Double balance) { // Change to Double
        this.balance = balance;
    }

    public Double getDailyTransferLimit() { // Change to Double
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(Double dailyTransferLimit) { // Change to Double
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public Double getDailyWithdrawalLimit() { // Change to Double
        return dailyWithdrawalLimit;
    }

    public void setDailyWithdrawalLimit(Double dailyWithdrawalLimit) { // Change to Double
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    public LocalDateTime getLastInterestCalculation() {
        return lastInterestCalculation;
    }

    public UserModel getUser () {
        return user;
    }

    public void setUser (UserModel user) {
        this.user = user;
    }

    public List<TransactionModel> getOutgoingTransactions() {
        return outgoingTransactions;
    }

    public List<TransactionModel> getIncomingTransactions() {
        return incomingTransactions;
    }
}
