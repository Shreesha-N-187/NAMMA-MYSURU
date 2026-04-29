# 🏛️ Namma Mysuru
### *Discover the Real Mysuru*

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%7C%20Firestore%20%7C%20Storage-orange?logo=firebase)
![Tailwind](https://img.shields.io/badge/TailwindCSS-3.0-38bdf8?logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?logo=vercel)

**Team:** Think Crafters (Batch 5)
**College:** Vidyavardhaka College of Engineering (VVCE), Mysuru
**Department:** Computer Science & Engineering
**Event:** Design Thinking And Tinkering Lab Project

🌐 **Live Demo:** [namma-mysuru.vercel.app](https://namma-mysuru.vercel.app)
📁 **GitHub:** [github.com/Shreesha-N-187/NAMMA-MYSURU](https://github.com/Shreesha-N-187/NAMMA-MYSURU)

---

## 1. Problem Statement

Mysuru attracts over **3 million visitors annually**, yet tourism is heavily
concentrated around just 3–4 mainstream spots — Mysuru Palace, Chamundi Hills,
and Brindavan Gardens. During peak seasons like Dasara, these sites face
severe overcrowding while local artisans (sandalwood carvers, silk weavers,
inlay craftsmen) and hidden cultural gems remain **virtually invisible and
economically underserved**.

> 35% of domestic tourists actively seek authentic cultural experiences
> but cannot find them. — Ministry of Tourism Report

---

## 2. Our Solution

**Namma Mysuru** is a role-based web application that connects three types of users:

| Role | What They Get |
|------|--------------|
| 🧳 **Tourist** | Discover verified hidden gems with GPS maps, reviews & wishlist |
| 🛍️ **Customer** | Shop authentic Mysuru crafts directly from artisans |
| 🎨 **Local Artisan** | Get a digital profile, list products & reach customers |

---

## 3. Real Verified Hidden Gems

Our team **personally visited** all 5 locations and interviewed the owners:

| # | Place | Category | Location | GPS |
|---|-------|----------|----------|-----|
| 1 | **Hasiru Mane** | Homestay | Gokulam 3rd Stage | 12.337047, 76.624924 |
| 2 | **Loco Artisans Chocolates** | Food | Gokulam 3rd Stage | 12.337153, 76.627698 |
| 3 | **Jin Min Cat World** | Experience | Chamarajapuram | 12.292958, 76.659584 |
| 4 | **Uchiha Cafe** | Food | Kuvempu Nagar | 12.291892, 76.628016 |
| 5 | **Mr. Co-Cane** | Food | Gokulam | 12.3375, 76.626 |

---

## 4. Features

### 🧳 Tourist
- Browse 5 team-verified hidden gems with real photos
- Search and filter by category (Food / Homestay / Experience)
- GPS-accurate Google Maps embed for every spot
- Add spots to personal wishlist
- Read and submit reviews with star ratings

### 🛍️ Customer
- Browse authentic Mysuru craft products from local artisans
- Filter by category (Silk, Sandalwood, Inlay Art, Food Products, etc.)
- **Buy Now** via Razorpay (UPI, Cards, Net Banking — test mode)
- **WhatsApp Artisan** button for direct contact

### 🎨 Local Artisan
- Role-based signup and login via Firebase Auth
- Create and edit profile (craft type, bio, location, contact)
- Upload product listings with images (Firebase Storage)
- View dashboard stats (products listed, profile views)
- Shareable public profile link

---

## 5. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS 3 |
| Routing | React Router v6 |
| Authentication | Firebase Auth (Email/Password) |
| Database | Firebase Firestore |
| File Storage | Firebase Storage |
| Payments | Razorpay (Test Mode — Cards, Net Banking) |
| Maps | Google Maps Embed API |
| Deployment | Vercel |
| Version Control | GitHub |

---

## 6. Project Structure

```
namma-mysuru/
├── public/
│   └── images/              # Real photos from field visits
├── src/
│   ├── data/
│   │   └── spots.js         # Verified hidden gem data with GPS
│   ├── pages/
│   │   ├── RoleSelect.jsx   # Entry screen — Tourist / Customer / Artisan
│   │   ├── Auth.jsx         # Login + Signup (role-aware)
│   │   ├── TouristHome.jsx  # Browse hidden gems
│   │   ├── SpotDetail.jsx   # Spot detail + Maps + Reviews
│   │   ├── CustomerHome.jsx # Browse & buy artisan products
│   │   └── ArtisanDashboard.jsx
│   ├── utils/
│   │   └── razorpay.js      # Payment integration
│   └── firebase.js          # Firebase config
├── .env                     # API keys (not pushed to GitHub)
└── README.md

```

---

## 7. Firestore Database Structure

```
users/    { name, email, role, craftType, location, bio, whatsapp, createdAt }
products/ { name, category, price, imageUrl, artisanId, artisanName, createdAt }
reviews/  { spotId, userId, userName, rating, comment, createdAt }

```

---

## 8. How to Run Locally

```bash
# Clone the repository
git clone https://github.com/Shreesha-N-187/NAMMA-MYSURU.git
cd NAMMA-MYSURU

# Install dependencies
npm install

# Create .env file (see .env.example for reference)
cp .env.example .env
# Fill in your Firebase and Google Maps keys

# Start development server
npm run dev
```

---

## 9. Firebase Setup

1. Go to [firebase.google.com](https://firebase.google.com) → Create project
2. Enable **Authentication → Email/Password**
3. Create **Firestore Database** in test mode
4. Enable **Firebase Storage**
5. Go to Project Settings → Web App → copy config keys into `.env`

---

## 10. SDG Alignment

| Goal | How We Address It |
|------|-------------------|
| **Goal 8** — Decent Work & Economic Growth | Gives artisans a digital platform to reach customers directly |
| **Goal 9** — Industry, Innovation & Infrastructure | Tech-driven solution to a real local problem |
| **Goal 11** — Sustainable Cities & Communities | Decentralizes tourism away from overcrowded heritage sites |
| **Goal 12** — Responsible Consumption & Production | Promotes authentic, locally-made products over mass-produced goods |

---

## 11. Team Members

1. Shreesha N Gowda
2. Shishir Gowda S
3. Shishira H V
4. Sharanya N
5. Shravanth Kumar M


---

## 12. Acknowledgements

- Problem statement sourced from **Inpulse Website**
- Field research conducted across Gokulam, Chamarajapuram & Kuvempu Nagar, Mysuru
- Special thanks to Mr. Benjamin, Mr. Rakesh, Mr. Sharath BS, Mr. Jayanth,
  and the Mr. Co-Cane team for welcoming us and sharing their stories