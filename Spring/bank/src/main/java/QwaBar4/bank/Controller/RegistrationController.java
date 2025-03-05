package QwaBar4.bank.Controller;

import java.util.Map;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import QwaBar4.bank.Model.AccountModel;
import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
public class RegistrationController {
    private final UserModelRepository userRepo;
    private final PasswordEncoder encoder;
    private final AccountModelRepository accountRepo;

    @Autowired
    public RegistrationController(UserModelRepository userRepo, PasswordEncoder encoder, AccountModelRepository accountRepo) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.accountRepo = accountRepo;
    }

    @Transactional
    @PostMapping("/req/signup")
    public ResponseEntity<?> createUser(@RequestBody UserModel user) {
        String username = user.getUsername().trim();
        String email = user.getEmail().trim().toLowerCase();

        // Atomic check using database constraints
        try {
            UserModel newUser = new UserModel();
            newUser.setUsername(username); // Store original case
            newUser.setEmail(email);
            newUser.setPassword(encoder.encode(user.getPassword()));

            AccountModel account = new AccountModel();
            account.setAccountNumber("ACC-" + UUID.randomUUID());
            account.setBalance(0.0);
            newUser.setAccount(account);

            userRepo.saveAndFlush(newUser); // Force immediate DB write
            return ResponseEntity.ok(Map.of("message", "User created"));
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Username/email already exists"));
        }
    }
}
