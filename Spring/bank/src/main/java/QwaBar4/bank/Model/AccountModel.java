package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonIgnore;
import QwaBar4.bank.Utils.AccountNumberUtils;

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
    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TransactionModel> outgoingTransactions;

    @OneToMany(fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TransactionModel> incomingTransactions;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAccountNumber() {
        return AccountNumberUtils.convertUuidToFormattedNumber(accountNumber);
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public BigDecimal getDailyTransferLimit() {
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(BigDecimal dailyTransferLimit) {
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public BigDecimal getDailyWithdrawalLimit() {
        return dailyWithdrawalLimit;
    }

    public void setDailyWithdrawalLimit(BigDecimal dailyWithdrawalLimit) {
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    public LocalDateTime getLastInterestCalculation() {
        return lastInterestCalculation;
    }

    public void setLastInterestCalculation(LocalDateTime lastInterestCalculation) {
        this.lastInterestCalculation = lastInterestCalculation;
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
