package com.augustine.gplfantasyleaague.domain.fantasy.controller;

import com.augustine.gplfantasyleaague.domain.fantasy.dto.ChipRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.ChipResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.service.ChipService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chips")
public class ChipController {
    private final ChipService chipService;

    public ChipController(ChipService chipService) {
        this.chipService = chipService;
    }

    @PostMapping("/triple-captain")
    public ResponseEntity<ChipResponse> activateTripleCaptain(@RequestBody @Valid ChipRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chipService.activateTripleCaptain(request, email));
    }

    @PostMapping("/bench-boost")
    public ResponseEntity<ChipResponse> activateBenchBoost(@RequestBody @Valid ChipRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chipService.activateBenchBoost(request, email));
    }

    @PostMapping("/wildcard")
    public ResponseEntity<ChipResponse> activateWildCard(@RequestBody @Valid ChipRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chipService.activateWildCard(request, email));
    }

    @PostMapping("/wildcard2")
    public ResponseEntity<ChipResponse> activateWildCard2(@RequestBody @Valid ChipRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chipService.activateWildCard2(request, email));
    }

    @PostMapping("/free-hit")
    public ResponseEntity<ChipResponse> activateFreeHit(@RequestBody @Valid ChipRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(chipService.activateFreeHit(request, email));
    }
}
