package QwaBar4.bank.Model;

import QwaBar4.bank.Model.AuditLogModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogModel, Long> {
}
