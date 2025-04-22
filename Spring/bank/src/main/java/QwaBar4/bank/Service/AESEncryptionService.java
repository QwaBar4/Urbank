package QwaBar4.bank.Service;

import org.springframework.stereotype.Service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.spec.IvParameterSpec;
import java.util.Base64;

@Service
public class AESEncryptionService implements EncryptionService {
    private static final Logger logger = LoggerFactory.getLogger(AESEncryptionService.class);
    private static final String SECRET_KEY = System.getenv("ENCRYPTION_SECRET_KEY");
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final byte[] IV = "0123456789abcdef".getBytes();

    @Override
    public String encrypt(String data) {
        try {
            logger.info("Encrypting data: {}", data);
            byte[] keyBytes = hexStringToByteArray(SECRET_KEY);
            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(IV);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
            byte[] encryptedBytes = cipher.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("Encryption failed", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    @Override
    public String decrypt(String encryptedData) {
        try {
            logger.info("Decrypting data: {}", encryptedData);
            byte[] keyBytes = hexStringToByteArray(SECRET_KEY);
            SecretKeySpec key = new SecretKeySpec(keyBytes, "AES");
            IvParameterSpec ivSpec = new IvParameterSpec(IV);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);
            byte[] decryptedBytes = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decryptedBytes);
        } catch (Exception e) {
            logger.error("Decryption failed", e);
            throw new RuntimeException("Decryption failed", e);
        }
    }

    private byte[] hexStringToByteArray(String s) {
        int len = s.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            data[i / 2] = (byte) ((Character.digit(s.charAt(i), 16) << 4)
                    + Character.digit(s.charAt(i + 1), 16));
        }
        return data;
    }
}



