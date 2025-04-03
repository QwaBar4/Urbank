package QwaBar4.bank.DTO;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class DashboardDTO {
    private String username;
    private AccountSummaryDTO account;

    public DashboardDTO() {}

    public DashboardDTO(String username, AccountSummaryDTO account) {
        this.username = username;
        this.account = account;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public AccountSummaryDTO getAccount() {
        return account;
    }

    public void setAccount(AccountSummaryDTO account) {
        this.account = account;
    }
}
