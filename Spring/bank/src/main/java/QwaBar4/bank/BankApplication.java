package QwaBar4.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BankApplication {

	public static void main(String[] args) {
        SpringApplication app = new SpringApplication(BankApplication.class);
        app.setLogStartupInfo(false);
        app.run(args);
	}

}
