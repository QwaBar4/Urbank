package QwaBar4.bank.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IndexController {
    
    @GetMapping("/api/index")
    public IndexResponse index() {
        return new IndexResponse(null, null);
    }

    private static class IndexResponse {
        private final String username;
        private final Object account;

        public IndexResponse(String username, Object account) {
            this.username = username;
            this.account = account;
        }

        public String getUsername() {
            return username;
        }

        public Object getAccount() {
            return account;
        }
    }
}
