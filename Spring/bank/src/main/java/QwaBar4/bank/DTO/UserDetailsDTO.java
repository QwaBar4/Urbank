package QwaBar4.bank.DTO;

import java.util.Set;

public class UserDetailsDTO extends UserDTO {
    private Set<String> roles;

    public UserDetailsDTO() {
        super();
    }

    public UserDetailsDTO(Long id, String username, String email, 
                        String accountNumber, Double balance, 
                        boolean active, Set<String> roles) {
        super(id, username, email, accountNumber, balance, active);
        this.roles = roles;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
