package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TransactionModelRepository extends JpaRepository<TransactionModel, Long> {
    List<TransactionModel> findBySourceAccountOrTargetAccountOrderByTimestampDesc(
        AccountModel source, 
        AccountModel target
    );
    List<TransactionModel> findByUser(UserModel user);
}
