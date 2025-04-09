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
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.DTO.UserDTO;

import java.util.Collections;

@Service
public class UserModelService implements UserDetailsService {

    private final UserModelRepository userRepo;
    private final AccountModelRepository accountRepo;

    @Autowired
    public UserModelService(UserModelRepository userRepo, AccountModelRepository accountRepo) {
        this.userRepo = userRepo;
        this.accountRepo = accountRepo;
    }

    public boolean existsByUsernameIgnoreCase(String username) {
        return userRepo.existsByUsernameIgnoreCase(username);
    }

    @Transactional
    public void deleteByUsername(String username) {
        UserModel user = userRepo.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        user.setAccount(null);
        userRepo.save(user);
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
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            Collections.emptyList()
        );
    }
}
