package QwaBar4.bank.DTO;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class LoanPaymentDTO {
    @NotNull(message = "Payment number is required")
    private Integer paymentNumber;
    
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private BigDecimal amount;
    
    private String accountNumber;
    
    public LoanPaymentDTO() {
    }

    public LoanPaymentDTO(Integer paymentNumber, BigDecimal amount) {
        this.paymentNumber = paymentNumber;
        this.amount = amount;
    }

    public Integer getPaymentNumber() {
        return paymentNumber;
    }

    public void setPaymentNumber(Integer paymentNumber) {
        this.paymentNumber = paymentNumber;
    }
    
    public String getAccountNumber() {
        return accountNumber;
    }

    public void setAccountNumber(String accountNumber) {
        this.accountNumber = accountNumber;
    }
    
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
