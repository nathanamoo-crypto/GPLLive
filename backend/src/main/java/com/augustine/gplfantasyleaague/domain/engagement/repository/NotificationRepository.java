package com.augustine.gplfantasyleaague.domain.engagement.repository;

import com.augustine.gplfantasyleaague.domain.engagement.dtos.NotificationResponse;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByUserId(Integer id);

    List<Notification> findByUserIdAndIsRead(Integer userId, Boolean isRead);
}