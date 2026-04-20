package com.elif.scheduler.pet_transit;

import com.elif.entities.notification.enums.NotificationType;
import com.elif.entities.pet_transit.TravelPlan;
import com.elif.entities.pet_transit.enums.TravelPlanStatus;
import com.elif.repositories.pet_transit.TravelPlanRepository;
import com.elif.services.notification.AppNotificationService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@AllArgsConstructor
@Slf4j
public class TravelReminderScheduler {

    private final TravelPlanRepository travelPlanRepository;
    private final AppNotificationService appNotificationService;

    // Runs every day at 9:00 AM
    @Scheduled(cron = "0 0 9 * * *")
    public void sendTravelReminders() {
        LocalDate tomorrow = LocalDate.now().plusDays(1);

        List<TravelPlan> plansForTomorrow =
                travelPlanRepository.findByStatusAndTravelDate(TravelPlanStatus.APPROVED, tomorrow);

        plansForTomorrow.forEach(plan -> {
            appNotificationService.create(
                    plan.getOwner().getId(),
                    null,
                    NotificationType.TRAVEL_REMINDER,
                    "Travel reminder",
                    "Your trip to "
                            + plan.getDestination().getTitle()
                            + " is tomorrow. Make sure your travel documents are ready.",
                    "/app/transit/plans/" + plan.getId(),
                    "TRAVEL_PLAN",
                    plan.getId());
            log.info("[REMINDER] Sent reminder for plan {}", plan.getId());
        });
    }
}
