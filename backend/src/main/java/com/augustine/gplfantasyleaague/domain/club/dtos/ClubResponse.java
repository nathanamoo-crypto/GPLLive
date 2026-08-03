package com.augustine.gplfantasyleaague.domain.club.dtos;

import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ClubResponse {
    private Integer id;
    private String fullName;
    private String shortName;
    private String logoUrl;
    private String homeGround;
    private String city;
    private Integer foundedYear;
    private ClubStatus clubStatus;
}
