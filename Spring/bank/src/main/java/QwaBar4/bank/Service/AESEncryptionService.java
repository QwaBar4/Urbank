package QwaBar4.bank.Service;

import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AESEncryptionService implements EncryptionService {
    private static final Logger logger = LoggerFactory.getLogger(AESEncryptionService.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int TAG_LENGTH_BIT = 128; 
    private static final int IV_LENGTH_BYTE = 12;
    private final SecretKey secretKey;

    public AESEncryptionService() {
        String envKey = System.getenv("ENCRYPTION_SECRET_KEY");
        if (envKey == null || envKey.length() != 32) {
            throw new IllegalStateException("Invalid encryption key configuration");
        }
        this.secretKey = new SecretKeySpec(envKey.getBytes(), "AES");
    }
    
    @Override
    public String encrypt(String data) {
        if (data == null) return null;
        
        try {
            byte[] iv = new byte[IV_LENGTH_BYTE];
            SecureRandom secureRandom = new SecureRandom();
            secureRandom.nextBytes(iv);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);
            
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            byte[] combined = new byte[iv.length + encryptedBytes.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encryptedBytes, 0, combined, iv.length, encryptedBytes.length);
            
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            logger.error("Encryption failed", e);
            throw new RuntimeException("Encryption operation failed", e);
        }
    }

    @Override
    public String decrypt(String encryptedData) {
        if (encryptedData == null) return null;
        
        try {
            byte[] combined = Base64.getDecoder().decode(encryptedData);
            
            if (combined.length < IV_LENGTH_BYTE + 1) {
                throw new IllegalArgumentException("Invalid encrypted data format");
            }
            
            byte[] iv = new byte[IV_LENGTH_BYTE];
            System.arraycopy(combined, 0, iv, 0, iv.length);
            
            byte[] cipherBytes = new byte[combined.length - IV_LENGTH_BYTE];
            System.arraycopy(combined, IV_LENGTH_BYTE, cipherBytes, 0, cipherBytes.length);
            
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(TAG_LENGTH_BIT, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);
            
            return new String(cipher.doFinal(cipherBytes));
        } catch (Exception e) {
            logger.error("Decryption failed for data length: {}", encryptedData.length(), e);
            throw new RuntimeException("Decryption operation failed", e);
        }
    }
}
