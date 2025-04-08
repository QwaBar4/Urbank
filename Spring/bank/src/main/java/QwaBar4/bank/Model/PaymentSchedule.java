package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
public class PaymentSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private LocalDate dueDate;
    private Double paymentAmount;
    private Double principalAmount;
    private Double interestAmount;
    private Boolean isPaid = false;
    
    @ManyToOne
    @JoinColumn(name = "loan_id")
    private LoanModel loan;

    // Constructors, getters, and setters
    public PaymentSchedule() {}

    public PaymentSchedule(LocalDate dueDate, Double paymentAmount, 
                         Double principalAmount, Double interestAmount) {
        this.dueDate = dueDate;
        this.paymentAmount = paymentAmount;
        this.principalAmount = principalAmount;
        this.interestAmount = interestAmount;
    }

    // Getters and setters for all fields
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDate getDueDate() { return dueDate; }
    public void setDueDate(LocalDate dueDate) { this.dueDate = dueDate; }
    public Double getPaymentAmount() { return paymentAmount; }
    public void setPaymentAmount(Double paymentAmount) { this.paymentAmount = paymentAmount; }
    public Double getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(Double principalAmount) { this.principalAmount = principalAmount; }
    public Double getInterestAmount() { return interestAmount; }
    public void setInterestAmount(Double interestAmount) { this.interestAmount = interestAmount; }
    public Boolean getIsPaid() { return isPaid; }
    public void setIsPaid(Boolean paid) { isPaid = paid; }
    public LoanModel getLoan() { return loan; }
    public void setLoan(LoanModel loan) { this.loan = loan; }
}
