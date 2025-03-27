package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import QwaBar4.bank.Model.UserModelService;

@RestController
@RequestMapping("/api")
public class UserController {

    private final UserModelService userModelService;

    @Autowired
    public UserController(UserModelService userModelService) {
        this.userModelService = userModelService;
    }

	@GetMapping("/check-username")
	public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
		System.out.println("Checking username: " + username); // Debug log
		boolean exists = userModelService.existsByUsernameIgnoreCase(username);
		System.out.println("Exists: " + exists); // Debug log
		return ResponseEntity.ok(exists);
	}

    @DeleteMapping("/delete-user")
    public ResponseEntity<Void> deleteUser(@RequestParam String username) {
        userModelService.deleteByUsername(username);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/check-email")
	public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
		boolean exists = userModelService.existsByEmailIgnoreCase(email);
		return ResponseEntity.ok(exists);
}
}
