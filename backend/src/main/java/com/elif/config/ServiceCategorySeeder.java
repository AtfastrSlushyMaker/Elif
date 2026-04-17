package com.elif.config;

import com.elif.entities.service.ServiceCategory;
import com.elif.repositories.service.ServiceCategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class ServiceCategorySeeder {

    @Bean
    public CommandLineRunner initServiceCategories(ServiceCategoryRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                List<ServiceCategory> defaultCategories = List.of(
                        ServiceCategory.builder().name("VETERINARY").description("services médicaux").build(),
                        ServiceCategory.builder().name("GROOMING").description("beauté & entretien").build(),
                        ServiceCategory.builder().name("TRAINING").description("comportement & éducation").build(),
                        ServiceCategory.builder().name("BOARDING").description("garder l’animal").build(),
                        ServiceCategory.builder().name("WALKING").description("promenade des chiens").build()
                );

                repository.saveAll(defaultCategories);
                System.out.println("✅ Les catégories de services ont été initialisées avec succès.");
            }
        };
    }
}
