package com.augustine.gplfantasyleaague.domain.engagement.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.NotificationRequest;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.NotificationResponse;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Notification;
import com.augustine.gplfantasyleaague.domain.engagement.repository.NotificationRepository;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import com.augustine.gplfantasyleaague.exception.UnauthorizedAccessException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {
    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public NotificationResponse sendNotification(NotificationRequest request){
        User user = userRepository.findById(request.getUserId()).orElseThrow(()-> new ResourceNotFoundException("User with ID " + request.getUserId() + " does not exist"));
        Notification notification =saveToNotificationDatabase(request, user);
        return mapToResponse(notification);
    }

    public List<NotificationResponse> getUserNotification(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User with email " + email + " not found"));
        return notificationRepository.findByUserId(user.getId()).stream()
                .map(notification -> mapToResponse(notification))
                .toList();
    }

    public NotificationResponse markAsRead(Integer notificationId,String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User with email " + email + " not found"));
        Notification notification = notificationRepository.findById(notificationId).orElseThrow(()-> new ResourceNotFoundException("Notification with ID " + notificationId + " not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new UnauthorizedAccessException("This notification doesn't belong to you");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return mapToResponse(updatedNotification);
    }

    public List<NotificationResponse> getUnreadNotification(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User with email " + email + " not found"));
        return notificationRepository.findByUserIdAndIsRead(user.getId(), false).stream()
                .map(unreadNotification-> mapToResponse(unreadNotification))
                .toList();
    }

    private Notification saveToNotificationDatabase(NotificationRequest request, User user){
        Notification savedNotification = Notification.builder()
                .type(request.getType())
                .user(user)
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .isRead(false)
                .build();
        notificationRepository.save(savedNotification);
        return savedNotification;
    }

    private NotificationResponse mapToResponse(Notification notification){
        return NotificationResponse.builder()
                .id(notification.getId())
                .isRead(notification.getIsRead())
                .message(notification.getMessage())
                .createdAt(notification.getCreatedAt())
                .type(notification.getType())
                .build();
    }
}
