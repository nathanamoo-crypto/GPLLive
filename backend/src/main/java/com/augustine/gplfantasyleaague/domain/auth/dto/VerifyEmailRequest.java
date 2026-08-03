package com.augustine.gplfantasyleaague.domain.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class VerifyEmailRequest {
    @Email
    @NotBlank
    private String email;

    @NotBlank
    private String code;
}
