package QwaBar4.bank.Model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "payment_schedules")
public class PaymentSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int paymentNumber;
    private LocalDate paymentDate;
    private double principalAmount;
    private double interestAmount;
    private double totalPayment;
    private double remainingBalance;
    private boolean isPaid = false;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "loan_id")
    private LoanModel loan;

    // Constructors
    public PaymentSchedule() {}
    
    public PaymentSchedule(int paymentNumber, LocalDate paymentDate, 
                         double principalAmount, double interestAmount,
                         double totalPayment, double remainingBalance) {
        this.paymentNumber = paymentNumber;
        this.paymentDate = paymentDate;
        this.principalAmount = principalAmount;
        this.interestAmount = interestAmount;
        this.totalPayment = totalPayment;
        this.remainingBalance = remainingBalance;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public int getPaymentNumber() { return paymentNumber; }
    public void setPaymentNumber(int paymentNumber) { this.paymentNumber = paymentNumber; }
    
    public LocalDate getPaymentDate() { return paymentDate; }
    public void setPaymentDate(LocalDate paymentDate) { this.paymentDate = paymentDate; }
    
    public double getPrincipalAmount() { return principalAmount; }
    public void setPrincipalAmount(double principalAmount) { this.principalAmount = principalAmount; }
    
    public double getInterestAmount() { return interestAmount; }
    public void setInterestAmount(double interestAmount) { this.interestAmount = interestAmount; }
    
    public double getTotalPayment() { return totalPayment; }
    public void setTotalPayment(double totalPayment) { this.totalPayment = totalPayment; }
    
    public double getRemainingBalance() { return remainingBalance; }
    public void setRemainingBalance(double remainingBalance) { this.remainingBalance = remainingBalance; }
    
    public boolean isPaid() { return isPaid; }
    public void setPaid(boolean paid) { isPaid = paid; }
    
    public LoanModel getLoan() { return loan; }
    public void setLoan(LoanModel loan) { this.loan = loan; }
}
