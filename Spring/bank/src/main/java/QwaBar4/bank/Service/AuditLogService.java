package QwaBar4.bank.Service;

import QwaBar4.bank.Model.AuditLogModel;
import QwaBar4.bank.Model.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String action, String username, String details) {
        AuditLogModel auditLog = new AuditLogModel(action, username, LocalDateTime.now(), details);
        auditLogRepository.save(auditLog);
    }
}
