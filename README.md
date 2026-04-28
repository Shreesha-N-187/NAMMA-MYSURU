# Namma Mysuru

**Tagline:** *Discover the Real Mysuru*

**Team:** Think Crafters (Batch 5)  
**College:** Vidyavardhaka College of Engineering, Mysuru  
**Event:** Inunity (Design Thinking and Tinkering Lab)

---

## 1. Problem Statement

Mysuru's tourism is heavily concentrated around 3-4 major spots (Palace, Chamundi Hills, Brindavan Gardens). During peak seasons like Dasara, 3 million+ annual visitors overcrowd these sites while local artisans (sandalwood carvers, silk weavers, inlay craftsmen) and hidden gems remain virtually invisible. 35% of tourists actively want authentic cultural experiences but can't find them.

---

## 2. Our Solution

A role-based web app with 3 user types:

- **Tourist:** Discover 5 team-verified hidden gems with GPS-accurate Google Maps, reviews, and wishlist
- **Customer:** Shop authentic Mysuru crafts directly from artisans
- **Artisan:** Register, list products, and get a shareable public profile

---

## 3. Real Verified Locations

These are real hidden gems verified by our team:

1. **Hasiru Mane** - Vertical garden homestay, Gokulam  
   GPS: `12.337047, 76.624924`
2. **Loco Artisans Chocolates** - Sugar-free artisan bakery, Gokulam  
   GPS: `12.337153, 76.627698`
3. **Jin Min Cat World** - Cat cafe & gallery, Chamarajapuram  
   GPS: `12.292958, 76.659584`
4. **Uchiha Cafe** - Anime-themed cafe, Kuvempu Nagar  
   GPS: `12.291892, 76.628016`
5. **Mr. Co-Cane** - Natural juice bar, Gokulam  
   GPS: `12.3375, 76.626`

---

## 4. Features

### Tourist

- Explore team-verified hidden gems in Mysuru
- View detailed spot pages with description, tags, and ratings
- Open GPS-based embedded Google Maps for navigation
- Add/remove spots to personal wishlist
- Read and add reviews for each location

### Customer

- Browse authentic Mysuru craft products
- Filter products by category (Silk, Sandalwood, Inlay Art, Food Products, etc.)
- Connect directly with artisans via WhatsApp
- Buy flow ready for payment integration (Razorpay placeholder)
- Track selected products with cart count UI

### Artisan

- Manage profile (name, craft type, location, bio, contact)
- Upload product images to Firebase Storage
- Add and delete product listings
- View dashboard metrics (products listed + placeholders for views and enquiries)
- Copy and share public artisan profile link

---

## 5. Tech Stack

```text
| Layer              | Technology                                 |
|-------------------|---------------------------------------------|
| Frontend          | React, Vite, Tailwind CSS                  |
| Routing           | React Router v6                            |
| Backend Services  | Firebase Auth, Firestore, Firebase Storage |
| Maps              | Google Maps Embed API                      |
| Deployment        | Vercel                                     |
```

---

## 6. How to Run Locally

### Clone and install

```bash
git clone <your-repo-url>
cd namma-mysuru
npm install
```

### Add environment variables

Create a `.env` file in the project root:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

### Start development server

```bash
npm run dev
```

---

## 7. Firebase Setup (Brief)

1. Create a project at [Firebase Console](https://firebase.google.com/)
2. Enable **Authentication > Email/Password**
3. Create **Firestore Database** in test mode
4. Enable **Firebase Storage**
5. Register a Web App and copy config keys into `.env`

---

## 8. Live Demo

**Live Demo:** [Add Vercel link here]

---

## 9. SDG Alignment

- **Goal 8: Decent Work and Economic Growth**  
  Supports local artisans by enabling direct visibility and sales opportunities.

- **Goal 11: Sustainable Cities and Communities**  
  Promotes distributed, culture-driven tourism beyond overcrowded hotspots in Mysuru.
