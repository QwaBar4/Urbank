package QwaBar4.bank.Service;

import QwaBar4.bank.DTO.TransactionDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.io.IOException;

@Service
public class StatementService {
    private final TransactionService transactionService;
    private final AnonymizationService anonymizationService;
    private final PDFGenerator pdfGenerator;

    @Autowired
    public StatementService(TransactionService transactionService,
                            AnonymizationService anonymizationService,
                            PDFGenerator pdfGenerator) {
        this.transactionService = transactionService;
        this.anonymizationService = anonymizationService;
        this.pdfGenerator = pdfGenerator;
    }

	public StatementPDF generateStatement(Long accountId, String theme) {
		List<TransactionDTO> transactions = transactionService.getUserTransactionsById(accountId);

		// Check for empty transactions
		if (transactions.isEmpty()) {
		    throw new RuntimeException("No transactions found for the account");
		}

		// Anonymize transaction data
		transactions.forEach(t -> {
		    t.setSourceAccountNumber(anonymizationService.anonymize(t.getSourceAccountNumber()));
		    t.setTargetAccountNumber(anonymizationService.anonymize(t.getTargetAccountNumber()));
		});

		try {
		    byte[] pdfContent = pdfGenerator.generate(transactions, theme);
		    return new StatementPDF(pdfContent);
		} catch (IOException e) {
		    throw new RuntimeException("Failed to generate PDF statement: " + e.getMessage(), e);
		}
	}
}
