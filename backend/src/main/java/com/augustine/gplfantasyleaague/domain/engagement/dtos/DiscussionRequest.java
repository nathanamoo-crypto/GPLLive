package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class DiscussionRequest {
    @NotNull
    private Integer fixtureId;

    @NotBlank
    private String message;

}
