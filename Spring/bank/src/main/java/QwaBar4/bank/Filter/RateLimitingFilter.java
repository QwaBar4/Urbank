package QwaBar4.bank.Filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        // Implement rate limiting logic here
        filterChain.doFilter(request, response);
    }
}
