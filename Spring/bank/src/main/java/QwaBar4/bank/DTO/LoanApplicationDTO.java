package QwaBar4.bank.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class LoanApplicationDTO {
    
    @NotNull(message = "Principal amount is required")
    @Positive(message = "Principal amount must be positive")
    private Double principal;

    @NotNull(message = "Interest rate is required")
    @Positive(message = "Interest rate must be positive")
    private Double interestRate;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    @NotNull(message = "Term in months is required")
    @Positive(message = "Term in months must be positive")
    private Integer termMonths;

    // Constructors
    public LoanApplicationDTO() {}

    public LoanApplicationDTO(Double principal, Double interestRate, LocalDate startDate, Integer termMonths) {
        this.principal = principal;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.termMonths = termMonths;
    }

    // Getters and setters
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
}
