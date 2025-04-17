package QwaBar4.bank.Controller;

import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.UserModelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private UserModelService userModelService;

	@GetMapping("/users/{userId}")
	public ResponseEntity<UserDetailsDTO> getUserDetails(@PathVariable Long userId) {
		UserDetailsDTO userDetails = userModelService.getUserDetails(userId);
		return ResponseEntity.ok(userDetails);
	}

	@PutMapping("/users/{userId}")
	public ResponseEntity<UserDetailsDTO> updateUserDetails(
		    @PathVariable Long userId,
		    @RequestBody UserUpdateDTO userUpdateDTO) {
		UserDetailsDTO updatedUser = userModelService.updateUserDetails(userId, userUpdateDTO);
		return ResponseEntity.ok(updatedUser);
	}

    // Your existing endpoints
    @PostMapping("/users/{userId}/assignRole")
    public ResponseEntity<?> assignRoleToUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        userModelService.assignRoleToUser(userId, role);
        return ResponseEntity.ok("Role assigned successfully");
    }

    @PostMapping("/users/{userId}/removeRole")
    public ResponseEntity<?> removeRoleFromUser(@PathVariable Long userId, @RequestBody Map<String, String> request) {
        String role = request.get("role");
        userModelService.removeRoleFromUser(userId, role);
        return ResponseEntity.ok("Role removed successfully");
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable Long userId, @RequestBody Map<String, Boolean> request) {
        Boolean active = request.get("active");
        if (active == null) {
            return ResponseEntity.badRequest().body("Active status is required");
        }
        userModelService.updateUserStatus(userId, active);
        return ResponseEntity.ok("");
    }

	@GetMapping("/users/{userId}/transactions")
	public ResponseEntity<List<TransactionDTO>> getUserTransactions(@PathVariable Long userId) {
        List<TransactionDTO> transactions = userModelService.getUserTransactions(userId);
        return ResponseEntity.ok(transactions);
    }
}
