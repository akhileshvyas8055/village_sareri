# Brahmano Ki Sareri - Village Web Portal

> **⚠️ ATTENTION AI AGENTS:** This README is specifically designed as your comprehensive knowledge base. Read this entirely before modifying the project.

## 1. Project Overview
This project is a dedicated, dynamic, and mobile-first web portal for **Brahmano Ki Sareri** (a village). It serves as a central hub for village news, administration updates, grievance redressal, polls, local business advertisements, and event registrations (like Khel/Sports tournaments). 

**Primary Goals:**
1. Provide real-time updates and news to villagers.
2. Allow admins to easily manage all content via a robust Admin Panel.
3. Serve as a monetization platform through "Sponsored Ads" from local businesses and election candidates.
4. Deliver a highly premium, glassmorphic, and dynamic UI with smooth animations.

---

## 2. Tech Stack & Architecture
- **Frontend Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Custom CSS (`index.css` for animations/base styles).
- **Routing:** `react-router-dom`
- **Database / Backend:** Firebase Realtime Database (RTDB). Note: It does *not* use Firestore. All data fetching/updating is done directly via RTDB refs.
- **Authentication:** Firebase Auth (used for User Login and Admin Login).
- **Icons:** `react-icons` (Specifically `Fi`, `Fa` families).

---

## 3. Strict Rules & Guidelines for AI Agents

1. **The Village Name (CRITICAL):** 
   - The village name is **"Brahmano Ki Sareri"**. 
   - Browsers often try to auto-translate "Brahmano" (Hindi) to English (e.g., "Body of Brahmans"). 
   - **Rule:** Whenever you write "Brahmano Ki Sareri" in the UI, wrap it in a `notranslate` tag to prevent Google Translate from ruining it:
     ```html
     <span className="notranslate" translate="no">Brahmano Ki Sareri</span>
     ```

2. **Mobile-First Design:**
   - The majority of the users are on mobile phones. Ensure all components use Tailwind's responsive prefixes (e.g., `flex-col md:flex-row`) and look perfect on mobile first.

3. **Data Sizes in Firebase RTDB:**
   - Always assume images or videos are stored as direct URLs. If uploading Base64 images directly to RTDB, they MUST be compressed heavily (under 150KB) to prevent database overload and lag.

4. **Premium Aesthetics (WOW Factor):**
   - Use dynamic animations, glassmorphism (`backdrop-blur`, semi-transparent backgrounds), gradient text, and pulsing effects. Never deliver a plain, generic UI.

5. **WhatsApp Integration:**
   - The platform utilizes direct WhatsApp API links for user interactions (e.g., placing an ad).
   - Phone number used: `918949690598`.
   - Format: `https://wa.me/918949690598?text=Your%20Message%20Here`

---

## 4. Admin Panel Deep Dive (`src/pages/Admin.jsx`)

The Admin Panel is a critical, monolithic dashboard that controls the entire website. It uses a state-based tab switching mechanism (`activeTab`).

**Currently Supported Tabs / Features:**
1. **Manage News (`news`):** Add, edit, delete, and broadcast news/notices/events. Supports image uploads (Base64/URLs).
2. **Panchayat Info (`panchayat`):** Manages information regarding the local Gram Panchayat.
3. **Complaints (`complaints`):** Views grievances submitted by villagers. Allows downloading complaints as an Excel sheet (via `xlsx`).
4. **Khel Registrations (`khel`):** Manages registrations for local sports tournaments. Exportable to Excel.
5. **Registered Users (`users`):** Displays all users authenticated via Firebase Auth.
6. **Push Notifications (`notifications`):** Manages sending custom alerts to users.
7. **Manage Poll (`poll`):** Creates dynamic voting polls (e.g., for elections or village decisions).
8. **Manage Countdown (`countdown`):** Controls the countdown timer shown on the homepage for upcoming big events.
9. **Pride of Sareri (`achievements`):** Manages the showcase of individuals who have brought pride to the village. Managed via `<ManageAchievements />`.
10. **Manage Ads (`ads`):** **(CRITICAL MONETIZATION FEATURE)** Controls the `SponsoredAds.jsx` component on the homepage. Admins can upload photos, video links, titles, descriptions, and toggle active status. Handled by `<ManageAds />`.

**Modifying the Admin Panel:**
If you need to add a new tab to the Admin Panel:
1. Add a button in the **Desktop Sidebar** (`<aside>`).
2. Add a button in the **Mobile Sidebar** (inside `isMobileMenuOpen` overlay).
3. Add the rendering block in the **Main Content Area** (`{activeTab === 'newTab' && <YourComponent />}`).
4. Always isolate complex new admin features into their own components (e.g., `src/components/Admin/ManageAds.jsx`) rather than bloating `Admin.jsx` further.

---

## 5. Key Frontend Sections

- **Hero (`src/sections/Hero.jsx`):** The primary landing section. Must be extremely visually appealing.
- **Sponsored Ads (`src/components/SponsoredAds.jsx`):** The business model of the portal. It fetches live ads from Firebase RTDB `ads` node. It supports an auto-playing slider of images and videos. Includes an "Advertise With Us" button that redirects to WhatsApp.
- **Virtual Tour (`src/components/VirtualTourBanner.jsx`):** Provides a 360-degree Google Maps Street View of the village (Gaon Ghumao).

---

## 6. Development Workflow

1. **Start the server:** `npm run dev` (Usually runs on `localhost:5173` or `5174`).
2. **Environment Variables:** Firebase credentials should be located in `.env` (Vite requires `VITE_` prefix, e.g., `VITE_FIREBASE_API_KEY`).
3. **Patching Large Files:** If a file is too large (like `Admin.jsx`), consider using a Node script (e.g., `patch.cjs`) to regex-replace or inject code rather than replacing the whole file, which can cause token limit issues.

---

**End of Agent Knowledge Base.** You are now ready to assist with the "Brahmano Ki Sareri" project!
