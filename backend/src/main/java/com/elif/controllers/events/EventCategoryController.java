package com.elif.controllers.events;

import com.elif.dto.events.request.EventCategoryRequest;
import com.elif.dto.events.response.EventCategoryResponse;
import com.elif.entities.user.Role;
import com.elif.services.events.interfaces.IEventCategoryService;
import com.elif.services.user.IUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/event-categories")
@RequiredArgsConstructor
public class EventCategoryController {

    private final IEventCategoryService categoryService;
    private final IUserService userService;

    // ✅ Tout le monde peut voir les catégories
    @GetMapping
    public ResponseEntity<List<EventCategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventCategoryResponse> getCategoryById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // ✅ Seul ADMIN peut créer une catégorie
    @PostMapping
    public ResponseEntity<EventCategoryResponse> createCategory(
            @Valid @RequestBody EventCategoryRequest request,
            @RequestParam Long userId) {

        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request));
    }

    // ✅ Seul ADMIN peut modifier une catégorie
    @PutMapping("/{id}")
    public ResponseEntity<EventCategoryResponse> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody EventCategoryRequest request,
            @RequestParam Long userId) {

        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(categoryService.updateCategory(id, request));
    }

    // ✅ Seul ADMIN peut supprimer une catégorie
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable Long id,
            @RequestParam Long userId) {

        com.elif.entities.user.User user = userService.findUser(userId);
        if (user == null || user.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}