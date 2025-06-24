package QwaBar4.bank.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import QwaBar4.bank.DTO.LoanApplicationDTO;
import QwaBar4.bank.Model.*;
import QwaBar4.bank.Model.LoanModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;

@Service
public class LoanService {
    private final LoanModelRepository loanRepository;
    private final AccountModelRepository accountRepository;

    public LoanService(LoanModelRepository loanRepository,
                     AccountModelRepository accountRepository) {
        this.loanRepository = loanRepository;
        this.accountRepository = accountRepository;
    }

    @Transactional
    public LoanApplicationDTO createLoan(LoanApplicationDTO loanDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        AccountModel account = accountRepository.findByUserUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Account not found for current user"));
        
        LoanModel loan = new LoanModel();
        loan.setPrincipal(loanDTO.getPrincipal());
        loan.setInterestRate(loanDTO.getInterestRate());
        loan.setStartDate(loanDTO.getStartDate());
        loan.setTermMonths(loanDTO.getTermMonths());
        loan.setAccount(account);
        
        loan.generatePaymentSchedule();
        
        LoanModel savedLoan = loanRepository.save(loan);
        
        return new LoanApplicationDTO(
            savedLoan.getId(),
            savedLoan.getPrincipal(),
            savedLoan.getInterestRate(),
            savedLoan.getStartDate(),
            savedLoan.getTermMonths(),
            savedLoan.getAccountId()
        );
    }
}
