package QwaBar4.bank.DTO;

import java.math.BigDecimal;

public class UserDTO {
    private Long id;
    private String username;
    private String email;
    private String accountNumber;
    private BigDecimal balance;
    private boolean active;


    public UserDTO() {}

    public UserDTO(Long id, String username, String email,
                   String accountNumber, BigDecimal balance, boolean active) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.accountNumber = accountNumber;
        this.balance = balance;
        this.active = active;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
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

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
