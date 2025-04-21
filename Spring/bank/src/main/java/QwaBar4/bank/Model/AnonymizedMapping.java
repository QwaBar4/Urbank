package QwaBar4.bank.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "anonymization_mappings")
public class AnonymizedMapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(columnDefinition = "TEXT")
    private String originalHash;
    
    @Column(columnDefinition = "TEXT")
    private String anonymizedValue;
    
    @Column(columnDefinition = "TEXT")
    private String encryptedOriginal; 

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getOriginalHash() {
        return originalHash;
    }

    public void setOriginalHash(String originalHash) {
        this.originalHash = originalHash;
    }

    public String getAnonymizedValue() {
        return anonymizedValue;
    }

    public void setAnonymizedValue(String anonymizedValue) {
        this.anonymizedValue = anonymizedValue;
    }

    public String getEncryptedOriginal() {
        return encryptedOriginal;
    }

    public void setEncryptedOriginal(String encryptedOriginal) {
        this.encryptedOriginal = encryptedOriginal;
    }
}
