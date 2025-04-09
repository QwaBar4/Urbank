package QwaBar4.bank.Controller;

import QwaBar4.bank.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.*;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserModelService userModelService; // Assuming you have a service to fetch users

    @GetMapping("/users")
    public List<UserDTO> getAllUsers() {
        auditLogService.logAction("GET_USERS", "admin", "Fetched all users");
        // Return a list of all users
        return userModelService.getAllUsers(); // Implement this method in UserModelService
    }

    @PostMapping("/users/{userId}/lock")
    public ResponseEntity<?> lockUser(@PathVariable Long userId) {
        auditLogService.logAction("LOCK_USER", "admin", "Locked user with ID: " + userId);
        // Perform the lock user logic here
        userModelService.lockUser(userId); // Implement this method in UserModelService
        return ResponseEntity.ok("User locked successfully");
    }
}
