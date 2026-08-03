package com.augustine.gplfantasyleaague.domain.engagement.controller;

import com.augustine.gplfantasyleaague.domain.engagement.dtos.DiscussionRequest;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.DiscussionResponse;
import com.augustine.gplfantasyleaague.domain.engagement.service.DiscussionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/discussion")
public class DiscussionController {
    private final DiscussionService discussionService;

    public DiscussionController(DiscussionService discussionService) {
        this.discussionService = discussionService;
    }

    @PostMapping
    public ResponseEntity<DiscussionResponse> addDiscussion(@RequestBody @Valid DiscussionRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(discussionService.addDiscussion(request, email));
    }

    @GetMapping("/fixture/{fixtureId}")
    public ResponseEntity<List<DiscussionResponse>> getDiscussionsByFixture(@PathVariable Integer fixtureId){
        return ResponseEntity.ok(discussionService.getDiscussionsByFixture(fixtureId));
    }
}
