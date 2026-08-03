package com.augustine.gplfantasyleaague.domain.auth.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class UpdateFavouriteClubRequest {
    @NotNull
    private Integer favouriteClubId;
}
