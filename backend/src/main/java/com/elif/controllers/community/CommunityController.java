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
                                             @RequestHeader("X-User-Id") Long userId,
                                             @RequestHeader(value = "X-Act-As-User-Id", required = false) Long actingUserId) {
        return communityService.createCommunity(request, userId, actingUserId);
    }

    @PutMapping("/communities/{id}")
    public CommunityResponse updateCommunity(@PathVariable Long id,
                                             @RequestBody CreateCommunityRequest request,
                                             @RequestHeader("X-User-Id") Long userId) {
        return communityService.updateCommunity(id, request, userId);
    }

    @DeleteMapping("/communities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCommunity(@PathVariable Long id,
                                @RequestHeader("X-User-Id") Long userId,
                                @RequestParam(value = "hard", defaultValue = "false") boolean hardDelete) {
        if (hardDelete) {
            communityService.hardDeleteCommunity(id, userId);
            return;
        }

        communityService.softDeleteCommunity(id, userId);
    }

    @GetMapping("/communities/{id}/members")
    public List<CommunityMemberResponse> getMembers(@PathVariable Long id,
                                                    @RequestHeader("X-User-Id") Long userId) {
        return communityService.getMembers(id, userId);
    }

    @DeleteMapping("/communities/{id}/members/{targetUserId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMember(@PathVariable Long id,
                             @PathVariable Long targetUserId,
                             @RequestHeader("X-User-Id") Long userId) {
        communityService.removeMember(id, targetUserId, userId);
    }

    @PatchMapping("/communities/{id}/members/{targetUserId}/promote")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void promoteMemberToModerator(@PathVariable Long id,
                                         @PathVariable Long targetUserId,
                                         @RequestHeader("X-User-Id") Long userId) {
        communityService.promoteToModerator(id, targetUserId, userId);
    }

    @PatchMapping("/communities/{id}/members/{targetUserId}/demote")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void demoteModeratorToMember(@PathVariable Long id,
                                        @PathVariable Long targetUserId,
                                        @RequestHeader("X-User-Id") Long userId) {
        communityService.demoteModerator(id, targetUserId, userId);
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

    @PutMapping("/communities/{id}/rules/{ruleId}")
    public CommunityRule updateRule(@PathVariable Long id,
                                    @PathVariable Long ruleId,
                                    @RequestHeader("X-User-Id") Long userId,
                                    @RequestBody CommunityRule payload) {
        return communityService.updateRule(id, ruleId, userId, payload);
    }

    @DeleteMapping("/communities/{id}/rules/{ruleId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRule(@PathVariable Long id,
                           @PathVariable Long ruleId,
                           @RequestHeader("X-User-Id") Long userId) {
        communityService.deleteRule(id, ruleId, userId);
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

    @PutMapping("/communities/{id}/flairs/{flairId}")
    public Flair updateFlair(@PathVariable Long id,
                             @PathVariable Long flairId,
                             @RequestHeader("X-User-Id") Long userId,
                             @RequestBody Flair payload) {
        return communityService.updateFlair(id, flairId, userId, payload);
    }

    @DeleteMapping("/communities/{id}/flairs/{flairId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteFlair(@PathVariable Long id,
                            @PathVariable Long flairId,
                            @RequestHeader("X-User-Id") Long userId) {
        communityService.deleteFlair(id, flairId, userId);
    }
}
