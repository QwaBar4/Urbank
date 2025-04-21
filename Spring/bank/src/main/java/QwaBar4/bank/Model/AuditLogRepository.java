package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogModel, Long> {
    void deleteByTimestampBefore(LocalDateTime timestamp);
    List<AuditLogModel> findByUsername(String username);
}
