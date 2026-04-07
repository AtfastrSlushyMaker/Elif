package com.elif.services.service;

import com.elif.dto.service.ServiceDTO;
import com.elif.entities.service.Service;
import com.elif.entities.service.ServiceCategory;
import com.elif.entities.user.User;
import com.elif.exceptions.ResourceNotFoundException;
import com.elif.repositories.service.ServiceCategoryRepository;
import com.elif.repositories.service.ServiceRepository;
import com.elif.repositories.service.ServiceProviderRequestRepository;
import com.elif.repositories.user.UserRepository;
import com.elif.entities.service.ServiceProviderRequest.RequestStatus;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@org.springframework.stereotype.Service
public class ServiceService {

    private final ServiceRepository serviceRepository;
    private final ServiceCategoryRepository serviceCategoryRepository;
    private final UserRepository userRepository;
    private final ServiceProviderRequestRepository requestRepository;

    public ServiceService(ServiceRepository serviceRepository,
            ServiceCategoryRepository serviceCategoryRepository,
            UserRepository userRepository,
            ServiceProviderRequestRepository requestRepository) {
        this.serviceRepository = serviceRepository;
        this.serviceCategoryRepository = serviceCategoryRepository;
        this.userRepository = userRepository;
        this.requestRepository = requestRepository;
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
                .orElseThrow(() -> new ResourceNotFoundException(
                        "ServiceCategory not found with id: " + serviceDTO.getCategoryId()));

        User provider = null;
        if (serviceDTO.getProviderId() != null) {
            provider = userRepository.findById(serviceDTO.getProviderId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with id: " + serviceDTO.getProviderId()));
            
            boolean isApproved = requestRepository.existsByUserIdAndStatus(provider.getId(), RequestStatus.APPROVED);
            if (!isApproved) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Provider not approved by admin");
            }
        }

        Service service = new Service();
        service.setName(serviceDTO.getName());
        service.setDescription(serviceDTO.getDescription());
        service.setPrice(serviceDTO.getPrice() == null ? 0d : serviceDTO.getPrice());
        service.setDuration(serviceDTO.getDuration() == null ? 0 : serviceDTO.getDuration());
        service.setStatus(serviceDTO.getStatus());
        service.setImageUrl(serviceDTO.getImageUrl());
        service.setCategory(category);
        service.setProvider(provider);
        service.setClinicName(serviceDTO.getClinicName());
        service.setConsultationType(serviceDTO.getConsultationType());
        service.setEmergencyAvailable(serviceDTO.getEmergencyAvailable());
        service.setRequiresAppointment(serviceDTO.getRequiresAppointment());

        service.setPetSize(serviceDTO.getPetSize());
        service.setIncludesBath(serviceDTO.getIncludesBath());
        service.setIncludesHaircut(serviceDTO.getIncludesHaircut());
        service.setProductsUsed(serviceDTO.getProductsUsed());

        service.setTrainingType(serviceDTO.getTrainingType());
        service.setSessionsCount(serviceDTO.getSessionsCount());
        service.setSessionDuration(serviceDTO.getSessionDuration());
        service.setGroupTraining(serviceDTO.getGroupTraining());

        service.setCapacity(serviceDTO.getCapacity());
        service.setOvernight(serviceDTO.getOvernight());
        service.setHasOutdoorSpace(serviceDTO.getHasOutdoorSpace());
        service.setMaxStayDays(serviceDTO.getMaxStayDays());

        service.setRoomType(serviceDTO.getRoomType());
        service.setHasCameraAccess(serviceDTO.getHasCameraAccess());
        service.setIncludesFood(serviceDTO.getIncludesFood());
        service.setNumberOfStaff(serviceDTO.getNumberOfStaff());

        service.setDurationPerWalk(serviceDTO.getDurationPerWalk());
        service.setGroupWalk(serviceDTO.getGroupWalk());
        service.setMaxDogs(serviceDTO.getMaxDogs());
        service.setAreaCovered(serviceDTO.getAreaCovered());

        if (serviceDTO.getOptions() != null) {
            for (com.elif.dto.service.ServiceOptionDTO optionDTO : serviceDTO.getOptions()) {
                com.elif.entities.service.ServiceOption option = new com.elif.entities.service.ServiceOption();
                option.setName(optionDTO.getName());
                option.setPrice(optionDTO.getPrice() != null ? optionDTO.getPrice() : 0.0);
                service.addOption(option);
            }
        }

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
        if (serviceDTO.getImageUrl() != null) {
            existing.setImageUrl(serviceDTO.getImageUrl());
        }

        if (serviceDTO.getCategoryId() != null) {
            ServiceCategory category = serviceCategoryRepository.findById(serviceDTO.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "ServiceCategory not found with id: " + serviceDTO.getCategoryId()));
            existing.setCategory(category);
        }
        if (serviceDTO.getProviderId() != null) {
            User provider = userRepository.findById(serviceDTO.getProviderId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "User not found with id: " + serviceDTO.getProviderId()));
            existing.setProvider(provider);
        }

        existing.setClinicName(serviceDTO.getClinicName());
        existing.setConsultationType(serviceDTO.getConsultationType());
        existing.setEmergencyAvailable(serviceDTO.getEmergencyAvailable());
        existing.setRequiresAppointment(serviceDTO.getRequiresAppointment());

        existing.setPetSize(serviceDTO.getPetSize());
        existing.setIncludesBath(serviceDTO.getIncludesBath());
        existing.setIncludesHaircut(serviceDTO.getIncludesHaircut());
        existing.setProductsUsed(serviceDTO.getProductsUsed());

        existing.setTrainingType(serviceDTO.getTrainingType());
        existing.setSessionsCount(serviceDTO.getSessionsCount());
        existing.setSessionDuration(serviceDTO.getSessionDuration());
        existing.setGroupTraining(serviceDTO.getGroupTraining());

        existing.setCapacity(serviceDTO.getCapacity());
        existing.setOvernight(serviceDTO.getOvernight());
        existing.setHasOutdoorSpace(serviceDTO.getHasOutdoorSpace());
        existing.setMaxStayDays(serviceDTO.getMaxStayDays());

        existing.setRoomType(serviceDTO.getRoomType());
        existing.setHasCameraAccess(serviceDTO.getHasCameraAccess());
        existing.setIncludesFood(serviceDTO.getIncludesFood());
        existing.setNumberOfStaff(serviceDTO.getNumberOfStaff());

        existing.setDurationPerWalk(serviceDTO.getDurationPerWalk());
        existing.setGroupWalk(serviceDTO.getGroupWalk());
        existing.setMaxDogs(serviceDTO.getMaxDogs());
        existing.setAreaCovered(serviceDTO.getAreaCovered());

        if (serviceDTO.getOptions() != null) {
            // Clear existing options
            existing.getOptions().clear();
            for (com.elif.dto.service.ServiceOptionDTO optionDTO : serviceDTO.getOptions()) {
                com.elif.entities.service.ServiceOption option = new com.elif.entities.service.ServiceOption();
                option.setName(optionDTO.getName());
                option.setPrice(optionDTO.getPrice() != null ? optionDTO.getPrice() : 0.0);
                existing.addOption(option);
            }
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
