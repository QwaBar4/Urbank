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
