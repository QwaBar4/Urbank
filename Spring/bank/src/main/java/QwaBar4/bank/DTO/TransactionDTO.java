package QwaBar4.bank.DTO;

import java.time.LocalDateTime;

public class TransactionDTO {
    private Long id;
    private String type;
    private double amount;
    private LocalDateTime timestamp;
    private String description;
    private String user;
    private String sourceAccountNumber;
    private String sourceAccountOwner;
    private String targetAccountNumber;
    private String targetAccountOwner;
    private String transferDescription;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUser () {
        return user;
    }

    public void setUser (String user) {
        this.user = user;
    }

    public String getSourceAccountNumber() {
        return sourceAccountNumber;
    }

    public void setSourceAccountNumber(String sourceAccountNumber) {
        this.sourceAccountNumber = sourceAccountNumber;
    }

    public String getSourceAccountOwner() {
        return sourceAccountOwner;
    }

    public void setSourceAccountOwner(String sourceAccountOwner) {
        this.sourceAccountOwner = sourceAccountOwner;
    }

    public String getTargetAccountNumber() {
        return targetAccountNumber;
    }

    public void setTargetAccountNumber(String targetAccountNumber) {
        this.targetAccountNumber = targetAccountNumber;
    }

    public String getTargetAccountOwner() {
        return targetAccountOwner;
    }

    public void setTargetAccountOwner(String targetAccountOwner) {
        this.targetAccountOwner = targetAccountOwner;
    }
    
    public String getTransferDescription() {
        return transferDescription;
    }

    public void setTransferDescription(String transferDescription) {
        this.transferDescription = transferDescription;
    }
}
