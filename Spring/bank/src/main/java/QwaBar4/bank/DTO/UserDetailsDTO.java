package QwaBar4.bank.DTO;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;
import javax.validation.constraints.Past;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

public class UserDetailsDTO extends UserDTO {
    @NotBlank
    @Size(max = 50)
    private String firstName;

    @NotBlank
    @Size(max = 50)
    private String lastName;

    @Size(max = 50)
    private String middleName;

    @Pattern(regexp = "^[A-Z0-9]{4}$")
    private String passportSeries;

    @Pattern(regexp = "^[A-Z0-9]{6}$")
    private String passportNumber;

    @Past
    private LocalDate dateOfBirth;

    private Set<String> roles;

    public UserDetailsDTO() {
        super();
    }

    public UserDetailsDTO(Long id,
                         String username,
                         String email,
                         String accountNumber,
                         BigDecimal balance,
                         boolean active,
                         Set<String> roles,
                         String firstName,
                         String lastName,
                         String middleName,
                         String passportSeries,
                         String passportNumber,
                         LocalDate dateOfBirth) {
        super(id, username, email, accountNumber, balance, active);
        this.roles = roles;
        this.firstName = firstName;
        this.lastName = lastName;
        this.middleName = middleName;
        this.passportSeries = passportSeries;
        this.passportNumber = passportNumber;
        this.dateOfBirth = dateOfBirth;
    }

    public static class Builder {
        private Long id;
        private String username;
        private String email;
        private String accountNumber;
        private BigDecimal balance;
        private boolean active;
        private Set<String> roles;
        private String firstName;
        private String lastName;
        private String middleName;
        private String passportSeries;
        private String passportNumber;
        private LocalDate dateOfBirth;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder accountNumber(String accountNumber) {
            this.accountNumber = accountNumber;
            return this;
        }

        public Builder balance(BigDecimal balance) {
            this.balance = balance;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Builder roles(Set<String> roles) {
            this.roles = roles;
            return this;
        }

        public Builder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public Builder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public Builder middleName(String middleName) {
            this.middleName = middleName;
            return this;
        }

        public Builder passportSeries(String passportSeries) {
            this.passportSeries = passportSeries;
            return this;
        }

        public Builder passportNumber(String passportNumber) {
            this.passportNumber = passportNumber;
            return this;
        }

        public Builder dateOfBirth(LocalDate dateOfBirth) {
            this.dateOfBirth = dateOfBirth;
            return this;
        }

        public UserDetailsDTO build() {
            return new UserDetailsDTO(id, username, email, accountNumber, balance, active, roles, firstName, lastName, middleName, passportSeries, passportNumber, dateOfBirth);
        }
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getMiddleName() {
        return middleName;
    }

    public void setMiddleName(String middleName) {
        this.middleName = middleName;
    }

    public String getPassportSeries() {
        return passportSeries;
    }

    public void setPassportSeries(String passportSeries) {
        this.passportSeries = passportSeries;
    }

    public String getPassportNumber() {
        return passportNumber;
    }

    public void setPassportNumber(String passportNumber) {
        this.passportNumber = passportNumber;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
}
