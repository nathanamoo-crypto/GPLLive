package com.augustine.gplfantasyleaague.domain.club.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.player.entity.Player;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;


@Entity
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Getter
@Setter
@Table(name = "real_clubs")
public class Club {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "short_name", nullable = false)
    private String shortName;

    @Column(name = "logo_url", nullable = false)
    private String logoUrl;

    @Column(name = "home_ground", nullable = false)
    private String homeGround;

    @Column(name = "city", nullable = false)
    private String city;

    @Column(name = "founded_year", nullable = false)
    private Integer foundedYear;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "status", nullable = false)
    private ClubStatus clubStatus;

    @OneToMany(mappedBy = "club")
    private List<Player> players = new ArrayList<>();

    @OneToMany(mappedBy = "homeClub")
    private List<Fixture> homeFixtures = new ArrayList<>();

    @OneToMany(mappedBy = "awayClub")
    private List<Fixture> awayFixtures = new ArrayList<>();
}
