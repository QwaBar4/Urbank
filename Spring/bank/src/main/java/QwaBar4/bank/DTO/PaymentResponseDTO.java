package QwaBar4.bank.DTO;

import java.time.LocalDateTime;
import java.math.BigDecimal;

public class PaymentResponseDTO {
    private Long loanId;
    private Integer paymentNumber;
    private BigDecimal amountPaid;
    private LocalDateTime paymentDate;
    private String status;
    private BigDecimal remainingBalance;

    public PaymentResponseDTO() {
    }

    public PaymentResponseDTO(Long loanId, Integer paymentNumber, BigDecimal amountPaid, 
                            LocalDateTime paymentDate, String status, BigDecimal remainingBalance) {
        this.loanId = loanId;
        this.paymentNumber = paymentNumber;
        this.amountPaid = amountPaid;
        this.paymentDate = paymentDate;
        this.status = status;
        this.remainingBalance = remainingBalance;
    }

    public Long getLoanId() {
        return loanId;
    }

    public void setLoanId(Long loanId) {
        this.loanId = loanId;
    }

    public Integer getPaymentNumber() {
        return paymentNumber;
    }

    public void setPaymentNumber(Integer paymentNumber) {
        this.paymentNumber = paymentNumber;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(BigDecimal amountPaid) {
        this.amountPaid = amountPaid;
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getRemainingBalance() {
        return remainingBalance;
    }

    public void setRemainingBalance(BigDecimal remainingBalance) {
        this.remainingBalance = remainingBalance;
    }
}
