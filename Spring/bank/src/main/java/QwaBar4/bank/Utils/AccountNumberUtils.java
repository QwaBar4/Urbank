package QwaBar4.bank.Utils;

import org.springframework.stereotype.Component;

import java.nio.ByteBuffer;
import java.util.Base64;
import java.util.UUID;
import java.math.BigInteger;

@Component
public class AccountNumberUtils {

    private static final String BASE62_CHARS = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    public static String convertUuidToFormattedNumber(String internalNumber) {
        if (!internalNumber.startsWith("ACC-"))
            throw new IllegalArgumentException("Account number must start with 'ACC-' prefix");
        String uuidStr = internalNumber.substring(4);
        UUID uuid = UUID.fromString(uuidStr);
        return encodeBase62(uuid);
    }

    public static String convertFormattedNumberToUuid(String formattedNumber) {
        UUID uuid = decodeBase62(formattedNumber);
        return "ACC-" + uuid.toString();
    }

    private static String encodeBase62(UUID uuid) {
        byte[] bytes = asBytes(uuid);
        BigInteger bigInt = new BigInteger(1, bytes);
        StringBuilder sb = new StringBuilder();
        while (bigInt.compareTo(BigInteger.ZERO) > 0) {
            sb.append(BASE62_CHARS.charAt(bigInt.mod(BigInteger.valueOf(62)).intValue()));
            bigInt = bigInt.divide(BigInteger.valueOf(62));
        }
        // Pad to ensure it's always 6 characters long
        while (sb.length() < 6) {
            sb.insert(0, '0'); // Padding with '0' to the left
        }
        return sb.reverse().toString();
    }

    private static UUID decodeBase62(String base62) {
        BigInteger bigInt = BigInteger.ZERO;
        for (int i = 0; i < base62.length(); i++) {
            bigInt = bigInt.multiply(BigInteger.valueOf(62)).add(BigInteger.valueOf(BASE62_CHARS.indexOf(base62.charAt(i))));
        }
        byte[] bytes = bigInt.toByteArray();
        // Ensure the byte array is 16 bytes long
        byte[] uuidBytes = new byte[16];
        System.arraycopy(bytes, Math.max(0, bytes.length - 16), uuidBytes, Math.max(0, 16 - bytes.length), Math.min(16, bytes.length));
        return asUuid(uuidBytes);
    }

    private static byte[] asBytes(UUID uuid) {
        ByteBuffer bb = ByteBuffer.wrap(new byte[16]);
        bb.putLong(uuid.getMostSignificantBits());
        bb.putLong(uuid.getLeastSignificantBits());
        return bb.array();
    }

    private static UUID asUuid(byte[] bytes) {
        ByteBuffer bb = ByteBuffer.wrap(bytes);
        long high = bb.getLong();
        long low = bb.getLong();
        return new UUID(high, low);
    }
}
