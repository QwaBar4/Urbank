package QwaBar4.bank.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import QwaBar4.bank.Service.AESEncryptionService;
import QwaBar4.bank.Service.EncryptionConverter;

@Configuration
@EnableJpaRepositories(basePackages = "QwaBar4.bank.Repository")
public class JpaConfig {
    
    @Autowired
    private AESEncryptionService encryptionService;
    
    @Bean
    public EncryptionConverter encryptionConverter() {
        return new EncryptionConverter(encryptionService);
    }
}
