package QwaBar4.bank.DTO;

import java.time.LocalDateTime;

public class AdminUserDTO extends UserDTO {
    private LocalDateTime createdAt;
    private LocalDateTime lastLogin;
    private boolean locked;

    public AdminUserDTO() {
        super();
    }

    public AdminUserDTO(Long id, String username, String email,
                        String accountNumber, Double balance, boolean active,
                        LocalDateTime createdAt, LocalDateTime lastLogin, boolean locked) {
        super(id, username, email, accountNumber, balance, active);
        this.createdAt = createdAt;
        this.lastLogin = lastLogin;
        this.locked = locked;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean isLocked() {
        return locked;
    }

    public void setLocked(boolean locked) {
        this.locked = locked;
    }
}
