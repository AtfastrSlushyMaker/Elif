# Elif 🐾

Elif (أليف) is a comprehensive, modern pet care and veterinary management application. It provides a seamless experience containing both a **Front-Office** for pet owners (to manage their pets, view services, and fetch medical records) and a **Back-Office / Vet Portal** for administrative staff and veterinarians.

## 🌟 Features

- **User Portal (Front-Office)**
  - Beautiful, animated Landing, Login, and Sign Up pages.
  - "My Pets" dashboard for pet owners with upcoming appointments and health reminders.
  - Detailed Pet Profiles (photos, breed, age, weight).
  - Medical Records tracking and summaries (vaccinations, prescriptions, vet notes).
  - Veterinary service listings and appointment booking.
  - Messages — in-app chat interface with clinics.
- **Admin / Vet Portal (Back-Office)**
  - Secure veterinary dashboard with daily schedule and high-level clinic metrics.
  - Appointment Management — calendar and list views to manage, approve, or reschedule visits.
  - Patient / Pet Database — searchable registry of all pets and their owners.
  - Clinical Records — add medical notes, upload test results, and prescribe medications.
  - Clinic / Shelter Management — profile settings, working hours, services, and pricing.
  - Billing & Payments — invoice generation, payment tracking, and financial reports.
- **Modern UI/UX Details**
  - Fully responsive design heavily styled with **Tailwind CSS**.
  - Glassmorphism overlays, custom keyframe animations, and soft brand coloring.
  - Integrated natively with **FontAwesome** (v6+) for a comprehensive icon set.

## 🛠️ Tech Stack

- **Workspace:** Monorepo architecture
- **Frontend:** Angular 18, TypeScript, Tailwind CSS, HTML5
- **Backend:** _Pending implementation_

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (latest LTS version recommended)
- [Angular CLI](https://angular.io/cli) installed globally (`npm install -g @angular/cli`)

### Frontend Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/AtfastrSlushyMaker/Elif.git
   cd Elif
   ```

2. **Navigate to the frontend directory:**

   ```bash
   cd frontend
   ```

3. **Install dependencies:**

   ```bash
   npm install
   ```

4. **Run the development server:**

   ```bash
   npm start
   ```

   _(or using the Angular CLI directly: `ng serve`)_

5. **View the app:**
   Open your browser and navigate to [http://localhost:4200/](http://localhost:4200/). The application will automatically reload if you change any of the source files.

## 📂 Project Structure

```text
Elif/
├── frontend/                   # Angular 18 frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/                   # Login & Registration routing & pages
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── front-office/           # Pet owner-facing interface & components
│   │   │   │   ├── landing/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── pet-profiles/
│   │   │   │   ├── medical-records/
│   │   │   │   ├── services/
│   │   │   │   └── messages/
│   │   │   ├── back-office/            # Vet & Admin interface & components
│   │   │   │   ├── dashboard/
│   │   │   │   ├── appointment-management/
│   │   │   │   ├── patient-database/
│   │   │   │   ├── clinical-records/
│   │   │   │   ├── clinic-management/
│   │   │   │   └── billing/
│   │   │   └── shared/                 # Reusable components (Navbar, Sidebar, Button, Card)
│   │   └── public/                     # App assets, brand logos, and animated animal art
│   ├── tailwind.config.js              # Global UI theme, colors, and animation overrides
│   └── package.json                    # Frontend dependency manager
├── .gitignore                  # Root repository ignore rules
└── README.md
```

## 🎨 Theme & Brand Config

Elif maps to a custom, friendly brand palette defined in Tailwind:

- **Teal**: `bg-brand-teal` (`#3A9282`)
- **Orange**: `bg-brand-orange` (`#F89A3F`)
- **Yellow**: `bg-brand-yellow` (`#FBD18B`)
- **Peach**: `bg-brand-peach` (`#FEE8CD`)
- **Red**: `bg-brand-red` (`#D64956`)
