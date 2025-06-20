package QwaBar4.bank.Service;

import QwaBar4.bank.DTO.TransactionDTO;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class PDFGenerator {

    private static final float MARGIN = 40;
    private static final float TOP_MARGIN = 700;
    private static final float LINE_HEIGHT = 18;
    private static final float SECTION_SPACING = 25;
    private static final float FONT_SIZE = 10;
    private static final float TITLE_FONT_SIZE = 14;
    private static final float HEADER_FONT_SIZE = 12;
    private static final float BOX_PADDING = 15;
    private static final float BOX_MARGIN = 10;
    private static final float LOGO_WIDTH = 50;
    private static final float LOGO_MARGIN = 20;
    
    private Color bgColor;
    private Color textColor;
    private Color boxBorderColor;
    private Color boxBgColor;
    private PDImageXObject logoImage;

    public byte[] generate(List<TransactionDTO> transactions, String theme) throws IOException {
        loadLogoImage();
        setThemeColors(theme);

        try (PDDocument document = new PDDocument()) {
            PDPage currentPage = new PDPage(PDRectangle.A4);
            document.addPage(currentPage);
            
            PDPageContentStream contentStream = new PDPageContentStream(document, currentPage);
            float yPosition = TOP_MARGIN;
            float pageWidth = currentPage.getMediaBox().getWidth();
            
            setupPageBackground(contentStream, currentPage);
            yPosition = drawHeader(contentStream, yPosition, pageWidth);
            yPosition -= SECTION_SPACING;
            yPosition = drawAccountInfoHeader(contentStream, yPosition, pageWidth);
            yPosition -= SECTION_SPACING/2;
            
            for (TransactionDTO transaction : transactions) {
                float transactionHeight = calculateTransactionHeight(transaction);
                
                if (yPosition - transactionHeight < MARGIN) {
                    contentStream.close();
                    currentPage = new PDPage(PDRectangle.A4);
                    document.addPage(currentPage);
                    contentStream = new PDPageContentStream(document, currentPage);
                    setupPageBackground(contentStream, currentPage);
                    yPosition = drawHeader(contentStream, TOP_MARGIN, pageWidth);
                    yPosition -= SECTION_SPACING;
                    yPosition = drawAccountInfoHeader(contentStream, yPosition, pageWidth);
                    yPosition -= SECTION_SPACING/2;
                }
                
                yPosition = drawTransaction(contentStream, transaction, yPosition, pageWidth);
                yPosition -= SECTION_SPACING;
            }
            
            contentStream.close();
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.save(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void loadLogoImage() throws IOException {
        try {
            InputStream is = new ClassPathResource("static/images/logotype.jpg").getInputStream();
            byte[] logoBytes = new ClassPathResource("static/images/logotype.jpg").getContentAsByteArray();
            this.logoImage = PDImageXObject.createFromByteArray(PDDocument.load(is), logoBytes, "logo");
        } catch (IOException e) {
            System.err.println("Warning: Could not load logo image. PDF will be generated without logo.");
            this.logoImage = null;
        }
    }

    private void setThemeColors(String theme) {
        if ("light".equalsIgnoreCase(theme)) {
            bgColor = new Color(255, 255, 255);
            textColor = new Color(0, 0, 0); 
            boxBorderColor = new Color(200, 200, 200);
            boxBgColor = new Color(255, 255, 255);
        } else {
            bgColor = new Color(0, 0, 0);
            textColor = new Color(255, 255, 255);
            boxBorderColor = new Color(255, 255, 255);
            boxBgColor = new Color(0, 0, 0); 
        }
    }
    
    private float drawHeader(PDPageContentStream contentStream, float yPosition, float pageWidth) throws IOException {
        // Draw logo if available
        if (logoImage != null) {
            float logoHeight = LOGO_WIDTH * ((float)logoImage.getHeight() / logoImage.getWidth());
            float logoX = MARGIN;
            float logoY = yPosition - logoHeight/2;
            contentStream.drawImage(logoImage, logoX, logoY, LOGO_WIDTH, logoHeight);
        }

        // Draw title
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, TITLE_FONT_SIZE);
        contentStream.setNonStrokingColor(textColor);
        
        String title = "Transaction Statement";
        float titleWidth = PDType1Font.HELVETICA_BOLD.getStringWidth(title) / 1000 * TITLE_FONT_SIZE;
        float titleX = (pageWidth - titleWidth) / 2;
        
        // Adjust title position if logo is present
        if (logoImage != null) {
            titleX = Math.max(titleX, MARGIN + LOGO_WIDTH + LOGO_MARGIN);
        }
        
        contentStream.beginText();
        contentStream.newLineAtOffset(titleX, yPosition);
        contentStream.showText(title);
        contentStream.endText();
        
        return yPosition - LINE_HEIGHT;
    }
    
    private void setupPageBackground(PDPageContentStream contentStream, PDPage page) throws IOException {
        contentStream.setNonStrokingColor(bgColor);
        contentStream.addRect(0, 0, page.getMediaBox().getWidth(), page.getMediaBox().getHeight());
        contentStream.fill();
        contentStream.setNonStrokingColor(textColor);
    }
    
    private float drawAccountInfoHeader(PDPageContentStream contentStream, float yPosition, float pageWidth) throws IOException {
        contentStream.setFont(PDType1Font.HELVETICA, FONT_SIZE);
        contentStream.setNonStrokingColor(textColor);
        
        String dateInfo = "Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"));
        float dateWidth = PDType1Font.HELVETICA.getStringWidth(dateInfo) / 1000 * FONT_SIZE;
        
        contentStream.beginText();
        contentStream.newLineAtOffset(pageWidth - MARGIN - dateWidth, yPosition);
        contentStream.showText(dateInfo);
        contentStream.endText();
        
        return yPosition - LINE_HEIGHT;
    }
    
    private float drawTransaction(PDPageContentStream contentStream, TransactionDTO transaction, float yPosition, float pageWidth) throws IOException {
        float boxWidth = pageWidth - 2 * MARGIN;
        float boxHeight = calculateTransactionHeight(transaction);
        float boxX = MARGIN;
        float boxY = yPosition - boxHeight;
        
        drawRoundedBox(contentStream, boxX, boxY, boxWidth, boxHeight);
        
        float textX = boxX + BOX_PADDING;
        float textY = boxY + boxHeight - BOX_PADDING - FONT_SIZE;
        
        contentStream.setNonStrokingColor(textColor);
        contentStream.setFont(PDType1Font.HELVETICA_BOLD, HEADER_FONT_SIZE);
        contentStream.beginText();
        contentStream.newLineAtOffset(textX, textY);
        contentStream.showText(transaction.getType() + " - " + formatAmount(transaction.getAmount()));
        contentStream.endText();
        
        textY -= LINE_HEIGHT;
        
        contentStream.setFont(PDType1Font.HELVETICA, FONT_SIZE);
        contentStream.beginText();
        contentStream.newLineAtOffset(textX, textY);
        
        contentStream.showText("Date: " + formatDate(transaction.getTimestamp()));
        textY -= LINE_HEIGHT;
        contentStream.newLineAtOffset(0, -LINE_HEIGHT);
        
        contentStream.showText("Description: " + transaction.getDescription());
        textY -= LINE_HEIGHT;
        contentStream.newLineAtOffset(0, -LINE_HEIGHT);
        
        if (transaction.getType().equals("DEPOSIT")) {
            contentStream.showText("From: " + transaction.getSourceAccountOwner());
        } else if (transaction.getType().equals("WITHDRAWAL")) {
            contentStream.showText("From: " + transaction.getSourceAccountOwner());
        } else {
            contentStream.showText("From: " + transaction.getSourceAccountOwner());
            textY -= LINE_HEIGHT;
            contentStream.newLineAtOffset(0, -LINE_HEIGHT);
            contentStream.showText("To: " + transaction.getTargetAccountOwner());
        }
        
        contentStream.endText();
        
        return boxY;
    }
    
    private void drawRoundedBox(PDPageContentStream contentStream, float x, float y, float width, float height) throws IOException {
        final float cornerRadius = 5;
        
        contentStream.setNonStrokingColor(boxBgColor);
        contentStream.setStrokingColor(boxBorderColor);
        contentStream.setLineWidth(1f);
        
        contentStream.moveTo(x + cornerRadius, y + height);
        contentStream.lineTo(x + width - cornerRadius, y + height);
        contentStream.curveTo(
            x + width, y + height,
            x + width, y + height,
            x + width, y + height - cornerRadius
        );
        contentStream.lineTo(x + width, y + cornerRadius);
        contentStream.curveTo(
            x + width, y,
            x + width, y,
            x + width - cornerRadius, y
        );
        contentStream.lineTo(x + cornerRadius, y);
        contentStream.curveTo(
            x, y,
            x, y,
            x, y + cornerRadius
        );
        contentStream.lineTo(x, y + height - cornerRadius);
        contentStream.curveTo(
            x, y + height,
            x, y + height,
            x + cornerRadius, y + height
        );
        
        contentStream.fill();
        contentStream.stroke();

        contentStream.setNonStrokingColor(textColor);
    }
    
    private float calculateTransactionHeight(TransactionDTO transaction) {
        int lineCount = 4;
        if (transaction.getType().equals("TRANSFER")) {
            lineCount += 1;
        }
        return BOX_PADDING * 2 + (lineCount * LINE_HEIGHT);
    }
    
    private String formatAmount(BigDecimal amount) {
        return String.format("$%,.2f", amount);
    }
    
    private String formatDate(LocalDateTime date) {
        return date.format(DateTimeFormatter.ofPattern("MMM dd, yyyy HH:mm"));
    }
}
