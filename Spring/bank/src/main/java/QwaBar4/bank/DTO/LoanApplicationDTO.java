package QwaBar4.bank.DTO;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDate;

public class LoanApplicationDTO {

	private Long id;
    
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
	
	@NotNull @Positive
	private Long accountId;
	
	private String status;
	
    public LoanApplicationDTO() {}

    public LoanApplicationDTO(Long id, Double principal, Double interestRate, LocalDate startDate, Integer termMonths, Long accountId, String status) {
        this.id = id;
        this.principal = principal;
        this.interestRate = interestRate;
        this.startDate = startDate;
        this.termMonths = termMonths;
        this.accountId = accountId;
        this.status = status;
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
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getStatus() {
        return status;
    }

    public Integer getTermMonths() {
        return termMonths;
    }

    public void setTermMonths(Integer termMonths) {
        this.termMonths = termMonths;
    }
    
    public Long getAccountId() {
        return accountId;
    }
    
    public void setAccountId(Long accountId) {
        this.accountId = accountId;
    }
}
