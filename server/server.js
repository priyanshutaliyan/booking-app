require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const express = require('express');
const connectDB = require('./config/db.js');
const GameSession = require('./models/GameSession.js');
const authRoutes = require('./routes/authRoutes.js');
const categoryRoutes = require('./routes/categoryRoutes.js');
const providerRoutes = require('./routes/providerRoutes.js');
const bookingRoutes = require('./routes/bookingRoutes.js');
const reviewRoutes = require('./routes/reviewRoutes.js');
const gameRoutes = require('./routes/gameRoutes.js');
const paymentRoutes = require('./routes/paymentRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');

const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

connectDB();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

let waitingQueue = [];

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinQueue', async ({ userId, bookingId }) => {
    socket.userId = userId;

    waitingQueue = waitingQueue.filter((p) => p.userId !== userId);

    if (waitingQueue.length > 0) {
      const opponent = waitingQueue.shift();

      const session = await GameSession.create({
        player1Id: opponent.userId,
        player2Id: userId,
        bookingId1: opponent.bookingId,
        bookingId2: bookingId,
        currentTurn: opponent.userId,
        status: 'in-progress',
      });

      io.to(opponent.socketId).emit('matchFound', { sessionId: session._id, symbol: 'X' });
      socket.emit('matchFound', { sessionId: session._id, symbol: 'O' });
    } else {
      waitingQueue.push({ userId, bookingId, socketId: socket.id });
      socket.emit('waitingForOpponent');
    }
  });

  socket.on('joinSession', (sessionId) => {
    socket.join(sessionId);
  });

  socket.on('moveMade', (sessionId) => {
    io.to(sessionId).emit('opponentMoved');
  });

  socket.on('disconnect', () => {
    waitingQueue = waitingQueue.filter((p) => p.socketId !== socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };