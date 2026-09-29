# 🍳 QuickBite — SRMIST College Cafeteria Breakfast Pre-Booking System

QuickBite is a full-stack web application custom-tailored for **SRM Institute of Science and Technology (SRMIST)**. It enables students to pre-book breakfast daily, select their preferred campus pick-up counter, earn **Campus Coins** upon counter collection, redeem coins for cafeteria rewards, and toggle between **Light and Dark mode**.

---

## 🌟 Key Updates & SRM Customizations

### 1. Updated Menu Pricing & SRM Specials
- **Pure Veg**: *SRM Special: Ghee Podi Masala Dosa Platter* — **₹65**
- **Non-Veg**: *SRM Cafeteria Signature: Chicken Keema Paratha & Boiled Egg* — **₹85**

### 2. Designated SRM Campus Pick-up Points
Students can choose exactly where they want to pick up their morning breakfast box:
- 📍 **Cafeteria TP1** (Tech Park 1 • Ground Floor)
- 📍 **Food joint UB building** (University Building • Courtyard)
- 📍 **Cafeteria Main block** (Main Administrative Block • Level 1)

*The selected pick-up location is displayed on the student's boarding-pass QR code and on the Cafeteria Admin verification screen.*

### 3. SRM College Email Authentication (`@srmist.edu.in`)
- Student registration strictly verifies and accepts official SRM emails ending with **`@srmist.edu.in`**.
- New students receive **10 Welcome Bonus Campus Coins** immediately upon signup.

### 4. Interactive Dark Mode Switch
- Users can switch between **Light Mode** and **Dark Mode** via the Sun/Moon toggle in the navigation bar or profile screen.
- Preference is automatically persisted in `localStorage`.

---

## 🔐 Default Demo Accounts

| Role | SRM Email / Register No | Password | Notes |
|---|---|---|---|
| **Student** | `bharath@srmist.edu.in` (or `RA2111003010001`) | `student123` | Pre-loaded with **35 Campus Coins** & verified booking history |
| **Admin** | `admin@srmist.edu.in` | `admin123` | Full cafeteria management, counter scanner & menu editor |

*(You can also use the One-Click Demo buttons on the Sign In page or register any new SRM student account with an `@srmist.edu.in` email!)*

---

## 🚀 How to Run Locally

Both servers are currently running live:
- **Frontend Web & Mobile App**: [http://localhost:3000](http://localhost:3000)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **Healthcheck**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
