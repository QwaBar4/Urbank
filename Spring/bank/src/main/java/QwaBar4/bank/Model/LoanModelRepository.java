package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LoanModelRepository extends JpaRepository<LoanModel, Long> {
    List<LoanModel> findByAccount_User_Username(String username);
}
