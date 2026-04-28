# Adoption Module Design System Migration Guide

## Overview
This guide explains how to complete the UI redesign of the adoption module to match the transit module design system.

## What Has Been Completed

### ✅ Services
- Created `adoption-toast.service.ts` in both back-office and front-office
- Created `adoption-toast.component` with HTML, SCSS, and TypeScript in both modules
- Created `adoption-confirm-dialog.component` in both modules

### ✅ TypeScript Components Updated
- **Back-office:**
  - `pet-management.component.ts` - 2 alert() → toastService
  - `shelter-management.component.ts` - 10 alert() → toastService
  - `shelter-detail.component.ts` - 7 alert() → toastService
  - `pet-form.component.ts` - 2 alert() → toastService

- **Front-office:**
  - `my-contracts.component.ts` - 1 alert() → toastService
  - `shelter-pet-form.component.ts` - 2 alert() → toastService
  - `shelter-pets.component.ts` - 4 alert() → toastService + confirm dialog
  - `shelter-requests.component.ts` - 2 confirm() → dialog state management

### ✅ Module Updates
- Updated `adoption.module.ts` in both modules
- Added MatIconModule to imports
- Added AdoptionToastComponent to imports

### ✅ Design System SCSS
- Created `adoption-design-system.scss` in both modules
- Contains all button styles (.btn-primary, .btn-secondary, .btn-danger, .btn-warning, .btn-icon)
- Contains all card styles (.adoption-card)
- Contains all badge styles (.badge-success, .badge-pending, .badge-rejected, .badge-info, .badge-critical, .badge-atrisk, .badge-watch)

## Remaining Tasks

### Task 1: Add Toast Component to Root Templates
Add the adoption-toast component to the main layout template for each module:

**Back-office:**
```html
<!-- Add at the end of: src/app/back-office/adoption/adoption.component.html -->
<app-adoption-toast></app-adoption-toast>
```

**Front-office:**
```html
<!-- Add at the end of: src/app/front-office/adoption/adoption.component.html -->
<app-adoption-toast></app-adoption-toast>
```

### Task 2: Add Confirm Dialog Components to Templates
Add the confirm dialog components to components that use them:

**Back-office Components (add to HTML templates):**
- `pet-management.component.html`
- `shelter-management.component.html`
- `shelter-detail.component.html`

Example pattern:
```html
<app-adoption-confirm-dialog
  *ngIf="showDeleteDialog"
  title="Confirm Delete"
  message="Are you sure you want to delete this item? This action cannot be undone."
  confirmLabel="Delete"
  [confirmDanger]="true"
  (confirmed)="onDeleteConfirmed()"
  (cancelled)="onDeleteCancelled()">
</app-adoption-confirm-dialog>
```

**Front-office Components:**
- `shelter-requests.component.html` - 2 dialogs needed (approve request, cancel appointment)
- `shelter-pets.component.html` - 1 dialog for delete pet

### Task 3: Import Adoption-Confirm-Dialog in Modules
Update module imports to include the confirm dialog component:

```typescript
import { AdoptionConfirmDialogComponent } from './components/adoption-confirm-dialog/adoption-confirm-dialog.component';

@NgModule({
  imports: [
    // ...
    AdoptionConfirmDialogComponent,
    // ...
  ]
})
```

### Task 4: Import Design System SCSS Globally
Add import to each module's main SCSS or to a global styles file:

**Back-office:**
```scss
@import './adoption-design-system.scss';
```

**Front-office:**
```scss
@import './adoption-design-system.scss';
```

### Task 5: Replace Font Awesome Icons with Material Icons

#### Icon Mapping
- `fa-trash / fa-trash-alt` → `<mat-icon>delete</mat-icon>`
- `fa-edit / fa-pencil` → `<mat-icon>edit</mat-icon>`
- `fa-plus / fa-add` → `<mat-icon>add</mat-icon>`
- `fa-eye` → `<mat-icon>visibility</mat-icon>`
- `fa-check / fa-check-circle` → `<mat-icon>check_circle</mat-icon>`
- `fa-times / fa-close` → `<mat-icon>close</mat-icon>`
- `fa-search` → `<mat-icon>search</mat-icon>`
- `fa-home` → `<mat-icon>home</mat-icon>`
- `fa-paw` → `<mat-icon>pets</mat-icon>`
- `fa-user` → `<mat-icon>person</mat-icon>`
- `fa-users` → `<mat-icon>group</mat-icon>`
- `fa-calendar` → `<mat-icon>calendar_today</mat-icon>`
- `fa-file-contract` → `<mat-icon>description</mat-icon>`
- `fa-undo / fa-refresh` → `<mat-icon>refresh</mat-icon>`
- `fa-arrow-left` → `<mat-icon>arrow_back</mat-icon>`
- `fa-list` → `<mat-icon>list</mat-icon>`
- `fa-euro-sign` → `<mat-icon>euro</mat-icon>`
- `fa-exclamation-circle` → `<mat-icon>error</mat-icon>`
- `fa-info-circle` → `<mat-icon>info</mat-icon>`
- `fa-spinner` → `<mat-icon>hourglass_empty</mat-icon>`

#### Replacement Pattern
Old:
```html
<i class="fas fa-plus me-2"></i> Add New
<i class="fas fa-trash-alt"></i> Delete
<i class="fas fa-edit"></i> Edit
```

New:
```html
<mat-icon>add</mat-icon> Add New
<mat-icon>delete</mat-icon> Delete
<mat-icon>edit</mat-icon> Edit
```

### Task 6: Apply Button Classes to All Buttons

#### Pattern for Primary Action Buttons
```html
<!-- Old -->
<button class="btn btn-primary">Save</button>

<!-- New -->
<button class="btn-primary">
  <mat-icon>save</mat-icon>
  Save
</button>
```

#### Available Button Classes
- `.btn-primary` - Main action button (green, filled)
- `.btn-secondary` - Secondary action (outlined)
- `.btn-danger` - Destructive action (red, outlined)
- `.btn-warning` - Warning action (amber, outlined)
- `.btn-icon` - Icon-only button (small, circular)

### Task 7: Apply Card Styles

#### Pattern
```html
<!-- Old -->
<div class="card">
  Content
</div>

<!-- New -->
<div class="adoption-card">
  Content
</div>
```

### Task 8: Apply Badge Styles

#### Pattern
```html
<!-- Old -->
<span class="status-badge">Active</span>

<!-- New -->
<span class="badge badge-success">Active</span>
<span class="badge badge-pending">Pending</span>
<span class="badge badge-rejected">Rejected</span>
<span class="badge badge-info">Info</span>
<span class="badge badge-critical">Critical</span>
<span class="badge badge-atrisk">At Risk</span>
<span class="badge badge-watch">Watch</span>
```

## Files That Need HTML Updates

### Back-office Adoption Components
1. `pet-management.component.html` - Icons, buttons, cards
2. `shelter-management.component.html` - Icons, buttons, cards
3. `shelter-detail.component.html` - Icons, buttons, cards
4. `pet-form.component.html` - Icons, buttons, form elements
5. `request-management.component.html` - Icons, buttons, badges
6. `contract-management.component.html` - Icons, buttons
7. `review-moderation.component.html` - Icons, buttons, badges
8. `admin-at-risk.component.html` - Icons, buttons, badges
9. `statistics.component.html` - Cards, badges

### Front-office Adoption Components
1. `pet-list.component.html` - Icons, cards, badges
2. `pet-detail.component.html` - Icons, buttons, cards
3. `shelter-list.component.html` - Cards, icons
4. `shelter-detail.component.html` - Icons, buttons, cards
5. `shelter-pets.component.html` - Icons, buttons, cards, badges
6. `shelter-requests.component.html` - Icons, buttons, cards, badges
7. `shelter-pet-form.component.html` - Icons, buttons, forms
8. `my-requests.component.html` - Icons, buttons, cards, badges
9. `my-contracts.component.html` - Icons, buttons, cards, badges
10. `request-form.component.html` - Buttons, forms
11. `shelter-dashboard.component.html` - Cards, icons, badges
12. `shelter-at-risk.component.html` - Icons, buttons, badges, cards
13. `pet-suggestion-wizard.component.html` - Buttons, cards
14. `chatbot-widget.component.html` - Icons

## Testing Checklist

- [ ] All toast notifications appear in the correct location (bottom-right)
- [ ] All confirm dialogs display with correct styling
- [ ] All Material icons render correctly (no font loading issues)
- [ ] All button styles match the design system
- [ ] All cards have the correct shadow and hover effects
- [ ] All badges display correctly with appropriate colors
- [ ] No console errors related to missing MatIconModule
- [ ] No compilation errors

## Notes

- MatIconModule is already imported in both modules
- AdoptionToastComponent is already imported and declared
- AdoptionConfirmDialogComponent needs to be imported in HTML templates
- The design system SCSS uses CSS custom properties for easy theming
- All styles use the "green" primary color (#43a047) from the transit module
- Border radius for cards is 20px, for buttons is 50px (pill-shaped)
- Box shadows follow the transit module pattern

## Color Reference

- Primary: `#43a047` (Green)
- Danger: `#dc2626` (Red)
- Warning: `#f59e0b` (Amber)
- Success: `#16a34a` (Dark Green)
- Background: `#f9fafb` (Light Gray)
- Text: `#1a1a2e` (Dark)
- Text Muted: `#6b7280` (Medium Gray)
- Border: `#e5e7eb` (Light Gray)
