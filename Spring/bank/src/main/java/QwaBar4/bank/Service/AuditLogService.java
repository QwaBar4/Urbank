package QwaBar4.bank.Service;

import QwaBar4.bank.Model.AuditLogModel;
import QwaBar4.bank.Model.AuditLogRepository;
import QwaBar4.bank.Model.AnonymizedMappingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {
    private final AnonymizedMappingRepository mappingRepo;
    private final AESEncryptionService encryptionService;
    private final AnonymizationService anonymizationService;
    private final AuditLogRepository auditLogRepository;

    @Autowired
    public AuditLogService(AnonymizedMappingRepository mappingRepo,
                           AESEncryptionService encryptionService,
                           AnonymizationService anonymizationService,
                           AuditLogRepository auditLogRepository) {
        this.mappingRepo = mappingRepo;
        this.encryptionService = encryptionService;
        this.anonymizationService = anonymizationService;
        this.auditLogRepository = auditLogRepository;
    }

	@Transactional
	public void logAction(String action, String username, String details) {
		String anonymizedUser = anonymizationService.anonymize(username);
		String encryptedDetails = encryptionService.encrypt(details);
		
		AuditLogModel log = new AuditLogModel(
		    action,
		    anonymizedUser,
		    LocalDateTime.now(),
		    encryptedDetails
		);
		auditLogRepository.save(log);
	}
    
    @Scheduled(cron = "0 0 3 * * *") // Daily at 3 AM
    public void pruneOldLogs() {
        auditLogRepository.deleteByTimestampBefore(LocalDateTime.now().minusYears(1));
    }
}
