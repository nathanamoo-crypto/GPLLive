package com.augustine.gplfantasyleaague.config;

import com.augustine.gplfantasyleaague.domain.fantasy.entity.Chip;
import com.augustine.gplfantasyleaague.domain.fantasy.entity.ChipType;
import com.augustine.gplfantasyleaague.domain.fantasy.repository.ChipRepository;
import com.augustine.gplfantasyleaague.domain.fantasy.service.ChipService;
import com.augustine.gplfantasyleaague.domain.fantasy.service.FantasyTeamService;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.GameweekRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.service.GameweekService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class GameweekScheduler {
    private static final Logger log = LoggerFactory.getLogger(GameweekScheduler.class);
    private final GameweekRepository gameweekRepository;
    private final ChipRepository chipRepository;
    private final ChipService chipService;
    private final GameweekService gameweekService;
    private final FantasyTeamService fantasyTeamService;

    public GameweekScheduler(GameweekRepository gameweekRepository, ChipRepository chipRepository, ChipService chipService, GameweekService gameweekService, FantasyTeamService fantasyTeamService) {
        this.gameweekRepository = gameweekRepository;
        this.chipRepository = chipRepository;
        this.chipService = chipService;
        this.gameweekService = gameweekService;
        this.fantasyTeamService = fantasyTeamService;
    }

    @Scheduled(cron = "0 0 0 * * *") // midnight every day
    @Transactional
    public void processGameweekTransition() {
        gameweekRepository.findByIsCurrentTrue()
                .ifPresentOrElse(gameweek -> {
                            if (gameweek.getEndDate().isBefore(LocalDateTime.now())) {
                                // 1. Restore all Free Hit squads for this gameweek
                                List<Chip> freeHitChips = chipRepository
                                        .findByGameweekIdAndChipType(gameweek.getId(), ChipType.FREEHIT);

                                for (Chip chip : freeHitChips) {
                                    try {
                                        chipService.restoreFreeHit(chip.getFantasyTeam().getId(), gameweek.getId());
                                    } catch (Exception e) {
                                        log.error("Failed to restore Free Hit for team {} in gameweek {}",
                                                chip.getFantasyTeam().getId(), gameweek.getId(), e);
                                    }
                                }


                                // 2 & 3. Find the next gameweek and hand off the transition to GameweekService,
                                // which handles deactivating the old current gameweek and activating the new one.
                                gameweekRepository.findByGameweekNumber(gameweek.getGameweekNumber() + 1)
                                        .ifPresentOrElse(
                                                nextGameweek -> {
                                                    gameweekService.setCurrentGameweek(nextGameweek.getId());
                                                    // 4. Every team gets its weekly free transfer back (banked up
                                                    // to 2) now that a new gameweek is current.
                                                    fantasyTeamService.grantWeeklyFreeTransfers();
                                                },
                                                () -> log.warn("No next gameweek found after gameweek {} — season may have ended", gameweek.getGameweekNumber())
                                        );
                            }

                        },
                        () -> log.warn("No current gameweek found — gameweek transition scheduler has nothing to do"));
    }

}
