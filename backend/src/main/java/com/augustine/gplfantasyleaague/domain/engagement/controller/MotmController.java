package com.augustine.gplfantasyleaague.domain.engagement.controller;

import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmResultsResponse;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmVoteResponse;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.MotmVotesRequest;
import com.augustine.gplfantasyleaague.domain.engagement.service.MotmService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/motmVotes")
public class MotmController {
    private final MotmService motmService;

    public MotmController(MotmService motmService) {
        this.motmService = motmService;
    }

    @GetMapping("/{fixtureId}")
    public ResponseEntity<MotmResultsResponse> getVotesByFixture(@PathVariable Integer fixtureId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(motmService.getResultsByFixture(fixtureId, email));
    }

    @PostMapping
    public ResponseEntity<MotmVoteResponse> castVote(@RequestBody @Valid MotmVotesRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(motmService.castVote(request, email));
    }
}
