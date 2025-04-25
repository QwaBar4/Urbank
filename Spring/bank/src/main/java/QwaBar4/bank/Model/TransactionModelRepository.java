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

    // Retrieve transactions by source or target account numbers, ordered by timestamp
    @Query("SELECT t FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount OR t.targetAccountNumber = :targetAccount ORDER BY t.timestamp DESC")
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
            @Param("sourceAccount") String sourceAccountNumber,
            @Param("targetAccount") String targetAccountNumber
    );

    // Retrieve transactions by source account number
    List<TransactionModel> findBySourceAccountNumber(String sourceAccountNumber);

    // Retrieve transactions by target account number
    List<TransactionModel> findByTargetAccountNumber(String targetAccountNumber);

    // Retrieve transactions by account numbers (source or target)
    @Query("SELECT t FROM TransactionModel t WHERE " +
           "t.sourceAccountNumber = :account OR t.targetAccountNumber = :account " +
           "ORDER BY t.timestamp DESC")
    List<TransactionModel> findByAccountNumbers(@Param("account") String accountNumber);

    // Get the total amount transferred for a specific account on a given day
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount AND t.timestamp >= :startOfDay")
    BigDecimal getDailyTransferTotal(@Param("sourceAccount") String sourceAccount, @Param("startOfDay") LocalDateTime startOfDay);
}
