package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionModelRepository extends JpaRepository<TransactionModel, Long> {

    // Retrieve transactions by source or target account, ordered by timestamp
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
            AccountModel source,
            AccountModel target
    );

    // Retrieve transactions by source account
    List<TransactionModel> findBySourceAccount(AccountModel sourceAccount);

    // Retrieve transactions by target account
    List<TransactionModel> findByTargetAccount(AccountModel targetAccount);

    // Retrieve transactions by user ID (source or target account)
    @Query("SELECT tm FROM TransactionModel tm WHERE tm.sourceAccount.id = :userId OR tm.targetAccount.id = :userId ORDER BY tm.timestamp DESC")
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(@Param("userId") Long userId);

    // Get the total amount transferred for a specific account on a given day
    @Query("SELECT COALESCE(SUM(t.amount), 0) FROM TransactionModel t WHERE t.sourceAccountNumber = :sourceAccount AND t.timestamp >= :startOfDay")
    BigDecimal getDailyTransferTotal(@Param("sourceAccount") String sourceAccount, @Param("startOfDay") LocalDateTime startOfDay);
}
