package QwaBar4.bank.Filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.concurrent.TimeUnit; 
import org.springframework.http.HttpStatus;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.data.redis.core.RedisTemplate;
import java.io.IOException;

public class RateLimitingFilter extends OncePerRequestFilter {
    private final RedisTemplate<String, String> redisTemplate;
    private final int maxRequests;
    private final int timeWindow;

    public RateLimitingFilter(RedisTemplate<String, String> redisTemplate, int maxRequests, int timeWindow) {
        this.redisTemplate = redisTemplate;
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
    }

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
		String ip = request.getRemoteAddr();
		String key = "rate_limit:" + ip;

		Long count = redisTemplate.opsForValue().increment(key, 1);
		if (count == 1) {
		    redisTemplate.expire(key, timeWindow, TimeUnit.SECONDS);
		}

		if (count > maxRequests) {
		    response.sendError(HttpStatus.TOO_MANY_REQUESTS.value(), "Rate limit exceeded");
		    return;
		}
		filterChain.doFilter(request, response);
	}
}
