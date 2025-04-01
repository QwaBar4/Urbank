package QwaBar4.bank.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.security.SecureRandom;
import java.time.Instant;

@Service
public class EmailVerificationService {
    
    private final JavaMailSender mailSender;
	private final Map<String, VerificationData> verificationCodes = new ConcurrentHashMap<>();

	private static class VerificationData {
		String code;
		long timestamp;

		VerificationData(String code) {
		    this.code = code;
		    this.timestamp = System.currentTimeMillis();
		}
	}

    @Autowired
    public EmailVerificationService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationCode(String email) {
        String code = generateRandomCode();
        verificationCodes.put(email, new VerificationData(code));
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your Verification Code");
        message.setText("Your verification code is: " + code);
        mailSender.send(message);
    }
    
    public void sendRecoveryCode(String email) {
        String code = generateRandomCode();
        verificationCodes.put(email, new VerificationData(code));
        
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Password recovery");
        message.setText("Your recovery code is: " + code);
        mailSender.send(message);
    }

	public boolean verifyCode(String email, String code) {
		VerificationData data = verificationCodes.get(email);
		if (data == null) return false;
		
		boolean isValid = code.equals(data.code) && 
		    (System.currentTimeMillis() - data.timestamp) <= 300000;
		
		verificationCodes.remove(email);
		return isValid;
	}

 	private String generateRandomCode() {
        SecureRandom random = new SecureRandom();
        return String.format("%06d", random.nextInt(900000) + 100000);
    }
    
    
}
