package QwaBar4.bank.Security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.SignatureAlgorithm;

import javax.crypto.SecretKey;
import java.util.Collection;
import java.util.Date;
import java.util.HashSet;
import java.util.Set;

@Component
public class JwtUtil {
    private final SecretKey key = Keys.hmacShaKeyFor(JwtConstants.SECRET_KEY.getBytes());

    public String generateToken(Authentication auth) {
        Collection<? extends GrantedAuthority> authorities = auth.getAuthorities();
        String roles = populateAuthorities(authorities);
        
        return Jwts.builder()
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .subject(auth.getName())
                .claim("authorities", roles)
                .signWith(key)
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
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }
    public String generatePasswordResetToken(String email) {
		return Jwts.builder()
		    .setSubject(email)
		    .setIssuedAt(new Date())
		    .setExpiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
		    .signWith(SignatureAlgorithm.HS512, key)
		    .compact();
	}

	public boolean validateToken(String token) {
		try {
		    JwtParserBuilder().setSigningKey(key).build().parseClaimsJws(token);
		    return true;
		} catch (Exception e) {
		    return false;
		}
	}

	public String getEmailFromToken(String token) {
		return Jwts.parserBuilder()
		    .setSigningKey(key)
		    .build()
		    .parseClaimsJws(token)
		    .getBody()
		    .getSubject();
	}
}
