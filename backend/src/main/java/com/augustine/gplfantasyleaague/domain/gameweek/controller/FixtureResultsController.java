package com.augustine.gplfantasyleaague.domain.gameweek.controller;

import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureResultsRequest;
import com.augustine.gplfantasyleaague.domain.gameweek.dtos.FixtureResultsResponse;
import com.augustine.gplfantasyleaague.domain.gameweek.service.FixtureResultsService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/fixture-results")
public class FixtureResultsController {
    private final FixtureResultsService fixtureResultsService;

    public FixtureResultsController(FixtureResultsService fixtureResultsService) {
        this.fixtureResultsService = fixtureResultsService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<FixtureResultsResponse> recordResults(@RequestBody @Valid FixtureResultsRequest request){
        return ResponseEntity.ok(fixtureResultsService.recordResults(request));
    }

    @GetMapping("/{fixtureId}")
    public ResponseEntity<FixtureResultsResponse> getResultsByFixture(@PathVariable Integer fixtureId){
        return ResponseEntity.ok(fixtureResultsService.getResultsByFixture(fixtureId));
    }

    @GetMapping
    public ResponseEntity<List<FixtureResultsResponse>> getAllResults(){
        return ResponseEntity.ok(fixtureResultsService.getAllResults());
    }
}
