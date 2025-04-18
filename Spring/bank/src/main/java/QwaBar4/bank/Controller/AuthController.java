package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import jakarta.servlet.http.HttpServletResponse;

import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Service.UserModelService;

import QwaBar4.bank.Security.AuthResponse;
import QwaBar4.bank.Security.JwtUtil;

@RestController
@RequestMapping("/req")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UserModelService userModelService;

    @Autowired
    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, UserModelService userModelService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userModelService = userModelService;
    }

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody UserModel loginRequest) {
		try {
			System.out.println("Login attempt with username: " + loginRequest.getUsername());
			UserModel user = userModelService.findByUsername(loginRequest.getUsername());
            if (user == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new AuthResponse(null, "Invalid credentials", false));
            }
            if (!user.isActive()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new AuthResponse(null, "Account is deactivated", false)); // Specific error for deactivated accounts
            }
		    Authentication authentication = authenticationManager.authenticate(
		        new UsernamePasswordAuthenticationToken(
		            loginRequest.getUsername(),
		            loginRequest.getPassword()
		        )
		    );
		    
		    String jwt = jwtUtil.generateToken(authentication);
		    
		    return ResponseEntity.ok()
		        .header("Access-Control-Expose-Headers", "Authorization")
		        .body(new AuthResponse(jwt, "Login successful", true));
		} catch (AuthenticationException e) {
		    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
		        .body(new AuthResponse(null, "Invalid credentials", false));
		}
	}

    private String createSessionCookie(HttpServletResponse response) {
        return response.getHeader(HttpHeaders.SET_COOKIE);
    }
}
