package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import QwaBar4.bank.Utils.AccountNumberUtils;

@Repository
public interface AccountModelRepository extends JpaRepository<AccountModel, Long> {
    Optional<AccountModel> findByAccountNumber(String accountNumber)
}
