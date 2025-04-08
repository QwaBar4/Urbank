package QwaBar4.bank.Model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PaymentScheduleRepository extends JpaRepository<PaymentSchedule, Long> {
    List<PaymentSchedule> findByLoan(LoanModel loan);
}
