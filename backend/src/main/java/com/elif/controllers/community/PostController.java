package com.elif.controllers.community;

import com.elif.dto.community.request.CreatePostRequest;
import com.elif.dto.community.response.PostResponse;
import com.elif.entities.community.enums.PostType;
import com.elif.entities.community.enums.SortMode;
import com.elif.services.community.PostService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community")
@AllArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping("/communities/{id}/posts")
    public List<PostResponse> getPosts(@PathVariable Long id,
                                       @RequestParam(defaultValue = "HOT") SortMode sort,
                                       @RequestParam(required = false) Long flairId,
                                       @RequestParam(required = false) PostType type,
                                       @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return postService.getPosts(id, sort, flairId, type, userId);
    }

    @GetMapping("/posts/{id:\\d+}")
    public PostResponse getPost(@PathVariable Long id,
                                @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return postService.getPost(id, userId);
    }

    @GetMapping("/posts/trending")
    public List<PostResponse> getTrendingPosts(@RequestParam(defaultValue = "HOT") SortMode sort,
                                               @RequestParam(defaultValue = "12") Integer limit,
                                               @RequestHeader(value = "X-User-Id", required = false) Long userId) {
        return postService.getTrendingPosts(sort, limit, userId);
    }

    @PostMapping("/communities/{id}/posts")
    @ResponseStatus(HttpStatus.CREATED)
    public PostResponse createPost(@PathVariable Long id,
                                   @RequestHeader("X-User-Id") Long userId,
                                   @RequestHeader(value = "X-Act-As-User-Id", required = false) Long actingUserId,
                                   @RequestBody CreatePostRequest request) {
        return postService.createPost(id, userId, actingUserId, request);
    }

    @PutMapping("/posts/{id:\\d+}")
    public PostResponse updatePost(@PathVariable Long id,
                                   @RequestHeader("X-User-Id") Long userId,
                                   @RequestBody CreatePostRequest request) {
        return postService.updatePost(id, userId, request);
    }

    @DeleteMapping("/posts/{id:\\d+}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePost(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        postService.softDeletePost(id, userId);
    }

    @DeleteMapping("/posts/{id:\\d+}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void hardDeletePost(@PathVariable Long id, @RequestHeader("X-User-Id") Long userId) {
        postService.hardDeletePost(id, userId);
    }

    @GetMapping("/posts/search")
    public List<PostResponse> search(@RequestParam("q") String query) {
        return postService.search(query);
    }
}
