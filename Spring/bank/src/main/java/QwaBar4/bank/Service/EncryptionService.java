package QwaBar4.bank.Service;

public interface EncryptionService {
    String encrypt(String data);
    String decrypt(String encryptedData);
}
