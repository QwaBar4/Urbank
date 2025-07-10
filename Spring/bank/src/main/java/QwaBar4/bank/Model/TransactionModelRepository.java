package QwaBar4.bank.Model;

import jakarta.persistence.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionModelRepository extends JpaRepository<TransactionModel, Long> {

    @Query("SELECT t FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount OR t.targetAccountNumber = :targetAccount ORDER BY t.timestamp DESC")
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
            @Param("sourceAccount") String sourceAccountNumber,
            @Param("targetAccount") String targetAccountNumber
    );

    List<TransactionModel> findBySourceAccountNumber(String sourceAccountNumber);

    List<TransactionModel> findByTargetAccountNumber(String targetAccountNumber);

    @Query("SELECT t FROM TransactionModel t WHERE " +
           "t.sourceAccountNumber = :account OR t.targetAccountNumber = :account " +
           "ORDER BY t.timestamp DESC")
    List<TransactionModel> findByAccountNumbers(@Param("account") String accountNumber);

    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount AND t.timestamp >= :startOfDay")
    BigDecimal getDailyTransferTotal(@Param("sourceAccount") String sourceAccount, @Param("startOfDay") LocalDateTime startOfDay);
}
