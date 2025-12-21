# Readify

A full-stack book recommendation app with a Node/Express + MongoDB API and an Expo/React Native mobile client. Users can sign up, log in, post book recommendations with covers and ratings, browse the community feed, and manage their own posts.

## Features
- **Mobile (Expo/React Native)**: Email/password auth, onboarding, home feed with infinite scroll + pull-to-refresh, add recommendation with image picker + rating, profile with delete, persistent auth via AsyncStorage, global state with Zustand.
- **Backend (Express/MongoDB)**: JWT auth, CRUD for books with ownership checks, Cloudinary image uploads, Swagger docs at `/api-docs`, cron keep-alive pings for hosted deployments.
- **DX**: Typed navigation via Expo Router, theming/stylesheets, linting, and hot reload for both client and server.

## Tech Stack
- **Mobile**: Expo Router, React Native 0.81, Expo SDK 54, AsyncStorage, React Navigation, Zustand.
- **Backend**: Node 20+, Express 5, Mongoose, JWT, Cloudinary, Swagger, Cron.
- **Infrastructure**: MongoDB Atlas/local, Cloudinary for media.

## Project Structure
```
backend/        # Express API (auth + books, Swagger)
mobile/         # Expo app (screens, store, assets)
```

## Prerequisites
- Node.js 20+ and npm
- MongoDB URI (local or Atlas)
- Cloudinary account (for image hosting)
- Expo CLI (`npm i -g expo-cli`) and platform tooling (Android Studio and/or Xcode for device simulators)

## Backend Setup (`backend/`)
1) Install deps
```bash
npm install
```
2) Create `.env`
```bash
PORT=3000
MONGO_URI=your_mongodb_uri
JWT_SECRET=super_secret_value
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
# Used by the cron keep-alive job (point to your deployed API URL)
API_URL=https://your-api-host.com
```
3) Run the API
```bash
npm run dev
```
- API: http://localhost:3000
- Docs: http://localhost:3000/api-docs

## Mobile Setup (`mobile/`)
1) Install deps
```bash
npm install
```
2) Add Expo env (creates `mobile/.env` or use your shell env)
```bash
EXPO_PUBLIC_API_URL=http://localhost:3000
```
3) Start the app
```bash
npm run start           # choose iOS/Android/Web
npm run ios             # run on iOS simulator
npm run android         # run on Android emulator
```
4) Log in / Sign up from the app. The client reads `EXPO_PUBLIC_API_URL` to call the backend.

## Key Flows
- **Auth**: `/api/auth/register`, `/api/auth/login` return JWT + user profile; tokens are stored in AsyncStorage.
- **Books**: `/api/books` (POST create, GET paginated feed), `/api/books/user` (GET current user’s books), `/api/books/:id` (DELETE owned book). All book routes require Bearer tokens.
- **Media**: Images are uploaded to Cloudinary; payloads accept base64 data URLs from the app image picker.

## Testing the API quickly
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"demo","email":"demo@example.com","password":"password123"}'
```
Then use the returned `token` as `Authorization: Bearer <token>` on book routes.

## Development Tips
- If the Expo app cannot reach the API on device/emulator, replace `localhost` with your LAN IP in `EXPO_PUBLIC_API_URL`.
- The cron job runs every 14 minutes to ping `API_URL`; set it only when deploying to a host that sleeps on inactivity.
- Swagger docs mirror the route annotations in `backend/src/routes/*.js` and are useful for contract testing.

## License
ISC
