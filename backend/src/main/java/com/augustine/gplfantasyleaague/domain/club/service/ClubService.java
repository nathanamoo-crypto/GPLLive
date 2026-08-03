package com.augustine.gplfantasyleaague.domain.club.service;

import com.augustine.gplfantasyleaague.domain.club.dtos.ClubRequest;
import com.augustine.gplfantasyleaague.domain.club.dtos.ClubResponse;
import com.augustine.gplfantasyleaague.domain.club.entity.Club;
import com.augustine.gplfantasyleaague.domain.club.entity.ClubStatus;
import com.augustine.gplfantasyleaague.domain.club.repository.ClubRepository;

import com.augustine.gplfantasyleaague.exception.ClubAlreadyExistsException;
import com.augustine.gplfantasyleaague.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ClubService {
    private final ClubRepository clubRepository;

    public ClubService(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    public List<ClubResponse> getAllClub(){
        return clubRepository.findByClubStatus(ClubStatus.ACTIVE)
                .stream()
                .map(club -> mapToResponse(club))
                .toList();
    }

    public ClubResponse getClubById(Integer id){
        Club club = clubRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Club with ID " + id + " does not exist"));
        return mapToResponse(club);
    }

    public ClubResponse addClubToLeague(ClubRequest clubRequest){
        if(clubRepository.existsByFullName(clubRequest.getFullName())){
            throw new ClubAlreadyExistsException("Team with name '" + clubRequest.getFullName() + "' already exists");
        }

        Club savedClub = saveToClubDatabase(clubRequest);
        return mapToResponse(savedClub);
    }

    public ClubResponse updateClub(Integer id, ClubRequest request){
        Club club = clubRepository.findById(id).orElseThrow(()-> new ResourceNotFoundException("Cannot update. Club with ID " + id + " does not exist"));

        club.setFullName(request.getFullName());
        club.setShortName(request.getShortName());
        club.setLogoUrl(request.getLogoUrl());
        club.setHomeGround(request.getHomeGround());
        club.setFoundedYear(request.getFoundedYear());
        club.setCity(request.getCity());
        club.setClubStatus(request.getClubStatus());

        Club updatedClub = clubRepository.save(club);
        return mapToResponse(updatedClub);
    }

    private  ClubResponse mapToResponse(Club club){
        return ClubResponse.builder()
                .id(club.getId())
                .fullName(club.getFullName())
                .shortName(club.getShortName())
                .clubStatus(club.getClubStatus())
                .logoUrl(club.getLogoUrl())
                .homeGround(club.getHomeGround())
                .foundedYear(club.getFoundedYear())
                .city(club.getCity())
                .build();
    }

    private Club saveToClubDatabase(ClubRequest club){
        Club savedClub = Club.builder()
                .fullName(club.getFullName())
                .shortName(club.getShortName())
                .clubStatus(club.getClubStatus())
                .logoUrl(club.getLogoUrl())
                .homeGround(club.getHomeGround())
                .foundedYear(club.getFoundedYear())
                .city(club.getCity())
                .build();
        clubRepository.save(savedClub);
        return savedClub;
    }
}
