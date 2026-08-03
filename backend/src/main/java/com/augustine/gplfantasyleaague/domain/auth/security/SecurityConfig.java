package com.augustine.gplfantasyleaague.domain.auth.security;

import com.augustine.gplfantasyleaague.domain.auth.service.UserDetailsServiceImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;


    public SecurityConfig(JwtAuthFilter jwtAuthFilter, UserDetailsServiceImpl userDetailsService) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.userDetailsService = userDetailsService;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        http.csrf(csrf-> csrf.disable());

        http.authorizeHttpRequests(auth-> auth
                                .requestMatchers("/auth/**").permitAll()
                                // Club list/details are public read-only reference data (badges,
                                // names) needed by the registration form's club picker, which runs
                                // before the user has a token. Writes (POST/PUT) stay admin-only via
                                // the existing @PreAuthorize on ClubController.
                                .requestMatchers(org.springframework.http.HttpMethod.GET, "/clubs", "/clubs/**").permitAll()
                                // Paystack calls this directly (server-to-server) with no
                                // way to attach our JWT - trust comes from the HMAC
                                // signature check in PaystackService instead of auth here.
                                .requestMatchers("/payments/webhook").permitAll()
                                .anyRequest().authenticated()
        );

        // Without this, Spring Security has no registered AuthenticationEntryPoint
        // (stateless JWT setup, no form login) and falls back to
        // Http403ForbiddenEntryPoint - so a missing/expired/invalid token on a
        // protected endpoint returns 403 instead of 401. The frontend only
        // treats 401 as "your session is invalid, log out" (403 is reserved for
        // authenticated-but-forbidden, e.g. touching another user's resource),
        // so without this fix a stale token (e.g. left over from testing against
        // a different backend instance/secret) just makes every screen silently
        // fail forever instead of prompting a fresh login.
        http.exceptionHandling(ex -> ex.authenticationEntryPoint(
                (request, response, authException) ->
                        response.sendError(jakarta.servlet.http.HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
        ));

        http.sessionManagement(session-> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        http.addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

       http.authenticationProvider(authenticationProvider());
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception{
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider(){
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

}
