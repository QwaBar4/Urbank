package QwaBar4.bank;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class BankApplication {

	public static void main(String[] args) {
        SpringApplication app = new SpringApplication(BankApplication.class);
        app.setLogStartupInfo(false);
        app.run(args);
	}

}
