package QwaBar4.bank.Service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import QwaBar4.bank.Model.AccountModel;
import java.util.List;
import java.math.BigDecimal;
import QwaBar4.bank.Model.AccountModelRepository;
import java.time.LocalDateTime;

@Service
public class InterestService {

    private final AccountModelRepository accountRepository;
    private static final double ANNUAL_INTEREST_RATE = 1.0; // 1% annual interest

    public InterestService(AccountModelRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

	@Scheduled(cron = "0 0 0 * * *") // Runs daily at midnight
	@Transactional
	public void applyDailyInterest() {
		List<AccountModel> accounts = accountRepository.findAll();
		for (AccountModel account : accounts) {
		    BigDecimal dailyInterest = account.getBalance().multiply(BigDecimal.valueOf(ANNUAL_INTEREST_RATE / 36500));
		    account.setBalance(account.getBalance().add(dailyInterest));
		    account.setLastInterestCalculation(LocalDateTime.now());
		}
		accountRepository.saveAll(accounts);
	}
	
}
