package QwaBar4.bank.DTO;

import java.time.LocalDate;
import lombok.Data;
import java.util.List;
import java.math.BigDecimal;

@Data
public class LoanResponseDTO {
    private Long id;
    private BigDecimal principal;
    private double interestRate;
    private LocalDate startDate;
    private Integer termMonths;
    private String status;
    private String username;
    private List<PaymentScheduleDTO> paymentSchedule;
	
	@Data
    public static class PaymentScheduleDTO {
        private int paymentNumber;
        private LocalDate paymentDate;
        private BigDecimal principalAmount;
        private BigDecimal interestAmount;
        private BigDecimal totalPayment;
        private BigDecimal remainingBalance;
        private boolean isPaid;
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

    public double getInterestRate() {
        return interestRate;
    }

    public void setInterestRate(double interestRate) {
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }
}
