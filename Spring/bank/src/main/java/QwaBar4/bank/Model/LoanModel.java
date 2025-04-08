package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
public class LoanModel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private Double principal;
    private Double interestRate;
    private LocalDate startDate;
    private Integer termMonths;
    
    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentSchedule> paymentSchedule;

    @ManyToOne
    @JoinColumn(name = "account_id")
    private AccountModel account;

    // Constructors
    public LoanModel() {}

    public LoanModel(Double principal, Double interestRate, 
                    LocalDate startDate, Integer termMonths) {
        this.principal = principal;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.termMonths = termMonths;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Double getPrincipal() { return principal; }
    public void setPrincipal(Double principal) { this.principal = principal; }
    public Double getInterestRate() { return interestRate; }
    public void setInterestRate(Double interestRate) { this.interestRate = interestRate; }
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    public Integer getTermMonths() { return termMonths; }
    public void setTermMonths(Integer termMonths) { this.termMonths = termMonths; }
    public List<PaymentSchedule> getPaymentSchedule() { return paymentSchedule; }
    public void setPaymentSchedule(List<PaymentSchedule> paymentSchedule) { 
        this.paymentSchedule = paymentSchedule; 
    }
    public AccountModel getAccount() { return account; }
    public void setAccount(AccountModel account) { this.account = account; }

    // Helper method to generate payment schedule
    public void generatePaymentSchedule() {
        // Implementation would calculate each payment
        // based on principal, interest rate, and term
    }
}
