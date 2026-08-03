package com.augustine.gplfantasyleaague.domain.auth.security;

import com.augustine.gplfantasyleaague.domain.auth.service.UserDetailsServiceImpl;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    public JwtAuthFilter(JwtService jwtService, UserDetailsServiceImpl userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if(auth == null || !auth.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }

        String token = auth.substring(7);

        // A malformed, expired, or invalidly-signed token (e.g. issued before a
        // secret rotation, or for a user that no longer exists) must NOT crash
        // the request - it should just be treated as "not authenticated" and let
        // Spring Security's normal authorization rules decide what happens next.
        try {
            String email = jwtService.extractEmail(token);

            if(email != null && SecurityContextHolder.getContext().getAuthentication() == null){
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                if(jwtService.isTokenValid(token, userDetails)){
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception ex) {
            log.debug("Ignoring invalid bearer token on {}: {}", request.getRequestURI(), ex.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request,response);
    }
}
