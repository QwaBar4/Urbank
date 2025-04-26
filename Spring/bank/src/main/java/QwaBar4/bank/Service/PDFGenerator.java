package QwaBar4.bank.Service;

import QwaBar4.bank.DTO.TransactionDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class PDFGenerator {

    public byte[] generate(List<TransactionDTO> transactions) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage page = new PDPage();
            document.addPage(page);

            try (PDPageContentStream contentStream = new PDPageContentStream(document, page)) {
                contentStream.setFont(PDType1Font.HELVETICA_BOLD, 12);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 750);
                contentStream.showText("Transaction Statement");
                contentStream.endText();

                contentStream.setFont(PDType1Font.HELVETICA, 10);
                contentStream.beginText();
                contentStream.newLineAtOffset(50, 730);

                for (TransactionDTO transaction : transactions) {
                    contentStream.showText("Type: " + transaction.getType());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Amount: " + transaction.getAmount());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Timestamp: " + transaction.getTimestamp());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Description: " + transaction.getDescription());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Source Account: " + transaction.getSourceAccountNumber());
                    contentStream.newLineAtOffset(0, -15);
                    contentStream.showText("Target Account: " + transaction.getTargetAccountNumber());
                    contentStream.newLineAtOffset(0, -30); // Extra space between transactions
                }
                contentStream.endText();
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Failed to generate PDF", e);
        }
    }
}
