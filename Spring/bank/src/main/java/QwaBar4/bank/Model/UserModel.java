package QwaBar4.bank.Model;

import jakarta.persistence.*;
import org.hibernate.annotations.DynamicUpdate;

@Entity
@Table(name = "users")
@DynamicUpdate
public class UserModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;
    private String email;
    
    
    @Column(name = "password", nullable = false)
    private String password;

    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private AccountModel account;

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public AccountModel getAccount() {
        return account;
    }

    public void setAccount(AccountModel account) {
        if (account == null) {
            if (this.account != null) {
                this.account.setUser(null);
            }
        } else {
            account.setUser(this);
        }
        this.account = account;
    }
}
