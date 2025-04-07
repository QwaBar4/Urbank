package QwaBar4.bank.Exception;

public class TransactionLimitException extends RuntimeException {
    public TransactionLimitException(String message) {
        super(message);
    }
}
