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

    @GetMapping("/req/signup")
    public String signup() {
        return "signup";
    }

    @GetMapping(value = {"/", "/index"})
    public String home() {
        return "index";
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        UserModel user = userModelRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        model.addAttribute("username", user.getUsername());
        model.addAttribute("account", user.getAccount());

        return "dashboard";
    }
}
