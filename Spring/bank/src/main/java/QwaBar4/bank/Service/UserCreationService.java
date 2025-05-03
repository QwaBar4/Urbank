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

@Service
public class UserCreationService {

    private final UserModelRepository userRepo;
    private final PasswordEncoder encoder;
    private final AccountModelRepository accountRepo;

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
        // Normalize inputs
        String normalizedUsername = username.trim().toLowerCase();
        String normalizedEmail = email.trim().toLowerCase();

        // Validate inputs
        validateUserInputs(normalizedUsername, normalizedEmail, password);

        // Create account
        AccountModel account = createAccount();

        // Create user with only required fields
        UserModel user = createBasicUser(normalizedUsername, normalizedEmail, password, account);

        // Save entities
        accountRepo.save(account);
        return userRepo.save(user);
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

        if (password.length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters");
        }
    }

    private AccountModel createAccount() {
        AccountModel account = new AccountModel();
        account.setAccountNumber("ACC-" + UUID.randomUUID());
        account.setBalance(BigDecimal.ZERO);
        return account;
    }

    private UserModel createBasicUser(String username, String email, String password, AccountModel account) {
        UserModel user = new UserModel();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(encoder.encode(password));
        user.setAccount(account);
        user.setActive(true);
        user.getRoles().add("USER");
        
        // Set all other fields to null (they're now nullable)
        user.setFirstName(null);
        user.setLastName(null);
        user.setMiddleName(null);
        user.setPassportSeries(null);
        user.setPassportNumber(null);
        user.setDateOfBirth(null);
        
        account.setUser(user); // Bidirectional link
        return user;
    }

    private boolean isValidEmail(String email) {
        String regex = "^[A-Za-z0-9+_.-]+@(.+)$";
        return Pattern.compile(regex).matcher(email).matches();
    }
}
