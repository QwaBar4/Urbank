package QwaBar4.bank.Controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;

@Controller
public class ContentController {

    private final UserModelRepository userModelRepository;

    public ContentController(UserModelRepository userModelRepository) {
        this.userModelRepository = userModelRepository;
    }

    @GetMapping("/req/login")
    public String login() {
        return "login";
    }
    
    @GetMapping("/req/login/recovery")
    public String recovery() {
        return "PasswordReset";
    }

    @GetMapping("/req/signup")
    public String signup() {
        return "signup";
    }

    @GetMapping("/")
    public String home() {
        return "index";
    }
}
