package com.elif.services.community;

import com.elif.dto.community.request.CreateCommunityRequest;
import com.elif.dto.community.response.CommunityMemberResponse;
import com.elif.dto.community.response.CommunityResponse;
import com.elif.entities.community.*;
import com.elif.entities.community.enums.CommunityType;
import com.elif.entities.community.enums.MemberRole;
import com.elif.entities.user.Role;
import com.elif.exceptions.community.CommunityNotFoundException;
import com.elif.exceptions.community.NotMemberException;
import com.elif.exceptions.community.UnauthorizedModeratorException;
import com.elif.repositories.community.*;
import com.elif.repositories.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@AllArgsConstructor
@Transactional
public class CommunityService {

    private final CommunityRepository communityRepository;
    private final CommunityMemberRepository memberRepository;
    private final PostRepository postRepository;
    private final CommunityRuleRepository ruleRepository;
    private final FlairRepository flairRepository;
    private final UserRepository userRepository;

    public List<CommunityResponse> findPublicCommunities(Long userId) {
        return communityRepository.findByTypeOrderByMemberCountDesc(CommunityType.PUBLIC)
                .stream()
                .map(c -> toResponse(c, userId))
                .toList();
    }

    public CommunityResponse getBySlug(String slug, Long userId) {
        Community c = communityRepository.findBySlug(slug)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));
        return toResponse(c, userId);
    }

    public CommunityResponse createCommunity(CreateCommunityRequest req, Long creatorId) {
        String slug = req.getName().trim().toLowerCase().replaceAll("\\s+", "-");
        if (communityRepository.existsBySlug(slug)) {
            throw new IllegalStateException("Community slug already exists");
        }

        Community community = Community.builder()
                .name(req.getName())
                .slug(slug)
                .description(req.getDescription())
                .type(req.getType() == null ? CommunityType.PUBLIC : req.getType())
                .createdBy(creatorId)
            .bannerUrl(normalizeOptional(req.getBannerUrl()))
            .iconUrl(normalizeOptional(req.getIconUrl()))
                .build();

        community = communityRepository.save(community);

        memberRepository.save(CommunityMember.builder()
                .community(community)
                .userId(creatorId)
                .role(MemberRole.CREATOR)
                .build());
        communityRepository.updateMemberCount(community.getId(), 1);

        return toResponse(communityRepository.findById(community.getId()).orElse(community), creatorId);
    }

    public CommunityResponse updateCommunity(Long communityId, CreateCommunityRequest req, Long userId) {
        requireModerator(communityId, userId);

        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (req.getName() != null && !req.getName().trim().isEmpty()) {
            community.setName(req.getName().trim());
        }
        if (req.getDescription() != null) {
            community.setDescription(req.getDescription().trim());
        }
        if (req.getType() != null) {
            community.setType(req.getType());
        }
        if (req.getBannerUrl() != null) {
            community.setBannerUrl(normalizeOptional(req.getBannerUrl()));
        }
        if (req.getIconUrl() != null) {
            community.setIconUrl(normalizeOptional(req.getIconUrl()));
        }

        return toResponse(communityRepository.save(community), userId);
    }

    public List<CommunityMemberResponse> getMembers(Long communityId, Long userId) {
        if (!isAdmin(userId)) {
            // Any member can view the member list.
            getUserRole(communityId, userId);
        }

        return memberRepository.findByCommunityId(communityId).stream()
                .map(m -> CommunityMemberResponse.builder()
                        .userId(m.getUserId())
                        .name(userRepository.findById(m.getUserId())
                                .map(u -> u.getFirstName() + " " + u.getLastName())
                                .orElse("Unknown User"))
                        .role(m.getRole())
                        .joinedAt(m.getJoinedAt())
                        .build())
                .toList();
    }

    public void joinCommunity(Long communityId, Long userId) {
        Community c = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        if (memberRepository.existsByCommunityIdAndUserId(communityId, userId)) {
            throw new IllegalStateException("Already a member");
        }

        if (c.getType() == CommunityType.PRIVATE) {
            throw new IllegalStateException("Private community requires approval");
        }

        memberRepository.save(CommunityMember.builder()
                .community(c)
                .userId(userId)
                .role(MemberRole.MEMBER)
                .build());
        communityRepository.updateMemberCount(communityId, 1);
    }

    public void leaveCommunity(Long communityId, Long userId) {
        CommunityMember m = memberRepository.findByCommunityIdAndUserId(communityId, userId)
                .orElseThrow(() -> new NotMemberException("Not a member"));

        if (m.getRole() == MemberRole.CREATOR) {
            throw new IllegalStateException("Creator cannot leave without transferring ownership");
        }

        memberRepository.delete(m);
        communityRepository.updateMemberCount(communityId, -1);
    }

    public MemberRole getUserRole(Long communityId, Long userId) {
        return memberRepository.findByCommunityIdAndUserId(communityId, userId)
                .map(CommunityMember::getRole)
                .orElseThrow(() -> new NotMemberException("User is not a member"));
    }

    public void requireModerator(Long communityId, Long userId) {
        if (isAdmin(userId)) {
            return;
        }

        MemberRole role = getUserRole(communityId, userId);
        if (role == MemberRole.MEMBER) {
            throw new UnauthorizedModeratorException("Moderator or Creator role required");
        }
    }

    public void removeMember(Long communityId, Long targetUserId, Long actingUserId) {
        requireModerator(communityId, actingUserId);

        CommunityMember target = memberRepository.findByCommunityIdAndUserId(communityId, targetUserId)
                .orElseThrow(() -> new NotMemberException("Target user is not a member"));

        if (target.getRole() == MemberRole.CREATOR) {
            throw new IllegalStateException("Cannot remove community creator");
        }

        if (targetUserId.equals(actingUserId)) {
            throw new IllegalStateException("Use leave action to remove yourself");
        }

        memberRepository.delete(target);
        communityRepository.updateMemberCount(communityId, -1);
    }

    public List<CommunityRule> getRules(Long communityId) {
        return ruleRepository.findByCommunityIdOrderByRuleOrderAsc(communityId);
    }

    public CommunityRule addRule(Long communityId, Long userId, CommunityRule payload) {
        requireModerator(communityId, userId);
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        payload.setId(null);
        payload.setCommunity(community);
        return ruleRepository.save(payload);
    }

    public List<Flair> getFlairs(Long communityId) {
        return flairRepository.findByCommunityId(communityId);
    }

    public Flair addFlair(Long communityId, Long userId, Flair payload) {
        requireModerator(communityId, userId);
        Community community = communityRepository.findById(communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Community not found"));

        payload.setId(null);
        payload.setCommunity(community);
        return flairRepository.save(payload);
    }

    public void deleteFlair(Long communityId, Long flairId, Long userId) {
        requireModerator(communityId, userId);
        Flair flair = flairRepository.findByIdAndCommunityId(flairId, communityId)
                .orElseThrow(() -> new CommunityNotFoundException("Flair not found"));

        postRepository.clearFlairFromCommunityPosts(communityId, flairId);
        flairRepository.delete(flair);
    }

    private CommunityResponse toResponse(Community c, Long userId) {
        MemberRole role = null;
        if (userId != null) {
            role = memberRepository.findByCommunityIdAndUserId(c.getId(), userId)
                    .map(CommunityMember::getRole)
                    .orElse(null);
        }

        return CommunityResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .type(c.getType())
                .memberCount(c.getMemberCount())
                .bannerUrl(c.getBannerUrl())
                .iconUrl(c.getIconUrl())
                .createdAt(c.getCreatedAt())
                .userRole(role)
                .build();
    }

    private String normalizeOptional(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean isAdmin(Long userId) {
        if (userId == null) return false;
        return userRepository.findById(userId)
                .map(u -> u.getRole() == Role.ADMIN)
                .orElse(false);
    }
}
