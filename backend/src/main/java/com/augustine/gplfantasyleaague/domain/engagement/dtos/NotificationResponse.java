package com.augustine.gplfantasyleaague.domain.engagement.dtos;

import com.augustine.gplfantasyleaague.domain.engagement.entity.NotificationType;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class NotificationResponse {
    private Integer id;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private NotificationType type;
}
