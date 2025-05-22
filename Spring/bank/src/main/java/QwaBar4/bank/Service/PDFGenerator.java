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

    private static final float MARGIN = 50;
    private static final float TOP_MARGIN = 750;
    private static final float LINE_HEIGHT = 15;
    private static final float SECTION_SPACING = 30;
    private static final float FONT_SIZE = 10;
    private static final float TITLE_FONT_SIZE = 12;

    public byte[] generate(List<TransactionDTO> transactions) throws IOException {
        try (PDDocument document = new PDDocument()) {
            PDPage currentPage = new PDPage();
            document.addPage(currentPage);
            
            PDPageContentStream contentStream = new PDPageContentStream(document, currentPage);
            float yPosition = TOP_MARGIN;
            
            drawTitle(contentStream, yPosition);
            yPosition -= LINE_HEIGHT * 2;
            
            for (TransactionDTO transaction : transactions) {
                float transactionHeight = calculateTransactionHeight(transaction);
                
                if (yPosition - transactionHeight < MARGIN) {
                    contentStream.close();
                    
                    currentPage = new PDPage();
                    document.addPage(currentPage);
                    contentStream = new PDPageContentStream(document, currentPage);
                    yPosition = TOP_MARGIN;
                }
                
                yPosition = drawTransaction(contentStream, transaction, yPosition);
                
                yPosition -= SECTION_SPACING;
            }
            
            contentStream.close();
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private void drawTitle(PDPageContentStream contentStream, float yPosition) throws IOException {
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, TITLE_FONT_SIZE);
        contentStream.beginText();
        contentStream.newLineAtOffset(MARGIN, yPosition);
        contentStream.showText("Transaction Statement");
        contentStream.endText();
    }
    
    private float drawTransaction(PDPageContentStream contentStream, TransactionDTO transaction, float yPosition) throws IOException {
        contentStream.setFont(PDType1Font.HELVETICA, FONT_SIZE);
        contentStream.beginText();
        
        float currentY = yPosition;
        contentStream.newLineAtOffset(MARGIN, currentY);
        contentStream.showText("Type: " + transaction.getType());
        
        currentY -= LINE_HEIGHT;
        contentStream.newLineAtOffset(0, -LINE_HEIGHT);
        contentStream.showText("Amount: " + transaction.getAmount());
        
        currentY -= LINE_HEIGHT;
        contentStream.newLineAtOffset(0, -LINE_HEIGHT);
        contentStream.showText("Timestamp: " + transaction.getTimestamp());
        
        currentY -= LINE_HEIGHT;
        contentStream.newLineAtOffset(0, -LINE_HEIGHT);
        contentStream.showText("Description: " + transaction.getDescription());
        
        if(transaction.getType().equals("DEPOSIT")) {
            currentY -= LINE_HEIGHT;
            contentStream.newLineAtOffset(0, -LINE_HEIGHT);
            contentStream.showText("Target Account: " + transaction.getTargetAccountOwner());
        }
        else if(transaction.getType().equals("WITHDRAWAL")) {
            currentY -= LINE_HEIGHT;
            contentStream.newLineAtOffset(0, -LINE_HEIGHT);
            contentStream.showText("Source Account: " + transaction.getSourceAccountOwner());
        }
        else {
            currentY -= LINE_HEIGHT;
            contentStream.newLineAtOffset(0, -LINE_HEIGHT);
            contentStream.showText("Source Account: " + transaction.getSourceAccountOwner());
            
            currentY -= LINE_HEIGHT;
            contentStream.newLineAtOffset(0, -LINE_HEIGHT);
            contentStream.showText("Target Account: " + transaction.getTargetAccountOwner());
        }
        
        contentStream.endText();
        return currentY;
    }
    
    private float calculateTransactionHeight(TransactionDTO transaction) {
        float height = 4 * LINE_HEIGHT;
        
        if (transaction.getType().equals("TRANSFER")) {
            height += 2 * LINE_HEIGHT; 
        } else {
            height += LINE_HEIGHT;
        }
        
        return height + SECTION_SPACING;
    }
}
