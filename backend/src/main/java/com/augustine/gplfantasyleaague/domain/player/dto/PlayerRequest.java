package com.augustine.gplfantasyleaague.domain.player.dto;

import com.augustine.gplfantasyleaague.domain.player.entity.Position;
import com.augustine.gplfantasyleaague.domain.player.entity.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlayerRequest {
    @NotBlank
    private String fullName;

    @NotNull
    private Integer clubId;

    @NotNull
    private Integer jerseyNumber;

    @NotNull
    private Position position;

    private String photoUrl;

    @NotBlank
    private String nationality;

    @NotNull
    private Status status;
}
