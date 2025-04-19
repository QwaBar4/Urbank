package QwaBar4.bank.Security;

import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService; // Add this

    @Autowired // Add constructor injection
    public JwtAuthenticationFilter(JwtUtil jwtUtil, UserDetailsService userDetailsService) {
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }

	@Override
	protected void doFilterInternal(HttpServletRequest request, 
		                            HttpServletResponse response, 
		                            FilterChain filterChain) throws ServletException, IOException {
		String authHeader = request.getHeader("Authorization");
		
		if (authHeader != null && authHeader.startsWith("Bearer ")) {
		    String jwt = authHeader.substring(7);
		    try {
		        String username = jwtUtil.getUsernameFromToken(jwt);
		        
		        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
		        
		        UsernamePasswordAuthenticationToken authentication = 
		            new UsernamePasswordAuthenticationToken(
		                userDetails,
		                null,
		                userDetails.getAuthorities()
		            );
		        
		        SecurityContextHolder.getContext().setAuthentication(authentication);
		        
		    } catch (Exception e) {
		        response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Invalid token");
		        return;
		    }
		}
		
		filterChain.doFilter(request, response);
	}
	
}
