package QwaBar4.bank.Security;

import java.security.SecureRandom;
import java.util.Base64;

public class JwtConstants {

    public static final String SECRET_KEY;
    public static final String JWT_HEADER = "Authorization";
    
    static {
        String envKey = System.getenv("JWT_SECRET_KEY");
        if (envKey == null || envKey.trim().isEmpty()) {
            throw new RuntimeException("JWT_SECRET_KEY environment variable is not set");
        }
        SECRET_KEY = envKey;
    }
}
