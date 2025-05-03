package QwaBar4.bank.Service;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component  // Add this if using Spring dependencies
@Converter(autoApply = true)  // For JPA auto-apply
public class EncryptionConverter implements AttributeConverter<String, String> {

    private final AESEncryptionService encryptionService;

    @Autowired  // Required if using Spring-managed dependencies
    public EncryptionConverter(AESEncryptionService encryptionService) {
        this.encryptionService = encryptionService;
    }

    @Override
    public String convertToDatabaseColumn(String attribute) {
        return encryptionService.encrypt(attribute);
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        return encryptionService.decrypt(dbData);
    }
}
