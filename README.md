# Elif 🐾

Elif is a comprehensive, modern pet care and veterinary management application. It provides a seamless experience containing both a **Front-Office** for pet owners (to manage their pets, view services, and fetch medical records) and a **Back-Office / Vet Portal** for administrative staff and veterinarians.

## 🌟 Features

- **User Portal (Front-Office)**
  - Beautiful, animated Landing, Login, and Sign Up pages.
  - "My Pets" dashboard for pet owners.
  - Medical Records tracking and summaries.
  - Veterinary service listings.
- **Admin / Vet Portal (Back-Office)**
  - Secure veterinary dashboard for internal staff.
  - Overview data tracking and metrics for clinic management.

- **Modern UI/UX Details**
  - Fully responsive design heavily styled with **Tailwind CSS**.
  - Glassmorphism overlays, custom keyframe animations, and soft brand coloring.
  - Integrated natively with **FontAwesome** (+v6) for a comprehensive icon set.

## 🛠️ Tech Stack

- **Workspace:** Monorepo architecture
- **Frontend:** Angular 17+, TypeScript, Tailwind CSS, HTML5
- **Backend:** _Pending implementation (reserved in the `/backend` directory)_

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
├── backend/            # Backend API / Server directory (WIP)
├── frontend/           # Angular frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/           # Login & Registration routing & pages
│   │   │   ├── front-office/   # Pet owner-facing interface & components
│   │   │   ├── back-office/    # Vet & Admin interface & components
│   │   │   └── shared/         # Reusable global layout items (Navbar, Sidebar)
│   │   └── public/images/      # App assets, brand logos, and animated animal art
│   ├── tailwind.config.js      # Global UI theme, colors, and animation overrides
│   └── package.json            # Frontend dependency manager
├── .gitignore          # Root repository ignore rules
└── README.md
```

## 🎨 Theme & Brand Config

Elif maps to a custom, friendly brand palette defined in Tailwind:

- **Teal**: `bg-brand-teal` (`#3A9282`)
- **Orange**: `bg-brand-orange` (`#F89A3F`)
- **Yellow**: `bg-brand-yellow` (`#FBD18B`)
- **Peach**: `bg-brand-peach` (`#FEE8CD`)
