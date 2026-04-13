package com.elif.services.events.implementations;

import com.elif.dto.events.request.EventCategoryRequest;
import com.elif.dto.events.response.EventCategoryResponse;
import com.elif.entities.events.EventCategory;
import com.elif.exceptions.events.EventExceptions;
import com.elif.repositories.events.EventCategoryRepository;
import com.elif.services.events.interfaces.IEventCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
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
        return categoryRepository.findById(id)
                .map(this::toResponse)
                .orElseThrow(() -> new EventExceptions.CategoryNotFoundException(id));
    }

    @Override
    public EventCategoryResponse createCategory(EventCategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new EventExceptions.DuplicateCategoryException(request.getName());
        }
        EventCategory category = EventCategory.builder()
                .name(request.getName().trim())
                .icon(request.getIcon())
                .description(request.getDescription())
                .requiresApproval(
                        request.getRequiresApproval() != null ? request.getRequiresApproval() : false)
                .build();
        EventCategory saved = categoryRepository.save(category);
        log.info("✅ Catégorie créée : '{}' (id={})", saved.getName(), saved.getId());
        return toResponse(saved);
    }

    @Override
    public EventCategoryResponse updateCategory(Long id, EventCategoryRequest request) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new EventExceptions.CategoryNotFoundException(id));

        // Vérifier le doublon uniquement si le nom change
        if (!category.getName().equalsIgnoreCase(request.getName())
                && categoryRepository.existsByNameIgnoreCase(request.getName())) {
            throw new EventExceptions.DuplicateCategoryException(request.getName());
        }

        category.setName(request.getName().trim());
        category.setIcon(request.getIcon());
        category.setDescription(request.getDescription());
        if (request.getRequiresApproval() != null) {
            category.setRequiresApproval(request.getRequiresApproval());
        }
        log.info("✏️ Catégorie {} mise à jour : '{}'", id, category.getName());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    public void deleteCategory(Long id) {
        EventCategory category = categoryRepository.findById(id)
                .orElseThrow(() -> new EventExceptions.CategoryNotFoundException(id));
        if (categoryRepository.isCategoryUsed(id)) {
            throw new EventExceptions.CategoryInUseException(id);
        }
        categoryRepository.delete(category);
        log.info("🗑️ Catégorie {} supprimée", id);
    }

    private EventCategoryResponse toResponse(EventCategory c) {
        return EventCategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .icon(c.getIcon())
                .description(c.getDescription())
                .requiresApproval(c.getRequiresApproval())
                .build();
    }
}
