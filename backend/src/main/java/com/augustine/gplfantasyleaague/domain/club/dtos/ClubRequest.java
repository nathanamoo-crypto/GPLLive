package com.augustine.gplfantasyleaague.domain.club.dtos;

import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClubRequest {
    @NotBlank
    private String fullName;

    @NotBlank
    private String shortName;

    @NotBlank
    private String logoUrl;

    @NotBlank
    private String homeGround;

    @NotNull
    private Integer foundedYear;

    @NotBlank
    private String city;

    @NotNull
    private ClubStatus clubStatus;
}
