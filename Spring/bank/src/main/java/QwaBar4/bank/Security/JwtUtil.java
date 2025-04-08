package QwaBar4.bank.Security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.stream.Collectors;

@Component
public class JwtUtil {
    
    private final SecretKey secretKey;
    
    public JwtUtil() {
        // Initialize with your secret key from JwtConstants
        this.secretKey = Keys.hmacShaKeyFor(JwtConstants.SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(Authentication authentication) {
        return Jwts.builder()
            .subject(authentication.getName())
            .claim("authorities", populateAuthorities(authentication.getAuthorities()))
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 86400000)) // 24 hours
            .signWith(secretKey, Jwts.SIG.HS512)
            .compact();
    }

    private String populateAuthorities(Collection<? extends GrantedAuthority> authorities) {
        return authorities.stream()
            .map(GrantedAuthority::getAuthority)
            .collect(Collectors.joining(","));
    }

    public String getUsernameFromToken(String token) {
        return getClaimsFromToken(token).getSubject();
    }

    public String generatePasswordResetToken(String email) {
        return Jwts.builder()
            .subject(email)
            .issuedAt(new Date())
            .expiration(new Date(System.currentTimeMillis() + 3600000)) // 1 hour
            .signWith(secretKey, Jwts.SIG.HS512)
            .compact();
    }

    public SecretKey getSecretKey() {
        return this.secretKey;
    }

    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getEmailFromToken(String token) throws JwtException {
        return getClaimsFromToken(token).getSubject();
    }

    private Claims getClaimsFromToken(String token) {
        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
