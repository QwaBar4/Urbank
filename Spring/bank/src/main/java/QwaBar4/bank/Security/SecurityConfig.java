package QwaBar4.bank.Security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.XorCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.header.HeaderWriterFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.http.HttpHeaders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.http.HttpMethod;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.core.annotation.Order;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import QwaBar4.bank.Service.UserModelService;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collection;
import java.util.Collections;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final UserModelService appUserService;
    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Autowired
    public SecurityConfig(UserModelService appUserService, 
                         JwtUtil jwtUtil,
                         UserDetailsService userDetailsService) {
        this.appUserService = appUserService;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
    }
    @Bean
    public UserDetailsService userDetailsService() {
        return appUserService;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(appUserService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

	@Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
			.sessionManagement(session -> session
				.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
			)
			.headers(headers -> headers
            	.contentSecurityPolicy(csp -> csp
            	    .policyDirectives("default-src 'self'")
            	)
       		)
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                .requestMatchers("/", "/index", "/login", "/signup", "/req/**", "/api/**", "/auth/**", "/static/**", "/favicon.ico", "/auth/send-code", "/req/signup", "/auth/send-recovery-code","/auth/verify-recovery-code", "/auth/verify-code", "/login/recovery/reset", "/api/transactions/transfer", "/api/transactions/deposit", "/api/transactions/withdraw", "/admin/**", "/admin/users**", "/api/admin/dashboard" ).permitAll()
                .requestMatchers(HttpMethod.DELETE, "/api/delete-user").authenticated() 
                .requestMatchers("/api/user/**").authenticated()
    			.requestMatchers("/api/**").permitAll() 
    			.requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")
    			.requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(new JwtAuthenticationFilter(jwtUtil, userDetailsService),UsernamePasswordAuthenticationFilter.class)
		    .csrf(csrf -> csrf.disable())
		    .exceptionHandling(exception -> exception
            .authenticationEntryPoint((request, response, authException) -> {
            })
        );

        return http.build();
    }
    
    

    private static class CookieSameSiteFilter extends OncePerRequestFilter {
        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain filterChain) throws ServletException, IOException {

            Collection<String> headers = response.getHeaders(HttpHeaders.SET_COOKIE);
            headers.forEach(header -> {
                if (header.startsWith("JSESSIONID") || header.startsWith("XSRF-TOKEN")) {
                    String updatedHeader = header + "; SameSite=Lax";
                    response.setHeader(HttpHeaders.SET_COOKIE, updatedHeader);
                }
            });
            filterChain.doFilter(request, response);
        }
    }

}
