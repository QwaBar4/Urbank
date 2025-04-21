package QwaBar4.bank.Service;

public class StatementPDF {
    private byte[] content;

    public StatementPDF(byte[] content) {
        this.content = content;
    }

    public byte[] getContent() {
        return content;
    }

    public void setContent(byte[] content) {
        this.content = content;
    }
}
