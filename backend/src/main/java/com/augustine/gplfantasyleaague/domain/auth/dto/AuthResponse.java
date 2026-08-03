package com.augustine.gplfantasyleaague.domain.auth.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AuthResponse {

    private String token;
    private String username;
}
