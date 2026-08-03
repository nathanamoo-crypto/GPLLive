package com.augustine.gplfantasyleaague.domain.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    @Value("${spring.security.jwt.secret-key}")
    private String secretKey;

    private SecretKey getSignInKey(){
        byte[] keyByte = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyByte);
    }

    public String generateToken(UserDetails userDetails){
        return Jwts.builder()
                .subject(userDetails.getUsername())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 1000 * 60 * 60 * 24))
                .signWith(getSignInKey())
                .compact();
    }

    public Claims extractAllClaims(String token){
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Boolean isTokenValid(String Token, UserDetails userDetails){
        try {
           String username = extractEmail(Token);
           return username.equals(userDetails.getUsername()) && !isTokenExpired(Token);
        } catch (Exception e) {
            return false;
        }
    }

    public Boolean isTokenExpired(String Token){
        return extractAllClaims(Token).getExpiration().before(new Date());
    }

    public String extractEmail(String Token){
        return extractAllClaims(Token).getSubject();
    }
}
