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
                Comparator<Post> pinnedFirst = Comparator.comparing(Post::isPinned).reversed();
                Comparator<Post> modeComparator = switch (mode) {
                        case HOT -> (a, b) -> Double.compare(
                                        hotScore(b.getVoteScore(), b.getCreatedAt()),
                                        hotScore(a.getVoteScore(), a.getCreatedAt()));
                        case NEW -> Comparator.comparing(Post::getCreatedAt).reversed();
                        case TOP -> Comparator.comparingInt(Post::getVoteScore).reversed();
                        case CONTROVERSIAL -> Comparator.comparingInt(Post::getVoteScore);
                };

                return switch (mode) {
                        case CONTROVERSIAL -> posts.stream()
                                        .filter(p -> p.getVoteScore() < 0)
                                        .sorted(pinnedFirst.thenComparing(modeComparator))
                                        .toList();
                        default -> posts.stream()
                                        .sorted(pinnedFirst.thenComparing(modeComparator))
                                        .toList();
                };
        }
}
