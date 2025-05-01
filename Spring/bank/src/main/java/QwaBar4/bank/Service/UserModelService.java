package QwaBar4.bank.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.Model.UserModel;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.authentication.DisabledException;
import java.util.Collection;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.TransactionModelRepository;
import QwaBar4.bank.Model.TransactionModel;
import QwaBar4.bank.DTO.*;
import java.math.BigDecimal;


import java.util.Collections;

@Service
public class UserModelService implements UserDetailsService {

    private final UserModelRepository userRepo;
    private final AccountModelRepository accountRepo;
    private final TransactionModelRepository transactionRepo;

    @Autowired
    public UserModelService(UserModelRepository userRepo, AccountModelRepository accountRepo, TransactionModelRepository transactionRepo) {
        this.userRepo = userRepo;
        this.accountRepo = accountRepo;
        this.transactionRepo = transactionRepo;
    }

    public boolean existsByUsernameIgnoreCase(String username) {
        return userRepo.existsByUsernameIgnoreCase(username);
    }

    @Transactional
    public void deleteByUsername(String username) {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Retrieve transactions by the user's account number
        List<TransactionModel> transactions = transactionRepo.findBySourceAccountNumber(user.getAccount().getAccountNumber());
        transactions.addAll(transactionRepo.findByTargetAccountNumber(user.getAccount().getAccountNumber()));

        // Delete all transactions associated with the user
        transactionRepo.deleteAll(transactions);

        if (user.getAccount() != null) {
            accountRepo.delete(user.getAccount());
        }

        userRepo.delete(user);
    }

    public boolean existsByEmailIgnoreCase(String email) {
        return userRepo.existsByEmailIgnoreCase(email);
    }

    public List<UserDTO> getAllUsers() {
        return userRepo.findAll().stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }

    public void lockUser(Long userId) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepo.save(user);
    }

    public UserDetailsDTO getUserDetails(Long userId) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        return new UserDetailsDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAccount() != null ? user.getAccount().getAccountNumber() : null,
            user.getAccount() != null ? user.getAccount().getBalance() : BigDecimal.ZERO,
            user.isActive(),
            user.getRoles()
        );
    }

    @Transactional
    public UserDetailsDTO updateUserDetails(Long userId, UserUpdateDTO userUpdateDTO) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        // Update basic info
        if (userUpdateDTO.getUsername() != null) {
            user.setUsername(userUpdateDTO.getUsername());
        }
        if (userUpdateDTO.getEmail() != null) {
            user.setEmail(userUpdateDTO.getEmail());
        }

        // Update roles if provided
        if (userUpdateDTO.getRoles() != null) {
            user.getRoles().clear();
            user.getRoles().addAll(userUpdateDTO.getRoles());
        }

        UserModel updatedUser = userRepo.save(user);
        return convertToDetailsDTO(updatedUser);
    }

    private UserDetailsDTO convertToDetailsDTO(UserModel user) {
        return new UserDetailsDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAccount() != null ? user.getAccount().getAccountNumber() : null,
            user.getAccount() != null ? user.getAccount().getBalance() : BigDecimal.ZERO,
            user.isActive(),
            user.getRoles()
        );
    }

    public UserDTO convertToDTO(UserModel user) {
        return new UserDTO(
            user.getId(),
            user.getUsername(),
            user.getEmail(),
            user.getAccount() != null ? user.getAccount().getAccountNumber() : null,
            user.getAccount() != null ? user.getAccount().getBalance() : null,
            user.isActive()
        );
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));

        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.isActive(),
            true,
            true,
            true,
            user.getRoles().stream().map(SimpleGrantedAuthority::new).collect(Collectors.toList())
        );
    }

    @Transactional
    public void activateUser(Long userId) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        userRepo.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, Boolean active) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(active);
        userRepo.save(user);
    }

    public void assignRoleToUser(Long userId, String role) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.getRoles().add(role);
        userRepo.save(user);
    }

    public void removeRoleFromUser(Long userId, String role) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        user.getRoles().remove(role);
        userRepo.save(user);
    }

    public UserModel findByUsername(String username) {
        return userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
    }

    public List<TransactionDTO> getUserTransactions(Long userId) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        List<TransactionModel> transactions = transactionRepo.findBySourceAccountNumber(user.getAccount().getAccountNumber());
        transactions.addAll(transactionRepo.findByTargetAccountNumber(user.getAccount().getAccountNumber()));

        return transactions.stream()
            .map(this::convertToTransactionDTO)
            .collect(Collectors.toList());
    }

    @Transactional
    public void deleteUser(Long userId) {
        UserModel user = userRepo.findById(userId)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        // Retrieve transactions by the user's account number
        List<TransactionModel> transactions = transactionRepo.findBySourceAccountNumber(user.getAccount().getAccountNumber());
        transactions.addAll(transactionRepo.findByTargetAccountNumber(user.getAccount().getAccountNumber()));

        // Delete all transactions associated with the user
        transactionRepo.deleteAll(transactions);

        if (user.getAccount() != null) {
            accountRepo.delete(user.getAccount());
        }
        userRepo.delete(user);
    }

    private TransactionDTO convertToTransactionDTO(TransactionModel transaction) {
        TransactionDTO dto = new TransactionDTO();
        dto.setId(transaction.getId());
        dto.setType(transaction.getType());
        dto.setAmount(transaction.getAmount());
        dto.setTimestamp(transaction.getTimestamp());
        dto.setSourceAccountNumber(transaction.getSourceAccountNumber());
        dto.setTargetAccountNumber(transaction.getTargetAccountNumber());
        return dto;
    }
}
