package QwaBar4.bank.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;

import jakarta.validation.Valid; 

import java.util.List;
import java.util.Map;

import QwaBar4.bank.DTO.*;
import QwaBar4.bank.Service.*;
import QwaBar4.bank.Model.LoanModel;


@RestController
@RequestMapping("/api/loans")
public class LoanController {
    @Autowired
    private LoanService loanService;

	@PostMapping("/apply")
	@PreAuthorize("hasRole('USER')")
	public ResponseEntity<LoanModel> applyForLoan(@Valid @RequestBody LoanApplicationDTO application) {
		LoanModel loan = new LoanModel();
		loan.setPrincipal(application.getPrincipal());
		loan.setInterestRate(application.getInterestRate());
		loan.setStartDate(application.getStartDate());
		loan.setTermMonths(application.getTermMonths());
		
		// Assuming you have a method in LoanService to save the loan
		LoanModel savedLoan = loanService.createLoan(loan);
		return ResponseEntity.status(HttpStatus.CREATED).body(savedLoan);
	}
	
}
