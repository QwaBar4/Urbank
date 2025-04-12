package QwaBar4.bank.Service;

import QwaBar4.bank.Model.AuditLog;
import QwaBar4.bank.Repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;
    
    public void logAction(String action, String username, String details) {
        AuditLog auditLog = new AuditLog(action, username, LocalDateTime.now(), details);
        auditLogRepository.save(auditLog);
    }
}
