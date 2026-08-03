package com.augustine.gplfantasyleaague.domain.auth.entity;

import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Discussion;
import com.augustine.gplfantasyleaague.domain.engagement.entity.MotmVotes;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Notification;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.FantasyTeam;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @Column(name = "password", nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne
    @JoinColumn(name = "favourite_club_id")
    private Club favouriteClub;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    @Builder.Default
    private Role role = Role.USER;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = true;

    @Column(name = "verification_code")
    private String verificationCode;

    @Column(name = "verification_code_expires_at")
    private LocalDateTime verificationCodeExpiresAt;

    @OneToOne(mappedBy = "user")
    private FantasyTeam fantasyTeam;

    @OneToMany(mappedBy = "user")
    private List<MotmVotes> motmVotesList = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Notification> notifications = new ArrayList<>();

    @OneToMany(mappedBy = "user")
    private List<Discussion> discussions  = new ArrayList<>();
}
