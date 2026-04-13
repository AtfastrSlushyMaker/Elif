# Pet Nutrition System - UI/UX Mockups & Design Guide

## 🎨 Color Palette

```css
/* Primary Colors */
--nutrition-green: #10b981;    /* On track, healthy */
--nutrition-yellow: #f59e0b;   /* Warning, close to limit */
--nutrition-red: #ef4444;      /* Over limit, alert */
--nutrition-blue: #3b82f6;     /* Water, hydration */
--nutrition-purple: #8b5cf6;   /* Weight, body metrics */

/* Neutral Colors */
--bg-primary: #ffffff;
--bg-secondary: #f9fafb;
--bg-tertiary: #f3f4f6;
--text-primary: #111827;
--text-secondary: #6b7280;
--border-color: #e5e7eb;

/* Gradients */
--gradient-success: linear-gradient(135deg, #10b981 0%, #059669 100%);
--gradient-warning: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
--gradient-info: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
```

## 📱 Dashboard Layout (Mobile-First)

### Top Section: Nutrition Score Card
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│         🎯 Today's Nutrition Score                      │
│                                                         │
│              A+                                         │
│            95/100                                       │
│                                                         │
│         ⭐⭐⭐⭐⭐                                        │
│                                                         │
│    "Excellent! All goals met today"                    │
│                                                         │
│    [View Detailed Report →]                            │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Large, centered score with gradient background
- Animated star rating (fills on load)
- Subtle pulse animation on perfect score
- Tap to expand detailed breakdown

### Quick Stats Grid
```
┌──────────────┬──────────────┬──────────────┬──────────────┐
│              │              │              │              │
│   🔥 850     │   💧 400ml   │   ⚖️ 12.5kg  │   🍽️ 2/3     │
│   Calories   │   Water      │   Weight     │   Meals      │
│              │              │              │              │
│   ████░░ 71% │   ████████   │   ↓ -0.2kg   │   ████░░     │
│              │   80%        │   This week  │   67%        │
│              │              │              │              │
│   350 left   │   100ml left │   On track   │   1 pending  │
│              │              │              │              │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

**Design Notes:**
- Card-based layout with subtle shadows
- Progress bars with smooth animations
- Color-coded based on status
- Tap any card to see details

### Meal Timeline (Horizontal Scroll)
```
┌─────────────────────────────────────────────────────────┐
│  Today's Meals                          [+ Add Meal]    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐│
│  │ 8:00 AM  │  │ 12:30 PM │  │ 6:00 PM  │  │ 9:00 PM  ││
│  │          │  │          │  │          │  │          ││
│  │ ✅       │  │ ✅       │  │ ⏰       │  │ 🔔       ││
│  │ Breakfast│  │ Lunch    │  │ Dinner   │  │ Snack    ││
│  │          │  │          │  │          │  │          ││
│  │ 300 kcal │  │ 400 kcal │  │ 450 kcal │  │ 50 kcal  ││
│  │ Logged   │  │ Logged   │  │ Pending  │  │ Planned  ││
│  │          │  │          │  │          │  │          ││
│  │ [View]   │  │ [View]   │  │ [Log Now]│  │ [Skip]   ││
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Design Notes:**
- Horizontal scrollable cards
- Visual status indicators (✅ logged, ⏰ pending, 🔔 upcoming)
- Quick action buttons
- Smooth scroll with snap points
- Pulse animation on pending meals

### Quick Log Button (Floating Action Button)
```
                    ┌─────────┐
                    │         │
                    │    📸   │
                    │  LOG    │
                    │  MEAL   │
                    │         │
                    └─────────┘
```

**Design Notes:**
- Fixed position, bottom-right
- Large, circular button (60x60px)
- Gradient background
- Subtle shadow and hover effect
- Opens quick-log modal

## 🍽️ Quick Log Modal

```
┌─────────────────────────────────────────────────────────┐
│  Quick Log Meal                              [✕ Close]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Which meal?                                            │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │Breakfast │  Lunch   │  Dinner  │  Snack   │         │
│  │  8:00AM  │ 12:30PM  │  6:00PM  │  9:00PM  │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         📸 Take Photo                           │   │
│  │                                                 │   │
│  │         or                                      │   │
│  │                                                 │   │
│  │         📁 Choose from Gallery                  │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  🔍 Search Food Database                                │
│  ┌─────────────────────────────────────────────────┐   │
│  │ chicken kibble                              🔍  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Recent Foods:                                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📦 Royal Canin Adult Dry Food                   │   │
│  │    360 kcal/100g • P:26g F:14g C:38g            │   │
│  │    [Select]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 📦 Hill's Science Diet Adult                    │   │
│  │    370 kcal/100g • P:24g F:15g C:40g            │   │
│  │    [Select]                                      │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  [Manual Entry →]                                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🧮 Portion Calculator

```
┌─────────────────────────────────────────────────────────┐
│  Smart Portion Calculator                    [✕ Close]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Selected Food:                                         │
│  📦 Royal Canin Adult Dry Food                          │
│  360 kcal/100g                                          │
│                                                         │
│  Target Calories for this meal:                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ 300                                         kcal│   │
│  └─────────────────────────────────────────────────┘   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━   │
│  50        150        250        350        450         │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │                                                 │   │
│  │         📊 Recommended Portion                  │   │
│  │                                                 │   │
│  │              83 grams                           │   │
│  │                                                 │   │
│  │         (About 1/3 cup)                         │   │
│  │                                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  Nutritional Breakdown:                                 │
│  ┌──────────────────────────────────────────────┐      │
│  │ Protein:  22g  ████████░░░░░░░░░░░░░░░░  40% │      │
│  │ Fat:      12g  ████████░░░░░░░░░░░░░░░░  22% │      │
│  │ Carbs:    32g  ████████████████░░░░░░░░  58% │      │
│  └──────────────────────────────────────────────┘      │
│                                                         │
│  [✓ Use This Portion]  [Adjust Manually]               │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 📊 Charts & Visualizations

### 1. Circular Progress (Calories)
```
        ┌─────────────┐
        │             │
        │    ╱───╲    │
        │   │ 71% │   │
        │    ╲───╱    │
        │             │
        │  850/1200   │
        │   Calories  │
        │             │
        └─────────────┘
```
- SVG-based circular progress
- Animated fill on load
- Color changes based on percentage
- Center shows current/target

### 2. Macro Donut Chart
```
        ┌─────────────┐
        │             │
        │     ╱─╲     │
        │    │   │    │
        │     ╲─╱     │
        │             │
        │  P: 40%     │
        │  F: 22%     │
        │  C: 38%     │
        │             │
        └─────────────┘
```
- Animated donut chart
- Color-coded segments
- Legend below
- Tap segment to highlight

### 3. 7-Day Trend Line Chart
```
┌─────────────────────────────────────────────────────────┐
│  Calorie Trend (Last 7 Days)                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1400│                                                  │
│      │                                                  │
│  1200│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ Target         │
│      │        ●───●                                     │
│  1000│    ●───        ───●───●                          │
│      │ ●──                    ───●                      │
│   800│                                                  │
│      │                                                  │
│   600│                                                  │
│      └──────────────────────────────────────────────    │
│       Mon Tue Wed Thu Fri Sat Sun                      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
- Line chart with smooth curves
- Dotted target line
- Hover to see exact values
- Gradient fill under line

### 4. Weight Progress Chart
```
┌─────────────────────────────────────────────────────────┐
│  Weight Progress (Last 30 Days)                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  13.5│                                                  │
│      │ ●                                                │
│  13.0│   ●                                              │
│      │     ●                                            │
│  12.5│       ●───●───●───●───● ─ ─ ─ ─ Goal: 12.0kg   │
│      │                                                  │
│  12.0│                                                  │
│      │                                                  │
│  11.5│                                                  │
│      └──────────────────────────────────────────────    │
│       Week 1    Week 2    Week 3    Week 4             │
│                                                         │
│  ↓ -1.0kg from start  •  On track to reach goal       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🎮 Gamification Elements

### Achievement Badges
```
┌──────────┬──────────┬──────────┬──────────┐
│          │          │          │          │
│   🔥     │   💧     │   ⭐     │   🏆     │
│  7-Day   │  Hydro   │ Perfect  │  Goal    │
│  Streak  │  Hero    │  Week    │ Crusher  │
│          │          │          │          │
│ Unlocked │ Unlocked │  Locked  │  Locked  │
│          │          │          │          │
└──────────┴──────────┴──────────┴──────────┘
```

### Progress to Next Badge
```
┌─────────────────────────────────────────────────────────┐
│  Next Achievement: Perfect Week ⭐                      │
│                                                         │
│  ████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  5/7  │
│                                                         │
│  2 more days of meeting all goals!                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

## 🔔 Notifications & Reminders

### In-App Notification
```
┌─────────────────────────────────────────────────────────┐
│  🔔 Meal Reminder                                       │
│                                                         │
│  Time for Dinner! (6:00 PM)                            │
│  Target: 450 kcal                                       │
│                                                         │
│  [Log Now]  [Snooze 15min]  [Dismiss]                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Push Notification
```
┌─────────────────────────────────────────────────────────┐
│  🐕 Elif - Pet Nutrition                                │
│                                                         │
│  Max's dinner time! 🍽️                                  │
│  Tap to log meal                                        │
│                                                         │
│  6:00 PM                                                │
└─────────────────────────────────────────────────────────┘
```

## 📱 Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {  /* sm */
  /* 2-column grid for stats */
}

@media (min-width: 768px) {  /* md */
  /* 3-column grid, side-by-side forms */
}

@media (min-width: 1024px) { /* lg */
  /* 4-column grid, dashboard layout */
}

@media (min-width: 1280px) { /* xl */
  /* Full desktop experience */
}
```

## 🎭 Animation Guidelines

### Micro-interactions
- **Button Press**: Scale down to 0.95, bounce back
- **Card Hover**: Lift with shadow (translateY: -4px)
- **Progress Fill**: Ease-out, 800ms duration
- **Number Count-up**: Ease-out-cubic, 1000ms
- **Modal Open**: Fade + slide up, 300ms
- **Success**: Confetti burst, 1500ms

### Loading States
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              ⚪⚪⚪                                       │
│           Loading...                                    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```
- Pulsing dots
- Skeleton screens for content
- Shimmer effect on cards

## 🎨 Component Library Recommendations

### For Angular:
1. **Angular Material** - Comprehensive UI components
2. **PrimeNG** - Rich data visualization
3. **Chart.js** or **ng2-charts** - Charts
4. **ngx-image-cropper** - Photo upload
5. **Tailwind CSS** - Utility-first styling

### Icons:
- **Font Awesome** (already in use)
- **Heroicons** for modern look
- **Lucide** for clean icons

---

**Implementation Tips:**
1. Start with mobile layout first
2. Use CSS Grid for responsive layouts
3. Implement dark mode support
4. Add loading skeletons
5. Test on real devices
6. Optimize images (WebP format)
7. Use lazy loading for charts
8. Add haptic feedback on mobile
9. Implement offline support
10. A/B test different layouts

**Accessibility Checklist:**
- ✅ Keyboard navigation
- ✅ Screen reader support
- ✅ High contrast mode
- ✅ Focus indicators
- ✅ ARIA labels
- ✅ Color blind friendly
- ✅ Touch target size (44x44px min)
- ✅ Text scaling support
