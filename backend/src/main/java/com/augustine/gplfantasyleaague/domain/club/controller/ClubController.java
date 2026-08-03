package com.augustine.gplfantasyleaague.domain.club.controller;

import com.augustine.gplfantasyleaague.domain.club.dtos.ClubRequest;
import com.augustine.gplfantasyleaague.domain.club.dtos.ClubResponse;
import com.augustine.gplfantasyleaague.domain.club.service.ClubService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/clubs")
public class ClubController {
    private final ClubService clubService;

    public ClubController(ClubService clubService) {
        this.clubService = clubService;
    }

    @GetMapping
    public ResponseEntity<List<ClubResponse>> getAllClubs(){
        return ResponseEntity.ok(clubService.getAllClub());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClubResponse> getClubById(@PathVariable Integer id){
        return ResponseEntity.ok(clubService.getClubById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ClubResponse> addClubToLeague(@RequestBody @Valid ClubRequest clubRequest){
        return ResponseEntity.ok(clubService.addClubToLeague(clubRequest));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ClubResponse> updateClub(@PathVariable Integer id, @RequestBody @Valid ClubRequest request){
        return ResponseEntity.ok(clubService.updateClub(id, request));
    }
}
