package QwaBar4.bank.Model;

import java.util.Optional;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collections;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.AllArgsConstructor;

@Service
@AllArgsConstructor
public class UserModelService implements UserDetailsService {

    private final UserModelRepository repository;

	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		UserModel user = repository.findByUsername(username)
		    .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
		
		return new org.springframework.security.core.userdetails.User(
		    user.getUsername(),
		    user.getPassword(),
		    Collections.singleton(new SimpleGrantedAuthority("ROLE_USER"))
		);
	}
}
