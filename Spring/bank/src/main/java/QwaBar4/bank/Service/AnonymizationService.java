package QwaBar4.bank.Service;

import QwaBar4.bank.Model.AnonymizedMapping;
import QwaBar4.bank.Model.AnonymizedMappingRepository;
import com.google.common.hash.Hashing;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Optional;
import java.util.UUID;

@Service
public class AnonymizationService {
    private static final String ANONYMIZATION_SALT = System.getenv("ANON_SALT");

    @Autowired
    private AnonymizedMappingRepository mappingRepo;

    @Autowired
    private EncryptionService encryptionService;

    public String anonymize(String original) {
        if (original == null) {
            return null;
        }
        String hash = generateHash(original);
        return mappingRepo.findByOriginalHash(hash)
                .map(AnonymizedMapping::getAnonymizedValue)
                .orElseGet(() -> createNewMapping(original, hash));
    }

    private String createNewMapping(String original, String hash) {
        String anonymized = "USER-" + UUID.randomUUID().toString().substring(0, 8);
        String encrypted = encryptionService.encrypt(original);

        AnonymizedMapping mapping = new AnonymizedMapping();
        mapping.setOriginalHash(hash);
        mapping.setAnonymizedValue(anonymized);
        mapping.setEncryptedOriginal(encrypted);
        mappingRepo.save(mapping);

        return anonymized;
    }

	public String deanonymize(String anonymized) {
		return mappingRepo.findByAnonymizedValue(anonymized)
		    .map(m -> {
		        try {
		            return encryptionService.decrypt(m.getEncryptedOriginal());
		        } catch (Exception e) {
		            return "DECRYPTION_ERROR";
		        }
		    })
		    .orElse("UNKNOWN_USER");
	}

    private String generateHash(String input) {
        return Hashing.sha256()
                .hashString(input + ANONYMIZATION_SALT, StandardCharsets.UTF_8)
                .toString();
    }
}
