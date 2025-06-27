package QwaBar4.bank.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import QwaBar4.bank.DTO.LoanApplicationDTO;
import QwaBar4.bank.DTO.LoanResponseDTO;
import QwaBar4.bank.Model.*;
import QwaBar4.bank.Model.LoanModelRepository;
import QwaBar4.bank.Model.AccountModelRepository;
import QwaBar4.bank.DTO.LoanResponseDTO.PaymentScheduleDTO;
import java.util.stream.Collectors;

import java.util.List;

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
            savedLoan.getAccountId(),
            savedLoan.getStatus()
        );
    }
    
    public List<LoanResponseDTO> getAllLoans() {
        return loanRepository.findAll().stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
	
	public List<LoanResponseDTO> getLoansForCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        
        return loanRepository.findByAccount_User_Username(username).stream()
            .map(this::convertToResponseDTO)
            .collect(Collectors.toList());
    }
	
    @Transactional
    public LoanResponseDTO approveLoan(Long loanId) {
        LoanModel loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        
        loan.setStatus("APPROVED");
        LoanModel updatedLoan = loanRepository.save(loan);
        return convertToResponseDTO(updatedLoan);
    }

    @Transactional
    public LoanResponseDTO rejectLoan(Long loanId) {
        LoanModel loan = loanRepository.findById(loanId)
            .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
        
        loan.setStatus("REJECTED");
        LoanModel updatedLoan = loanRepository.save(loan);
        return convertToResponseDTO(updatedLoan);
    }

    private LoanResponseDTO convertToResponseDTO(LoanModel loan) {
        LoanResponseDTO dto = new LoanResponseDTO();
        dto.setId(loan.getId());
        dto.setPrincipal(loan.getPrincipal());
        dto.setInterestRate(loan.getInterestRate());
        dto.setStartDate(loan.getStartDate());
        dto.setTermMonths(loan.getTermMonths());
        dto.setStatus(loan.getStatus());
        dto.setUsername(loan.getAccount().getUser().getUsername());
        
        if (loan.getPaymentSchedule() != null) {
            List<PaymentScheduleDTO> scheduleDTOs = loan.getPaymentSchedule().stream()
                .map(this::convertPaymentScheduleToDTO)
                .collect(Collectors.toList());
            dto.setPaymentSchedule(scheduleDTOs);
        }
        
        return dto;
    }
    
    private PaymentScheduleDTO convertPaymentScheduleToDTO(PaymentSchedule payment) {
        PaymentScheduleDTO dto = new PaymentScheduleDTO();
        dto.setPaymentNumber(payment.getPaymentNumber());
        dto.setPaymentDate(payment.getPaymentDate());
        dto.setPrincipalAmount(payment.getPrincipalAmount());
        dto.setInterestAmount(payment.getInterestAmount());
        dto.setTotalPayment(payment.getTotalPayment());
        dto.setRemainingBalance(payment.getRemainingBalance());
        dto.setPaid(payment.isPaid());
        return dto;
    }
}
