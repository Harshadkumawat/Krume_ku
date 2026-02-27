# 👕 Krumeku - Premium Streetwear E-commerce 

Welcome to the official frontend repository for **Krumeku** — an exclusive brand for premium quality oversized and embroidered T-shirts. This platform is built for high performance, seamless user experience, and optimized social sharing.

## 🚀 Tech Stack

* **Frontend Framework:** React.js (via Vite)
* **Styling:** Tailwind CSS
* **State Management:** Redux Toolkit
* **Routing:** React Router DOM
* **SEO & Meta Tags:** React Helmet Async
* **Deployment & Serverless:** Vercel

## ✨ Key Features & Integrations

* **Dynamic Open Graph (OG) Previews:** Custom serverless function (`api/og.js`) paired with Vercel rewrites to serve HD link previews (images/titles) on WhatsApp, Facebook, and Instagram.
* **URL Masking:** Seamless URL switching between `/item/:id` and `/product/:id` to ensure users and bots always get the optimal sharing link without page reloads.
* **User Tracking & Analytics:** Integrated **Google Analytics 4 (GA4)** for real-time traffic monitoring.
* **Session Recording & Heatmaps:** Integrated **Microsoft Clarity** to record user behavior, drop-offs, and interaction hotspots.
* **Fully Responsive:** Optimized for both desktop and mobile users, featuring custom mobile-share Web APIs.

## 📁 Important Files & Architecture

* `/api/og.js` - Vercel Serverless function for generating dynamic meta tags for social media bots.
* `vercel.json` - Custom routing logic to separate human traffic (React App) from bot traffic (Meta scraper).
* `index.html` - Contains global scripts for Google Analytics and Microsoft Clarity.
* `/src/components/SEO.jsx` - Reusable component for injecting dynamic canonical links and standard meta tags.

## 🛠️ Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone <YOUR_PRIVATE_REPO_URL>
Install dependencies:

Bash
npm install
Environment Variables:
Create a .env file in the root directory. (Note: Never commit the actual .env file)

Code snippet
VITE_API_BASE_URL=your_backend_api_url_here
Run the development server:

Bash
npm run dev
🌐 Deployment
This project is configured for seamless deployment on Vercel.
Any push to the main branch will automatically trigger a production build. Ensure all environment variables are correctly set in the Vercel Dashboard before deploying.

© 2026 Krumeku. All Rights Reserved. Note: This is a private proprietary repository. Unauthorized copying, distribution, or modification is strictly prohibited.
