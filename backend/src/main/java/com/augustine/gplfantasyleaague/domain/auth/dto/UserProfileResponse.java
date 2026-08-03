package com.augustine.gplfantasyleaague.domain.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private ClubSummary favouriteClub;
    // Drives the premium badge next to the username throughout the app.
    private boolean premium;
}
