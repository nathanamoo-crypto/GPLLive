package com.augustine.gplfantasyleaague.domain.fantasy.controller;

import com.augustine.gplfantasyleaague.domain.fantasy.dto.TransferRequest;
import com.augustine.gplfantasyleaague.domain.fantasy.dto.TransferResponse;
import com.augustine.gplfantasyleaague.domain.fantasy.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/transfers")
public class TransferController {
    private final TransferService transferService;

    public TransferController(TransferService transferService) {
        this.transferService = transferService;
    }

    @PostMapping
    public ResponseEntity<TransferResponse> makeTransfer(@RequestBody @Valid TransferRequest request){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transferService.makeTransfer(request,email));
    }

    @GetMapping("/team/{fantasyTeamId}")
    public ResponseEntity<List<TransferResponse>> getTransfersByFantasyTeam(@PathVariable Integer fantasyTeamId){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return ResponseEntity.ok(transferService.getTransfersByFantasyTeam(fantasyTeamId, email));
    }
}
