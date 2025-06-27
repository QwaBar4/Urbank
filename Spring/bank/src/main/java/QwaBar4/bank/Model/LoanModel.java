package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "loans")
public class LoanModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Double principal;
    private Double interestRate;
    private LocalDate startDate;
    private Integer termMonths;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PaymentSchedule> paymentSchedule = new ArrayList<>();
    
    @Column(length = 20)
    private String status;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private AccountModel account;
    
    @PrePersist
    public void setDefaultStatus() {
        if (status == null) {
            status = "PENDING";
        }
    }

    public LoanModel() {
    }

    public LoanModel(Double principal, Double interestRate, LocalDate startDate, Integer termMonths) {
        this.principal = principal;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.termMonths = termMonths;
    }

    public void generatePaymentSchedule() {
        this.paymentSchedule.clear(); // Now safe since list is initialized
        
        double monthlyInterestRate = interestRate / 100 / 12;
        double monthlyPayment = principal * 
            (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, termMonths)) / 
            (Math.pow(1 + monthlyInterestRate, termMonths) - 1);
        
        LocalDate paymentDate = startDate;
        double remainingPrincipal = principal;
        
        for (int i = 1; i <= termMonths; i++) {
            double interestPayment = remainingPrincipal * monthlyInterestRate;
            double principalPayment = monthlyPayment - interestPayment;
            
            PaymentSchedule schedule = new PaymentSchedule();
            schedule.setPaymentNumber(i);
            schedule.setPaymentDate(paymentDate);
            schedule.setPrincipalAmount(principalPayment);
            schedule.setInterestAmount(interestPayment);
            schedule.setTotalPayment(monthlyPayment);
            schedule.setRemainingBalance(remainingPrincipal - principalPayment);
            schedule.setLoan(this);
            
            this.paymentSchedule.add(schedule);
            
            remainingPrincipal -= principalPayment;
            paymentDate = paymentDate.plusMonths(1);
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getPrincipal() {
        return principal;
    }

    public void setPrincipal(Double principal) {
        this.principal = principal;
    }

    public Double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(Double interestRate) {
        this.interestRate = interestRate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public Integer getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(Integer termMonths) {
        this.termMonths = termMonths;
    }

    public List<PaymentSchedule> getPaymentSchedule() {
        return paymentSchedule;
    }

    public void setPaymentSchedule(List<PaymentSchedule> paymentSchedule) {
        this.paymentSchedule = paymentSchedule;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getStatus() {
        return status;
    }
    
    public AccountModel getAccount() {
        return account;
    }

    public Long getAccountId() {
        return account.getId();
    }

    public void setAccount(AccountModel account) {
        this.account = account;
    }
}
