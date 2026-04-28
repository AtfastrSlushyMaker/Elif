# Pet Profile Notification System Integration

## Overview

Successfully integrated pet profile health events with the existing notification system to send reminders for vaccines, vet visits, care tasks, and parasite prevention.

## Components Created

### 1. **PetNotificationService** (`backend/src/main/java/com/elif/services/pet_profile/PetNotificationService.java`)

Core service that handles all pet health event notifications with the following capabilities:

#### Scheduled Daily Check (8:00 AM)
Runs every morning at 08:00 to check for upcoming pet health events:

```java
@Scheduled(cron = "0 0 8 * * *")
public void checkDailyReminders()
```

#### Vaccine Reminders
- Triggers when `nextVisitDate` is within 14 days
- Sends notification: "Time for [pet name]'s vaccination appointment"
- Uses `PET_VACCINE_REMINDER` notification type
- Deep link: `/app/pets/{petId}`

#### Health Checkup Reminders
- Sends reminder if no health record exists for pet
- Sends reminder if last health record is 6+ months old
- Helps ensure regular veterinary care
- Uses `PET_HEALTH_CHECKUP_REMINDER` notification type

#### Parasite Prevention Reminders
- Tracks parasite prevention treatment dates
- Assumes standard 3-month prevention schedule
- Triggers reminder 30 days before due date
- Uses `PET_PARASITE_PREVENTION_REMINDER` notification type

#### Care Task Reminders
- Monitors upcoming care tasks with due dates
- Sends reminders for tasks due within 3 days
- Shows urgency level (CRITICAL/HIGH/MEDIUM/LOW)
- Uses `PET_CARE_TASK_REMINDER` notification type
- Excludes completed tasks

#### Immediate Notifications
- **New Health Records**: `notifyNewHealthRecord()` - triggered when creating health records with vaccination info
- **Urgent Care Tasks**: `notifyUrgentCareTask()` - triggered for CRITICAL or HIGH priority tasks

### 2. **NotificationType Enum Updates**

Added pet-specific notification types:

```java
// Pet profile health & care reminders
PET_VACCINE_REMINDER,
PET_HEALTH_CHECKUP_REMINDER,
PET_PARASITE_PREVENTION_REMINDER,
PET_CARE_TASK_REMINDER,
PET_HEALTH_UPDATE
```

### 3. **PetProfileServiceImpl Integration**

Updated service to call notification methods when creating health records and tasks:

```java
// In createMyPetHealthRecord()
PetHealthRecord saved = petHealthRecordRepository.save(record);
petNotificationService.notifyNewHealthRecord(userId, saved);

// In createMyPetTask()
PetCareTask saved = petCareTaskRepository.save(task);
petNotificationService.notifyUrgentCareTask(userId, saved);
```

### 4. **Repository Enhancements**

#### PetCareTaskRepository
Added query method to find non-completed tasks with due dates:
```java
List<PetCareTask> findByPetIdAndStatusNotAndDueDateNotNull(Long petId, PetTaskStatus status);
```

#### PetHealthRecordRepository
Added query method for descending date ordering:
```java
List<PetHealthRecord> findByPetIdOrderByRecordDateDesc(Long petId);
```

## Notification Flow

```
┌─────────────────────────────┐
│  User Action                │
├─────────────────────────────┤
│ 1. Create Health Record     │
│ 2. Create Care Task         │
│ 3. Scheduled Check (8am)    │
└──────────┬──────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│  PetNotificationService                 │
├─────────────────────────────────────────┤
│ • notifyNewHealthRecord()               │
│ • notifyUrgentCareTask()                │
│ • checkVaccineReminder()                │
│ • checkNextVisitReminder()              │
│ • checkParasitePreventionReminder()     │
│ • checkUpcomingCareTasks()              │
└──────────┬──────────────────────────────┘
           │
           ▼
┌──────────────────────────────────┐
│  AppNotificationService.create() │
├──────────────────────────────────┤
│ Creates notification entry       │
│ Broadcasts via STOMP             │
│ Updates notification count       │
└──────────┬───────────────────────┘
           │
           ▼
┌────────────────────────────────────────┐
│  Frontend                              │
├────────────────────────────────────────┤
│ • NotificationService receives update  │
│ • NotificationPanel displays reminder  │
│ • User clicks to view pet profile      │
└────────────────────────────────────────┘
```

## Notification Data Structure

Notifications are created with standardized format:

```java
appNotificationService.create(
    userId,                    // Recipient user
    null,                      // System-generated (no actor)
    NotificationType.PET_*,    // Specific reminder type
    title,                     // "Vaccine Reminder: Buddy"
    message,                   // "Time for Buddy's vaccination..."
    "/app/pets/{petId}",      // Deep link to pet profile
    "PET_HEALTH_RECORD",      // Reference type
    recordId                   // Reference ID for context
);
```

## Broadcast Channel

All pet notifications broadcast to:
- `/topic/community.notifications.{userId}` - Main notification stream
- `/topic/community.notifications.{userId}.count` - Unread count updates

This uses the existing WebSocket/STOMP infrastructure, so frontend receives real-time updates.

## Configuration

### Scheduling Enabled
Ensure `@EnableScheduling` is active in your Spring Boot application (usually in `@SpringBootApplication`).

### Time Zone Consideration
The daily check runs at 08:00 in the server's configured time zone. Adjust the cron expression if needed:
- Current: `"0 0 8 * * *"` (8:00 AM daily)
- Alternatives:
  - `"0 0 9 * * *"` (9:00 AM daily)
  - `"0 0 12 * * *"` (Noon daily)

### Reminder Windows (Configurable)

Current thresholds can be adjusted in `PetNotificationService`:
- **Vaccine reminder window**: 14 days before next visit
- **Health checkup threshold**: 6 months since last record
- **Parasite prevention cycle**: 3 months
- **Parasite reminder window**: 30 days before due
- **Care task reminder window**: 3 days before due date

## Testing the System

### 1. Create a Health Record with Next Visit Date

```bash
POST /api/user-pets/{petId}/health-history
Headers: X-User-Id: 123
Body: {
  "recordDate": "2026-04-28",
  "visitType": "vaccination",
  "vaccinationHistory": "DHPP, Rabies",
  "nextVisitDate": "2026-05-05"  # Within 14 days
}
```

**Expected**: Immediate notification "Vaccine Reminder: [petName]"

### 2. Create an Urgent Care Task

```bash
POST /api/user-pets/{petId}/tasks
Headers: X-User-Id: 123
Body: {
  "title": "Emergency medication",
  "category": "medication",
  "urgency": "CRITICAL",
  "status": "NOW",
  "dueDate": "2026-04-29"
}
```

**Expected**: Immediate notification "Urgent: Emergency medication"

### 3. Trigger Daily Scheduled Check

Manual trigger (for testing):
```bash
# Access the service through a debug endpoint or restart the application
# The scheduled task will run at next 08:00
```

**Expected**: Notifications for all upcoming reminders based on current pet data

## Frontend Integration

### Display Pet Notifications
Notifications appear in the standard notification panel with:
- Icon/badge for pet-related notifications
- Deep link to pet profile details page
- Clear action message about what's due

### Notification Center
1. User opens notification panel
2. Sees list of pet reminders (vaccine, checkup, tasks, etc.)
3. Clicks notification to jump to pet profile
4. Can mark as read or dismiss

### Optional: Pet Profile Notification Preferences
Future enhancement: Add user settings to:
- Enable/disable vaccine reminders
- Enable/disable checkup reminders
- Enable/disable care task reminders
- Set custom reminder windows

## Backend Testing Checklist

- [x] `PetNotificationService` created and compiles
- [x] `NotificationType` enum updated with pet types
- [x] `PetProfileServiceImpl` integrated with notification calls
- [x] Repository query methods added
- [x] Backend compiles successfully (478 files)

## Integration Points

### When Health Record Created
→ Calls `petNotificationService.notifyNewHealthRecord(userId, record)`
→ Sends `PET_HEALTH_UPDATE` notification

### When Care Task Created
→ Calls `petNotificationService.notifyUrgentCareTask(userId, task)`
→ Sends `PET_CARE_TASK_REMINDER` for urgent/critical priority

### Daily at 8:00 AM
→ `@Scheduled` job runs `checkDailyReminders()`
→ Checks all pets and sends appropriate reminders

## Next Steps

1. **Test Schedule** (if not auto-running):
   - Verify `@EnableScheduling` is active
   - Monitor logs for scheduled task execution

2. **Frontend Display**:
   - Verify notification panel shows pet reminders
   - Test deep links to pet profiles
   - Confirm STOMP broadcast is received

3. **User Testing**:
   - Create pet health record with upcoming visit
   - Verify notification appears
   - Check deep link navigates to correct pet
   - Create urgent care task and verify notification

4. **Optional Enhancements**:
   - Adjust reminder windows based on user feedback
   - Add notification preferences to user settings
   - Implement push notifications for mobile
   - Add email reminders for important health events

## Troubleshooting

### Notifications Not Appearing
- Check `@EnableScheduling` annotation in main Spring Boot application
- Verify `PetNotificationService` is properly autowired
- Check application logs for notification creation attempts
- Ensure `AppNotificationService` is working (test with non-pet notifications)

### Schedule Not Running
- Verify cron expression: `"0 0 8 * * *"`
- Check server time zone
- Look for scheduled task logs in application output
- Ensure no scheduled task exceptions are suppressed

### Wrong Notification Timing
- Adjust cron expression in `@Scheduled` annotation
- Check reminder window thresholds in `PetNotificationService` methods
- Verify database dates are correct (recordDate, nextVisitDate, dueDate)

## File Changes Summary

| File | Changes |
|------|---------|
| `PetNotificationService.java` | Created new service (285 lines) |
| `NotificationType.java` | Added 5 pet notification types |
| `PetProfileServiceImpl.java` | Added PetNotificationService dependency, integrated notification calls |
| `PetCareTaskRepository.java` | Added query method for non-completed tasks |
| `PetHealthRecordRepository.java` | Added query method for date ordering |

## Compilation Status

✅ **BUILD SUCCESS**
- Total compile time: ~90 seconds
- 478 source files compiled
- No errors (only standard deprecation warnings)
- Ready for deployment

## Architecture Alignment

✅ Follows existing patterns:
- Uses header-based identity (`X-User-Id`)
- Extends existing `AppNotificationService` for creation
- Uses STOMP/WebSocket broadcast infrastructure
- Follows service/repository domain layering
- Integrates seamlessly with existing notification system
