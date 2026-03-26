package com.elif.services.service;

import com.elif.dto.service.ServiceDTO;
import com.elif.entities.service.Service;
import com.elif.entities.service.ServiceCategory;
import com.elif.entities.user.User;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.service.ServiceCategoryRepository;
import com.elif.repositories.service.ServiceRepository;
import com.elif.repositories.user.UserRepository;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final UserRepository userRepository;

    public ServiceService(ServiceRepository serviceRepository,
                          ServiceCategoryRepository serviceCategoryRepository,
                          UserRepository userRepository) {
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.userRepository = userRepository;
    }

    public List<Service> getAll() {
        return serviceRepository.findAll();
    }

    public Service getById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service not found with id: " + id));
    }

    public Service create(Service service) {
        return serviceRepository.save(service);
    }

    public Service create(ServiceDTO serviceDTO) {
        ServiceCategory category = serviceCategoryRepository.findById(serviceDTO.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory not found with id: " + serviceDTO.getCategoryId()));
        User provider = userRepository.findById(serviceDTO.getProviderId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + serviceDTO.getProviderId()));

        Service service = new Service();
        service.setName(serviceDTO.getName());
        service.setDescription(serviceDTO.getDescription());
        service.setPrice(serviceDTO.getPrice() == null ? 0d : serviceDTO.getPrice());
        service.setDuration(serviceDTO.getDuration() == null ? 0 : serviceDTO.getDuration());
        service.setStatus(serviceDTO.getStatus());
        service.setCategory(category);
        service.setProvider(provider);

        return serviceRepository.save(service);
    }

    public Service update(Long id, Service service) {
        Service existing = getById(id);
        if (service.getName() != null) {
            existing.setName(service.getName());
        }
        if (service.getDescription() != null) {
            existing.setDescription(service.getDescription());
        }
        if (service.getPrice() > 0) {
            existing.setPrice(service.getPrice());
        }
        if (service.getDuration() > 0) {
            existing.setDuration(service.getDuration());
        }
        if (service.getStatus() != null) {
            existing.setStatus(service.getStatus());
        }
        if (service.getCategory() != null) {
            existing.setCategory(service.getCategory());
        }
        if (service.getProvider() != null) {
            existing.setProvider(service.getProvider());
        }
        return serviceRepository.save(existing);
    }

    public Service update(Long id, ServiceDTO serviceDTO) {
        Service existing = getById(id);

        if (serviceDTO.getName() != null) {
            existing.setName(serviceDTO.getName());
        }
        if (serviceDTO.getDescription() != null) {
            existing.setDescription(serviceDTO.getDescription());
        }
        if (serviceDTO.getPrice() != null) {
            existing.setPrice(serviceDTO.getPrice());
        }
        if (serviceDTO.getDuration() != null) {
            existing.setDuration(serviceDTO.getDuration());
        }
        if (serviceDTO.getStatus() != null) {
            existing.setStatus(serviceDTO.getStatus());
        }

        if (serviceDTO.getCategoryId() != null) {
            ServiceCategory category = serviceCategoryRepository.findById(serviceDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("ServiceCategory not found with id: " + serviceDTO.getCategoryId()));
            existing.setCategory(category);
        }
        if (serviceDTO.getProviderId() != null) {
            User provider = userRepository.findById(serviceDTO.getProviderId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + serviceDTO.getProviderId()));
            existing.setProvider(provider);
        }

        return serviceRepository.save(existing);
    }

    public void delete(Long id) {
        Service service = getById(id);
        serviceRepository.delete(service);
    }

    public List<Service> findByCategoryId(Long categoryId) {
        return serviceRepository.findByCategoryId(categoryId);
    }

    public List<Service> findByStatus(String status) {
        return serviceRepository.findByStatus(status);
    }
}
