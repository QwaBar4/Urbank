package QwaBar4.bank.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
import QwaBar4.bank.Model.AccountModel;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;


@RestController
public class IndexController {
    
    private final UserModelRepository userModelRepository;
    
    public IndexController(UserModelRepository userModelRepository) {
        this.userModelRepository = userModelRepository;
    }
    
    @GetMapping("/api/index")
    public IndexResponse index() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserModel user = userModelRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return new IndexResponse(user.getUsername(),  user.getAccount());
    }
    

    private static class IndexResponse {
        private final String username;
        private final AccountModel account;

        public IndexResponse(String username, AccountModel account) {
            this.username = username;
            this.account = account;
        }

        public String getUsername() {
            return username;
        }

        public AccountModel getAccount() {
            return account;
        }
    }
}
