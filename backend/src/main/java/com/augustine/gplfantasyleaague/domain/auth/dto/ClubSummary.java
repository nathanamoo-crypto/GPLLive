package com.augustine.gplfantasyleaague.domain.auth.dto;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClubSummary {
    private Integer id;
    private String fullName;
    private String shortName;
    private String logoUrl;
}
