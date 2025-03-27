package QwaBar4.bank.Model;

import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.transaction.annotation.Transactional;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
public class UserModelService implements UserDetailsService {
    private final UserModelRepository userRepo;

	@Autowired
	public UserModelService(UserModelRepository userRepo) {
		this.userRepo = userRepo;
	}

    public boolean existsByUsernameIgnoreCase(String username) {
        return userRepo.existsByUsernameIgnoreCase(username);
    }

    public void deleteByUsername(String username) {
        userRepo.deleteByUsernameIgnoreCase(username);
    }
    
    public boolean existsByEmailIgnoreCase(String email) {
    	return userRepo.existsByEmailIgnoreCase(email);
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
