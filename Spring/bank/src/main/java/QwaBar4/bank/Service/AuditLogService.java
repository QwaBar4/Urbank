package QwaBar4.bank.Service;


import QwaBar4.bank.Model.UserModel;
import QwaBar4.bank.Model.UserModelRepository;
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
    private final UserModelRepository userRepo;
    private final AESEncryptionService encryptionService;
    private final AnonymizationService anonymizationService;
    private final AuditLogRepository auditLogRepository;

    @Autowired
    public AuditLogService(AnonymizedMappingRepository mappingRepo,
                           AESEncryptionService encryptionService,
                           AnonymizationService anonymizationService,
                           AuditLogRepository auditLogRepository,
                           UserModelRepository userModelRepository) {
        this.mappingRepo = mappingRepo;
        this.encryptionService = encryptionService;
        this.anonymizationService = anonymizationService;
        this.auditLogRepository = auditLogRepository;
        this.userRepo = userModelRepository;
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
    
    @Transactional
    public void logActionById(String action, Long id, String details) {
    	UserModel user = userRepo.findById(id)
    		.orElseThrow(() -> new RuntimeException("User not found"));
    		
        String anonymizedUser = anonymizationService.anonymize(user.getUsername());
        String encryptedDetails = encryptionService.encrypt(details);

        AuditLogModel log = new AuditLogModel(
            action,
            anonymizedUser,
            LocalDateTime.now(),
            encryptedDetails
        );
        auditLogRepository.save(log);
    }

    @Transactional
    public void logAdminAction(String username, String action, String details) {
        logAction("ADMIN_" + action, username, details);
    }

    @Scheduled(cron = "0 0 3 * * *")
    public void pruneOldLogs() {
        auditLogRepository.deleteByTimestampBefore(LocalDateTime.now().minusYears(1));
    }
}
