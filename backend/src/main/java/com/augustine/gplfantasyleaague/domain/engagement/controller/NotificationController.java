package com.augustine.gplfantasyleaague.domain.engagement.controller;

import com.augustine.gplfantasyleaague.domain.engagement.dtos.NotificationRequest;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.NotificationResponse;
import com.augustine.gplfantasyleaague.domain.engagement.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {
    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnreadNotification(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getUnreadNotification(email));
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getUserNotification(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.getUserNotification(email));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<NotificationResponse> sendNotification(@RequestBody @Valid NotificationRequest request){
        return ResponseEntity.ok(notificationService.sendNotification(request));
    }

    @PatchMapping("/marked-as-read-notification/{id}")
    public ResponseEntity<NotificationResponse> getMarkedReadNotification(@PathVariable Integer id){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(notificationService.markAsRead(id,email));
    }
}
