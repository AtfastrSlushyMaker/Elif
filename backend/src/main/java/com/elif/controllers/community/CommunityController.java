package com.elif.controllers.community;

import com.elif.dto.community.request.CreateCommunityRequest;
import com.elif.dto.community.response.CommunityMemberResponse;
import com.elif.dto.community.response.CommunityResponse;
import com.elif.entities.community.CommunityRule;
import com.elif.entities.community.Flair;
import com.elif.services.community.CommunityService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@AllArgsConstructor
public class CommunityController {

    private final CommunityService communityService;

    @GetMapping("/communities")
    public List<CommunityResponse> getCommunities(@RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return communityService.findPublicCommunities(userId);
    }

    @GetMapping("/communities/{slug}")
    public CommunityResponse getCommunity(@PathVariable String slug,
                                          @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return communityService.getBySlug(slug, userId);
    }

    @PostMapping("/communities")
    @ResponseStatus(HttpStatus.CREATED)
    public CommunityResponse createCommunity(@RequestBody CreateCommunityRequest request,
                                             @RequestHeader("X-User-Id") Long userId) {
        return communityService.createCommunity(request, userId);
    }

    @PutMapping("/communities/{id}")
    public CommunityResponse updateCommunity(@PathVariable Long id,
                                             @RequestBody CreateCommunityRequest request,
                                             @RequestHeader("X-User-Id") Long userId) {
        return communityService.updateCommunity(id, request, userId);
    }

    @GetMapping("/communities/{id}/members")
    public List<CommunityMemberResponse> getMembers(@PathVariable Long id,
                                                    @RequestHeader("X-User-Id") Long userId) {
        return communityService.getMembers(id, userId);
    }

    @PostMapping("/communities/{id}/join")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void joinCommunity(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        communityService.joinCommunity(id, userId);
    }

    @PostMapping("/communities/{id}/leave")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void leaveCommunity(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        communityService.leaveCommunity(id, userId);
    }

    @GetMapping("/communities/{id}/rules")
    public List<CommunityRule> getRules(@PathVariable Long id) {
        return communityService.getRules(id);
    }

    @PostMapping("/communities/{id}/rules")
    public CommunityRule addRule(@PathVariable Long id,
                                 @RequestHeader("X-User-Id") Long userId,
                                 @RequestBody CommunityRule payload) {
        return communityService.addRule(id, userId, payload);
    }

    @GetMapping("/communities/{id}/flairs")
    public List<Flair> getFlairs(@PathVariable Long id) {
        return communityService.getFlairs(id);
    }

    @PostMapping("/communities/{id}/flairs")
    public Flair addFlair(@PathVariable Long id,
                          @RequestHeader("X-User-Id") Long userId,
                          @RequestBody Flair payload) {
        return communityService.addFlair(id, userId, payload);
    }

    @DeleteMapping("/communities/{id}/flairs/{flairId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFlair(@PathVariable Long id,
                            @PathVariable Long flairId,
                            @RequestHeader("X-User-Id") Long userId) {
        communityService.deleteFlair(id, flairId, userId);
    }
}
