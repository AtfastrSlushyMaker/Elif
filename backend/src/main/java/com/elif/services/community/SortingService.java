package com.elif.services.community;

import com.elif.entities.community.Post;
import com.elif.entities.community.enums.SortMode;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;

@Service
public class SortingService {

    public double hotScore(int voteScore, LocalDateTime createdAt) {
        long hours = ChronoUnit.HOURS.between(createdAt, LocalDateTime.now());
        return voteScore / Math.pow(hours + 2, 1.5);
    }

    public List<Post> sort(List<Post> posts, SortMode mode) {
        return switch (mode) {
            case HOT -> posts.stream()
                    .sorted((a, b) -> Double.compare(
                            hotScore(b.getVoteScore(), b.getCreatedAt()),
                            hotScore(a.getVoteScore(), a.getCreatedAt())
                    ))
                    .toList();
            case NEW -> posts.stream()
                    .sorted(Comparator.comparing(Post::getCreatedAt).reversed())
                    .toList();
            case TOP -> posts.stream()
                    .sorted(Comparator.comparingInt(Post::getVoteScore).reversed())
                    .toList();
            case CONTROVERSIAL -> posts.stream()
                    .filter(p -> p.getVoteScore() < 0)
                    .sorted(Comparator.comparingInt(Post::getVoteScore))
                    .toList();
        };
    }
}
