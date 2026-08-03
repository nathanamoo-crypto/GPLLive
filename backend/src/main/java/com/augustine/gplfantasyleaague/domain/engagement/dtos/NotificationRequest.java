package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import com.augustine.gplfantasyleaague.domain.engagement.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class NotificationRequest {
    @NotNull
    private Integer userId;

    @NotBlank
    private String message;

    @NotNull
    private NotificationType type;

}
