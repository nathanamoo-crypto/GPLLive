package com.augustine.gplfantasyleaague.domain.engagement.service;

import com.augustine.gplfantasyleaague.domain.auth.entity.User;
import com.augustine.gplfantasyleaague.domain.auth.repository.UserRepository;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.DiscussionRequest;
import com.augustine.gplfantasyleaague.domain.engagement.dtos.DiscussionResponse;
import com.augustine.gplfantasyleaague.domain.engagement.entity.Discussion;
import com.augustine.gplfantasyleaague.domain.engagement.repository.DiscussionRepository;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.Fixture;
import com.augustine.gplfantasyleaague.domain.gameweek.repository.FixtureRepository;
import com.augustine.gplfantasyleaague.domain.subscription.service.SubscriptionService;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DiscussionService {
    private final UserRepository userRepository;
    private final DiscussionRepository discussionRepository;
    private final FixtureRepository fixtureRepository;
    private final SubscriptionService subscriptionService;

    public DiscussionService(UserRepository userRepository, DiscussionRepository discussionRepository, FixtureRepository fixtureRepository, SubscriptionService subscriptionService) {
        this.userRepository = userRepository;
        this.discussionRepository = discussionRepository;
        this.fixtureRepository = fixtureRepository;
        this.subscriptionService = subscriptionService;
    }

    public DiscussionResponse addDiscussion(DiscussionRequest request, String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new ResourceNotFoundException("User with email " + email + " not found"));
        Fixture fixture = fixtureRepository.findById(request.getFixtureId()).orElseThrow(()-> new ResourceNotFoundException("Fixture with ID " + request.getFixtureId() + " not found"));
        Discussion discussion = addTodiscussionDatabase(user,fixture, request);
        return mapToResponse(discussion);
    }

    public List<DiscussionResponse> getDiscussionsByFixture(Integer id){
        Fixture fixture = fixtureRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Fixture with ID " + id + " not found"));
        return discussionRepository.findByFixtureId(fixture.getId()).stream()
                .map(discussion -> mapToResponse(discussion))
                .toList();
    }

    private Discussion addTodiscussionDatabase(User user, Fixture fixture, DiscussionRequest request){
        Discussion discussion = Discussion.builder()
                .message(request.getMessage())
                .createdAt(LocalDateTime.now())
                .fixture(fixture)
                .user(user)
                .build();
        discussionRepository.save(discussion);
        return discussion;
    }

    private DiscussionResponse mapToResponse(Discussion discussion){
        return DiscussionResponse.builder()
                .id(discussion.getId())
                .fixtureId(discussion.getFixture().getId())
                .userId(discussion.getUser().getId())
                .username(discussion.getUser().getUsername())
                .userPremium(subscriptionService.isPremium(discussion.getUser().getId()))
                .message(discussion.getMessage())
                .createdAt(discussion.getCreatedAt())
                .build();
    }
}
