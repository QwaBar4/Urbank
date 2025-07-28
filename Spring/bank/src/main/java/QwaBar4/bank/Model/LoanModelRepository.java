package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LoanModelRepository extends JpaRepository<LoanModel, Long> {
    List<LoanModel> findByAccount_User_Username(String username);
    List<LoanModel> findByAccount_User_Id(Long id);
}
