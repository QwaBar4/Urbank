package QwaBar4.bank.Service;

import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.Arrays;
import java.util.List;

@Service
public class UserCreationService {

    private final UserModelRepository userRepo;
    private final PasswordEncoder encoder;
    private final AccountModelRepository accountRepo;

    // Common weak passwords to check against
    private static final List<String> COMMON_PASSWORDS = Arrays.asList(
        "password", "123456", "123456789", "12345678", "12345", "1234567",
        "qwerty", "abc123", "password123", "admin", "letmein", "welcome",
        "monkey", "1234567890", "dragon", "123123", "111111", "000000"
    );

    @Autowired
    public UserCreationService(UserModelRepository userRepo,
                              PasswordEncoder encoder,
                              AccountModelRepository accountRepo) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.accountRepo = accountRepo;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public UserModel createUserTransaction(String username, String email, String password) {

        String normalizedUsername = username.trim().toLowerCase();
        String normalizedEmail = email.trim().toLowerCase();
        validateUserInputs(normalizedUsername, normalizedEmail, password);

        AccountModel account = new AccountModel();
        account.setAccountNumber("ACC-" + UUID.randomUUID());
        account.setBalance(BigDecimal.ZERO);

        UserModel user = createBasicUser(normalizedUsername, normalizedEmail, password, account);

        user = userRepo.save(user); 
        return user;
    }

    private void validateUserInputs(String username, String email, String password) {
        if (userRepo.existsByUsernameIgnoreCase(username)) {
            throw new IllegalArgumentException("Username already exists");
        }

        if (userRepo.existsByEmailIgnoreCase(email)) {
            throw new IllegalArgumentException("Email already exists");
        }

        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Invalid email format");
        }

        validatePasswordStrength(password);
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }

        // Check for uppercase letter
        if (!Pattern.compile("[A-Z]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }

        // Check for lowercase letter
        if (!Pattern.compile("[a-z]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }

        // Check for digit
        if (!Pattern.compile("\\d").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one number");
        }

        // Check for special character
        if (!Pattern.compile("[!@#$%^&*(),.?\":{}|<>]").matcher(password).find()) {
            throw new IllegalArgumentException("Password must contain at least one special character");
        }

        // Check against common passwords
        String lowerPassword = password.toLowerCase();
        for (String commonPassword : COMMON_PASSWORDS) {
            if (lowerPassword.contains(commonPassword)) {
                throw new IllegalArgumentException("Password contains common patterns and is not secure");
            }
        }

        // Check for sequential characters
        if (hasSequentialChars(password)) {
            throw new IllegalArgumentException("Password should not contain sequential characters");
        }
    }

    private boolean hasSequentialChars(String password) {
        String lower = password.toLowerCase();
        for (int i = 0; i < lower.length() - 2; i++) {
            char c1 = lower.charAt(i);
            char c2 = lower.charAt(i + 1);
            char c3 = lower.charAt(i + 2);
            
            // Check for sequential letters or numbers
            if ((c1 + 1 == c2 && c2 + 1 == c3) || (c1 - 1 == c2 && c2 - 1 == c3)) {
                return true;
            }
        }
        return false;
    }

    private UserModel createBasicUser(String username, String email, String password, AccountModel account) {
        UserModel user = new UserModel();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setActive(true);
        user.getRoles().add("USER");
        user.setAccount(account);
        account.setUser(user);
        
        user.setFirstName(null);
        user.setLastName(null);
        user.setMiddleName(null); 
        user.setPassportSeries(null);
        user.setPassportNumber(null);
        user.setDateOfBirth(null);
        
        return user;
    }

    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.compile(regex).matcher(email).matches();
    }
}
