package QwaBar4.bank.Utils;

import java.math.BigInteger;
import java.util.UUID;

public class AccountNumberUtils {

    public static String convertUuidToFormattedNumber(String internalNumber) {
        String uuidString = internalNumber.substring(4);
        BigInteger uuidAsNumber = new BigInteger(uuidString.replace("-", ""), 16);
        String formattedNumber = uuidAsNumber.toString();
        
        while (formattedNumber.length() < 16) {
            formattedNumber = "0" + formattedNumber;
        }
        
        return formattedNumber.length() > 16 ? formattedNumber.substring(formattedNumber.length() - 16) : formattedNumber;
    }
}
