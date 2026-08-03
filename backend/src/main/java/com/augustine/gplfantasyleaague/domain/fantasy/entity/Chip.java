package com.augustine.gplfantasyleaague.domain.fantasy.entity;

import com.augustine.gplfantasyleaague.domain.gameweek.entity.Gameweek;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;

@Entity
@Table(name = "chips")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class Chip {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "fantasy_team_id")
    private FantasyTeam fantasyTeam;

    @ManyToOne
    @JoinColumn(name = "gameweek_id")
    private Gameweek gameweek;

    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Enumerated(EnumType.STRING)
    @Column(name = "chip_type")
    private ChipType chipType;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

}
