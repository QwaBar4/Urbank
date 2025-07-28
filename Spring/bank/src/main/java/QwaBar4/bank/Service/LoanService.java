package QwaBar4.bank.Service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Autowired;

import QwaBar4.bank.DTO.*;
import QwaBar4.bank.DTO.LoanResponseDTO.PaymentScheduleDTO;
import QwaBar4.bank.Model.*;
import QwaBar4.bank.Utils.AccountNumberUtils;

import java.util.stream.Collectors;
import java.time.LocalDateTime;
import java.util.List;
import java.math.BigDecimal;

@Service
@Transactional
public class LoanService {
    private final LoanModelRepository loanRepository;
    private final AccountModelRepository accountRepository;
    private final PaymentModelRepository paymentRepository;
    private final TransactionService transactionService;
    private final AccountNumberUtils accountNumberUtils;

    @Autowired
    public LoanService(LoanModelRepository loanRepository,
                     AccountModelRepository accountRepository,
                     PaymentModelRepository paymentRepository,
                     TransactionService transactionService,
                     AccountNumberUtils accountNumberUtils) {
        this.loanRepository = loanRepository;
        this.accountRepository = accountRepository;
        this.paymentRepository = paymentRepository;
        this.transactionService = transactionService;
        this.accountNumberUtils = accountNumberUtils;
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
        loan.setRemainingBalance(loanDTO.getPrincipal());
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
	
	public List<LoanResponseDTO> getLoansByUserId(Long userId) {
		return loanRepository.findByAccount_User_Id(userId).stream()
		    .map(this::convertToResponseDTO)
		    .collect(Collectors.toList());
	}
	
	@Transactional
	public LoanResponseDTO approveLoan(Long loanId) {
		LoanModel loan = loanRepository.findById(loanId)
		    .orElseThrow(() -> new IllegalArgumentException("Loan not found"));
		
		if (!"PENDING".equals(loan.getStatus())) {
		    throw new IllegalArgumentException("Loan is not in pending state");
		}
		
		loan.setStatus("APPROVED");
		
		String accountNumber = accountNumberUtils.convertFormattedNumberToUuid(loan.getAccountNumber());
		
		AccountModel account = accountRepository.findByAccountNumber(accountNumber)
                .orElseThrow(() -> new RuntimeException("Account not found"));

		try {
		    transactionService.processDeposit(
		        accountNumber,
		        loan.getPrincipal(),
		        "Loan disbursement for loan #" + loanId,
		        account.getUser().getUsername()
		    );
		} catch (Exception e) {
		    throw new IllegalArgumentException("Failed to process loan disbursement: " + e.getMessage());
		}
		
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
		
	@Transactional
	public PaymentResponseDTO recordPayment(Long loanId, LoanPaymentDTO paymentDTO) {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		String accNumber = accountNumberUtils.convertFormattedNumberToUuid(paymentDTO.getAccountNumber());
		
		AccountModel account = accountRepository.findByAccountNumber(accNumber)
		    .orElseThrow(() -> new IllegalArgumentException("Account not found"));

		LoanModel loan = loanRepository.findById(loanId)
		    .orElseThrow(() -> new IllegalArgumentException("Loan not found"));

		if (!loan.getStatus().equals("APPROVED")) {
		    throw new IllegalArgumentException("Loan is not approved for payments");
		}

		if (account.getBalance().compareTo(paymentDTO.getAmount()) < 0) {
		    throw new IllegalArgumentException("Insufficient account balance");
		}
		
		if (loan.getRemainingBalance().compareTo(paymentDTO.getAmount()) < 0){
		    throw new IllegalArgumentException("You cant pay more");
		}

		try {
		    transactionService.processWithdrawal(
		        accNumber,
		        paymentDTO.getAmount(),
		        "Loan payment for loan #" + loanId,
		        accNumber
		    );

		    PaymentModel payment = new PaymentModel();
		    payment.setLoan(loan);
		    payment.setPaymentNumber(paymentDTO.getPaymentNumber());
		    payment.setAmount(paymentDTO.getAmount());
		    payment.setPaymentDate(LocalDateTime.now());
		    paymentRepository.save(payment);

		    BigDecimal newBalance = loan.getRemainingBalance().subtract(paymentDTO.getAmount());
		    loan.setRemainingBalance(newBalance);

		    loan.getPaymentSchedule().stream()
		        .filter(p -> p.getPaymentNumber() == paymentDTO.getPaymentNumber())
		        .findFirst()
		        .ifPresent(p -> p.setPaid(true));

		    if (newBalance.compareTo(BigDecimal.ZERO) <= 0) {
		        loan.setStatus("PAID");
		    }

		    loanRepository.save(loan);

		    return new PaymentResponseDTO(
		        loanId,
		        paymentDTO.getPaymentNumber(),
		        paymentDTO.getAmount(),
		        LocalDateTime.now(),
		        "COMPLETED",
		        newBalance
		    );
		} catch (Exception e) {
		    throw new IllegalArgumentException("Payment processing failed: " + e.getMessage());
		}
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
