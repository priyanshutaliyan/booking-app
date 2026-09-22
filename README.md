# Booking App: Multi-Service Booking Platform

A full-stack MERN web application where customers can book local service providers (barber, plumber, electrician, carpenter), providers can manage their bookings, and users can earn App Coins by playing a real-time Tic-Tac-Toe game.

## Features

**Customer**
- Register and login with role-based access
- Browse providers by category with ratings and available time slots
- Book a service by choosing a date and time slot (double booking is prevented)
- View and cancel bookings, and see live booking status
- Pay for completed bookings (cash or online)
- Rate and review a service after payment

**Service Provider**
- Add own services with category, price, date and time slots
- Provider panel to Accept, Start, Complete or Reject bookings
- See customer name, phone and address for each booking

**Game and Rewards**
- Real-time two-player Tic-Tac-Toe using Socket.io matchmaking
- App Coins: win +20, draw +10, loss +5
- Coin balance updates in the navbar right after a game

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS, Axios |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose |
| Real-time | Socket.io |
| Auth | JWT with protected routes |

## Project Structure

```
booking/
  client/            React frontend
    src/
      pages/         Login, Register, Dashboard, Providers, Book,
                     MyBookings, ProviderDashboard, AddService, Game
      components/    Navbar, ProtectedRoute
      context/       AuthContext
      services/      api.js (Axios instance)
  server/            Express backend
    models/          User, Category, ProviderProfile, Booking,
                     Payment, Review, GameSession
    controllers/     Business logic for each module
    routes/          REST API routes
    server.js        Express and Socket.io entry point
```

## API Overview

| Module | Endpoints |
|---|---|
| Auth | `POST /api/auth/register`, `POST /api/auth/login` |
| Categories | `GET /api/categories` |
| Providers | `POST /api/providers`, `GET /api/providers/category/:id`, `GET /api/providers/user/:userId`, `GET /api/providers/:id` |
| Bookings | `POST /api/bookings`, `GET /api/bookings/customer/:id`, `GET /api/bookings/provider/:id`, `PUT /api/bookings/:id/status` |
| Payments | `POST /api/payments`, `PUT /api/payments/:id/pay`, `GET /api/payments/customer/:id` |
| Reviews | `POST /api/reviews`, `GET /api/reviews/provider/:id`, `GET /api/reviews/customer/:id` |
| Games | `GET /api/games/status/:userId`, `GET /api/games/coins/:userId`, `GET /api/games/:sessionId`, `PUT /api/games/:sessionId/move` |

## How to Run Locally

**1. Install dependencies**

```
cd server
npm install
cd ../client
npm install
```

**2. Create a `.env` file inside the `server` folder**

```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

**3. Start the backend**

```
cd server
npm run dev
```

**4. Start the frontend (in a new terminal)**

```
cd client
npm run dev
```

The app runs at `http://localhost:5173` and the API at `http://localhost:5000`.

## Testing the Game

Open two browser windows (one normal and one incognito), log in with two different accounts, open the Game page in both and click Find Match.

## Author

Priyanshu Taliyan
