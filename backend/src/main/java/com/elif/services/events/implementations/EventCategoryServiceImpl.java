package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventCategoryRequest;
import com.elif.dto.events.response.EventCategoryResponse;
import com.elif.entities.events.EventCategory;
import com.elif.repositories.events.EventCategoryRepository;
import com.elif.services.events.interfaces.IEventCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EventCategoryServiceImpl implements IEventCategoryService {

    private final EventCategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EventCategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public EventCategoryResponse getCategoryById(Long id) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));
        return toResponse(category);
    }

    @Override
    public EventCategoryResponse createCategory(EventCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà.");
        }

        EventCategory category = EventCategory.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();

        EventCategory saved = categoryRepository.save(category);
        return toResponse(saved);
    }

    @Override
    public EventCategoryResponse updateCategory(Long id, EventCategoryRequest request) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        if (!category.getName().equalsIgnoreCase(request.getName()) &&
                categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new RuntimeException("Une catégorie avec ce nom existe déjà.");
        }

        category.setName(request.getName());
        category.setDescription(request.getDescription());

        EventCategory updated = categoryRepository.save(category);
        return toResponse(updated);
    }

    @Override
    public void deleteCategory(Long id) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        if (categoryRepository.isCategoryUsed(id)) {
            throw new RuntimeException("Impossible de supprimer cette catégorie car elle est utilisée par des événements.");
        }

        categoryRepository.delete(category);
    }

    private EventCategoryResponse toResponse(EventCategory category) {
        return EventCategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .build();
    }
}