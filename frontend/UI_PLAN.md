# Elif (أليف) - Petcare Platform UI/UX Blueprint

## 🎨 Design Philosophy

**Aesthetic:** Creative & Colorful
**Keywords:** Intuitive, Modern, Pet-friendly, Welcoming, Professional (for back-office)
**Core Concept:** A vibrant and friendly interface for pet owners (Front-Office) balanced with a clean, highly functional data-rich interface for clinic staff and vets (Back-Office).

---

## 👥 User Roles & Portals

### 1. Front-Office (Customer Portal)

**Target Audience:** Pet Owners
**Vibe:** Warm, playful, reassuring, and highly intuitive.

**Core Pages:**

- **Landing/Home:** Welcoming page with clear call-to-actions (Find a Vet, Join Elif).
- **Dashboard:** "My Pets" overview, upcoming appointments, health reminders, and quick booking.
- **Pet Profiles:** Detailed view for each pet (photos, breed, age, weight).
- **Medical Records:** Accessible history of vaccinations, prescriptions, and vet notes.
- **Service Browser & Booking:** Map or list of available clinics/shelters with easy appointment scheduling.
- **Messages:** Chat interface to communicate with clinics.

### 2. Back-Office (Admin/Staff Portal)

**Target Audience:** Veterinarians, Clinic Managers, Shelter Admins
**Vibe:** Clean, data-oriented, efficient, and structured (Tailwind dashboards).

**Core Pages:**

- **Staff Dashboard:** Daily schedule, pending appointments, high-level metrics (patients seen, revenue).
- **Appointment Management:** Calendar and list views to manage, approve, or reschedule visits.
- **Patient/Pet Database:** Searchable list of all registered pets and their associated owners.
- **Clinical Records:** Interface to add medical notes, upload test results, and prescribe medications.
- **Clinic/Shelter Management:** Profile settings for the clinic (working hours, services offered, pricing).
- **Billing & Payments:** Invoice generation, payment tracking, and financial reports.

---

## 🛠 Tech Stack & Architecture

- **Framework:** Angular 18
- **Styling:** Tailwind CSS (utility-first, perfect for building custom, non-cookie-cutter designs)
- **Component Strategy:**
  - `SharedModule`: Buttons, cards, modals, form inputs used across both portals.
  - `FrontOfficeModule`: Lazy-loaded module containing all pet owner views.
  - `BackOfficeModule`: Lazy-loaded module containing all staff/admin views.

---

## 📦 Next Steps for Implementation

1. **Initialize Tailwind CSS:** Set up Tailwind in the Angular workspace to enable rapid UI styling.
2. **Define the Theme:** Configure `tailwind.config.js` with Elif's brand colors (e.g., warm oranges, calming blues, vibrant greens).
3. **Scaffold Routing:** Create the base routes for `/app` (Front-Office) and `/admin` (Back-Office).
4. **Build Shared Components:** Start with the basics (Navbar, Sidebar, Buttons, Cards).
5. **Develop Dashboards:** Create the skeleton layouts for the Pet Owner Dashboard and the Clinic Manager Dashboard.
