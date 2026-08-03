package com.augustine.gplfantasyleaague.domain.gameweek.controller;

import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureRequest;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureResponse;
import com.augustine.gplfantasyleaague.domain.gameweek.entity.FixtureStatus;
import com.augustine.gplfantasyleaague.domain.gameweek.service.FixtureService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fixtures")
public class FixtureController {
    private final FixtureService fixtureService;

    public FixtureController(FixtureService fixtureService) {
        this.fixtureService = fixtureService;
    }

    @GetMapping
    public ResponseEntity<List<FixtureResponse>> getAllFixtures(){
        return ResponseEntity.ok(fixtureService.getAllFixtures());
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<FixtureResponse>> getAllScheduledFixtures(){
        return ResponseEntity.ok(fixtureService.getAllScheduledFixtures());
    }

    @GetMapping("/live")
    public ResponseEntity<List<FixtureResponse>> getAllLiveFixtures(){
        return ResponseEntity.ok(fixtureService.getAllLiveFixtures());
    }

    @GetMapping("/finished")
    public ResponseEntity<List<FixtureResponse>> getAllFinishedFixtures(){
        return ResponseEntity.ok(fixtureService.getAllFinishFixtures());
    }

    @GetMapping("/gameweek/{id}")
    public ResponseEntity<List<FixtureResponse>> getFixturesByGameweek(@PathVariable Integer id){
        return ResponseEntity.ok(fixtureService.getFixturesByGameweek(id));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FixtureResponse> getFixtureById(@PathVariable Integer id){
        return ResponseEntity.ok(fixtureService.getFixtureById(id));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FixtureResponse> createFixture(@RequestBody @Valid FixtureRequest request){
        return ResponseEntity.ok(fixtureService.createFixture(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<FixtureResponse> updatedFixtureStatus(@PathVariable Integer id, @RequestBody FixtureStatus status){
        return ResponseEntity.ok(fixtureService.updatedFixtureStatus(id, status));
    }
}
