package QwaBar4.bank.DTO;

public class AccountDTO {
    private Long id;
    private String accountNumber;
    private Double balance;
    private Double dailyTransferLimit;
    private Double dailyWithdrawalLimit;

    // Default constructor
    public AccountDTO() {}

    // Parameterized constructor
    public AccountDTO(Long id, String accountNumber, Double balance,
                     Double dailyTransferLimit, Double dailyWithdrawalLimit) {
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

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }

    public Double getDailyTransferLimit() {
        return dailyTransferLimit;
    }

    public void setDailyTransferLimit(Double dailyTransferLimit) {
        this.dailyTransferLimit = dailyTransferLimit;
    }

    public Double getDailyWithdrawalLimit() {
        return dailyWithdrawalLimit;
    }

    public void setDailyWithdrawalLimit(Double dailyWithdrawalLimit) {
        this.dailyWithdrawalLimit = dailyWithdrawalLimit;
    }
}
