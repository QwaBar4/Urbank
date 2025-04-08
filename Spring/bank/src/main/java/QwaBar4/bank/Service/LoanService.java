package QwaBar4.bank.Service;

import QwaBar4.bank.Model.LoanModel;
import QwaBar4.bank.Model.LoanModelRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoanService {

    private final LoanModelRepository loanRepository;

    public LoanService(LoanModelRepository loanRepository) {
        this.loanRepository = loanRepository;
    }

    @Transactional
    public LoanModel createLoan(LoanModel loan) {
        loan.generatePaymentSchedule();
        return loanRepository.save(loan);
    }
}
