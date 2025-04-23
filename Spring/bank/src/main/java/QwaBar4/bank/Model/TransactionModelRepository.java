package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface TransactionModelRepository extends JpaRepository<TransactionModel, Long> {
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
        AccountModel source, 
        AccountModel target
    );
    List<TransactionModel> findByUser(UserModel user);

    @Query("SELECT SUM(t.amount) FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount AND t.timestamp >= :startOfDay")
    BigDecimal getDailyTransferTotal(String sourceAccount, LocalDateTime startOfDay);
    
    default BigDecimal getDailyTransferTotal(String sourceAccount) {
        LocalDateTime startOfDay = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return getDailyTransferTotal(sourceAccount, startOfDay);
    }
}
