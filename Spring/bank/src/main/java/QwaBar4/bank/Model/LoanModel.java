package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.math.BigDecimal;
import java.math.RoundingMode;

@Entity
@Table(name = "loans")
public class LoanModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private BigDecimal principal;
    private Double interestRate;
    private LocalDate startDate;
    private Integer termMonths;

    @OneToMany(mappedBy = "loan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<PaymentSchedule> paymentSchedule = new ArrayList<>();

    @Column(name = "remaining_balance")
    private BigDecimal remainingBalance;
    
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

    public LoanModel(BigDecimal principal, Double interestRate, LocalDate startDate, Integer termMonths) {
        this.principal = principal;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.termMonths = termMonths;
    }

	public void generatePaymentSchedule() {
		this.paymentSchedule.clear();
		this.remainingBalance = this.principal;

		BigDecimal monthlyInterestRate = BigDecimal.valueOf(this.interestRate).divide(BigDecimal.valueOf(100 * 12), 10, RoundingMode.HALF_UP);
		BigDecimal monthlyPayment = this.principal.multiply(monthlyInterestRate)
		    .multiply(BigDecimal.valueOf(Math.pow(1 + monthlyInterestRate.doubleValue(), this.termMonths)))
		    .divide(BigDecimal.valueOf(Math.pow(1 + monthlyInterestRate.doubleValue(), this.termMonths) - 1), RoundingMode.HALF_UP);

		LocalDate paymentDate = this.startDate;
		BigDecimal remainingPrincipal = this.principal;

		for (int i = 1; i <= this.termMonths; i++) {
		    BigDecimal interestPayment = remainingPrincipal.multiply(monthlyInterestRate);
		    BigDecimal principalPayment = monthlyPayment.subtract(interestPayment);

		    PaymentSchedule schedule = new PaymentSchedule();
		    schedule.setPaymentNumber(i);
		    schedule.setPaymentDate(paymentDate);
		    schedule.setPrincipalAmount(principalPayment);
		    schedule.setInterestAmount(interestPayment);
		    schedule.setTotalPayment(monthlyPayment);
		    schedule.setRemainingBalance(remainingPrincipal.subtract(principalPayment));
		    schedule.setLoan(this);

		    this.paymentSchedule.add(schedule);

		    remainingPrincipal = remainingPrincipal.subtract(principalPayment);
		    paymentDate = paymentDate.plusMonths(1);
		}
	}


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getPrincipal() {
        return principal;
    }

    public void setPrincipal(BigDecimal principal) {
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
    
    public BigDecimal getRemainingBalance() {
    return remainingBalance;
	}

	public void setRemainingBalance(BigDecimal remainingBalance) {
		this.remainingBalance = remainingBalance;
	}
}
