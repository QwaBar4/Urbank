package QwaBar4.bank.DTO;

import java.math.BigDecimal;


public class AccountDTO {
    private Long id;
    private String accountNumber;
    private BigDecimal balance;
    private BigDecimal dailyTransferLimit;
    private BigDecimal dailyWithdrawalLimit;

    // Default constructor
    public AccountDTO() {}

    // Parameterized constructor
    public AccountDTO(Long id, String accountNumber, BigDecimal balance,
                     BigDecimal dailyTransferLimit, BigDecimal dailyWithdrawalLimit) {
        this.id = id;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.dailyTransferLimit = dailyTransferLimit;
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }

    // Getters and setters
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
}
