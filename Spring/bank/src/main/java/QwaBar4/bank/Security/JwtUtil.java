package QwaBar4.bank.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.JwtException;
import java.nio.charset.StandardCharsets; 
import io.jsonwebtoken.ExpiredJwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;


import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;
import java.util.Map;

@Component
public class JwtUtil {
	
	private final SecretKey SECRET_KEY;
    
    public JwtUtil() {
        byte[] keyBytes = JwtConstants.SECRET_KEY.getBytes(StandardCharsets.UTF_8);
        this.SECRET_KEY = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Authentication authentication) {
        return Jwts.builder()
            .setSubject(authentication.getName())
            .setExpiration(new Date(System.currentTimeMillis() + 86400000))
            .signWith(SECRET_KEY, SignatureAlgorithm.HS512)
            .compact();
    }

    private String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
        Set<String> auths = new HashSet<>();
        for (GrantedAuthority authority : authorities) {
            auths.add(authority.getAuthority());
        }
        return String.join(",", auths);
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(SECRET_KEY)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
    public String generatePasswordResetToken(String email) {
		return Jwts.builder()
		    .setSubject(email)
		    .setIssuedAt(new Date())
		    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) 
		    .signWith(SignatureAlgorithm.HS512, SECRET_KEY)
		    .compact();
	}


    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(SECRET_KEY)
                .build()
                .parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException ex) {
            System.err.println("Token expired: " + ex.getMessage());
            return false;
        } catch (JwtException e) {
            System.err.println("Invalid token: " + e.getMessage());
            return false;
        }
    }

	public String getEmailFromToken(String token) throws JwtException {
		try{
			Claims claims = Jwts.parser()
				.setSigningKey(SECRET_KEY)
				.build()
				.parseClaimsJws(token)
				.getBody();
			return claims.getSubject();
		}
		catch(Exception e){
			throw new JwtException("Invalid or expired token", e);
		}
	}
}
