# WDS Stock Market Simulation - Frontend

This is the standalone frontend client for the **Wolf of Dalal Street (WDS)** live trading simulation platform.

---

## 🚀 Setup & Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```
   *(The production bundle will be generated in the `dist/` directory).*

---

## ⚙️ Environment Variables

The `.env` file contains the Firebase connection and configuration:

```env
VITE_FIREBASE_API_KEY="..."
VITE_FIREBASE_AUTH_DOMAIN="..."
VITE_FIREBASE_PROJECT_ID="..."
VITE_FIREBASE_STORAGE_BUCKET="..."
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
VITE_FIREBASE_DATABASE_URL="https://wds12-a506f-default-rtdb.asia-southeast1.firebasedatabase.app"
```

---

## 🌐 Deploying

### Option A: Vercel
1. Import the `frontend` folder into Vercel.
2. Framework Preset: **Vite**
3. Build Command: `npm run build`
4. Output Directory: `dist`

### Option B: Netlify
1. Publish directory: `dist`
2. Build command: `npm run build`

### Option C: Firebase Hosting
1. Run `npm run build`
2. Deploy the `dist/` folder using `firebase deploy --only hosting`
