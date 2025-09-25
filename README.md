
---

# 🍿 Popcornly

**Popcornly** is a fully-featured movie and TV series app built with **React Native (Expo)** and **Firebase**. It allows users to discover, search, and save their favorite movies and TV shows using **TMDB API**, with authentication powered by **Firebase Email/Password** and **Google OAuth**.

---

## 🎯 Features

* 🔹 Browse latest movies and TV series
* 🔹 Search for movies and TV series
* 🔹 Trending content based on user searches
* 🔹 Save favorite movies and TV shows
* 🔹 User authentication: Email/Password & Google OAuth
* 🔹 Real-time updates with **Firebase Firestore**
* 🔹 Smooth, responsive UI using **NativeWind CSS**

---

## 🛠️ Tech Stack

* **Frontend:** React Native with Expo
* **Styling:** NativeWind CSS
* **Backend:** Firebase (Authentication, Firestore, Realtime Database)
* **API:** TMDB API (The Movie Database)
* **Authentication:** Firebase Email/Password & Google OAuth

---

## 📸 Screenshots

*Home Screen*
![Home Screen](./screenshots/home.png)

*Movies Screen*
![Movies Screen](./screenshots/movies.png)

*TV Series Screen*
![TV Series Screen](./screenshots/tvseries.png)

*Favorites / Saved*
![Saved Screen](./screenshots/saved.png)

*Profile Screen*
![Profile Screen](./screenshots/profile.png)

*Search & Trending*
![Search Screen](./screenshots/search.png)

---

## 🚀 Getting Started

### Prerequisites

* Node.js >= 18.x
* Expo CLI (`npm install -g expo-cli`)
* Firebase account & project

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/popcornly.git
cd popcornly
```

2. Install dependencies:

```bash
npm install
```

3. Configure Firebase:

* Create a Firebase project and enable **Authentication** and **Firestore**
* Copy your Firebase config from the Firebase console and replace the `.env` values or `firebaseConfig.ts` in the project.

4. Set up environment variables:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
EXPO_PUBLIC_TMDB_API_KEY=your_tmdb_api_key
```

5. Run the app:

```bash
expo start
```

---

## 🔑 Authentication

* Sign up / Sign in with **Email & Password**
* Sign in with **Google OAuth**
* Persistent login with Firebase and AsyncStorage

---

## ⚡ Notes

* TMDB API is used for fetching movies and TV series data.
* Saved/favorite items are stored in Firebase Firestore under the authenticated user.
* Trending logic is based on search activity.

---

