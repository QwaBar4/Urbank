package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
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

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PaymentSchedule> paymentSchedule;
    
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

    // Getters and Setters

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
    
	public void generatePaymentSchedule() {

    }
}
