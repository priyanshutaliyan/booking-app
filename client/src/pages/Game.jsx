import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const SOCKET_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/api\/?$/, "");

export default function Game() {
  const { user } = useAuth();
  const socketRef = useRef(null);

  const [phase, setPhase] = useState("idle");
  const [session, setSession] = useState(null);
  const [mySymbol, setMySymbol] = useState(null);
  const [coins, setCoins] = useState(user?.appCoins ?? 0);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      try {
        const coinRes = await api.get(`/games/coins/${user._id}`);
        setCoins(coinRes.data.appCoins);

        const statusRes = await api.get(`/games/status/${user._id}`);
        if (statusRes.data) {
          const s = statusRes.data;
          setSession(s);
          setMySymbol(s.player1Id === user._id || s.player1Id?._id === user._id ? "X" : "O");
          setPhase("playing");
          socketConnect();
          socketRef.current?.emit("joinSession", s._id);
        }
      } catch (err) {}
    };
    init();
  }, []);

  const socketConnect = () => {
    if (socketRef.current) return socketRef.current;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("waitingForOpponent", () => {
      setPhase("waiting");
    });

    socket.on("matchFound", ({ sessionId, symbol }) => {
      setMySymbol(symbol);
      socket.emit("joinSession", sessionId);
      fetchSession(sessionId);
      setPhase("playing");
    });

    socket.on("opponentMoved", () => {
      if (session?._id) fetchSession(session._id);
    });

    return socket;
  };

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, []);

  const fetchSession = async (sessionId) => {
    try {
      const res = await api.get(`/games/${sessionId}`);
      setSession(res.data);
      if (res.data.status === "completed") {
        setPhase("finished");
        const coinRes = await api.get(`/games/coins/${user._id}`);
        setCoins(coinRes.data.appCoins);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't load the game.");
    }
  };

  const startGame = () => {
    setError("");
    const socket = socketConnect();
    socket.emit("joinQueue", { userId: user._id, bookingId: null });
    setPhase("waiting");
  };

  const handleCellClick = async (position) => {
    if (!session || session.status === "completed") return;
    const turnId = session.currentTurn?._id || session.currentTurn;
    if (turnId !== user._id) return;
    if (session.boardState[position]) return;

    try {
      const res = await api.put(`/games/${session._id}/move`, {
        position: position,
        userId: user._id,
      });
      setSession(res.data);
      socketRef.current?.emit("moveMade", session._id);

      if (res.data.status === "completed") {
        setPhase("finished");
        const coinRes = await api.get(`/games/coins/${user._id}`);
        setCoins(coinRes.data.appCoins);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't make that move.");
    }
  };

  const playAgain = () => {
    setSession(null);
    setMySymbol(null);
    setPhase("idle");
  };

  const isMyTurn =
    session &&
    session.status !== "completed" &&
    (session.currentTurn?._id || session.currentTurn) === user._id;

  const resultText = () => {
    if (!session) return "";
    if (session.winnerId === null) return "It's a draw! 🤝 +10 coins each";
    const winnerId = session.winnerId?._id || session.winnerId;
    return winnerId === user._id ? "You won! 🎉 +20 coins" : "You lost 😅 +5 coins";
  };

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <Navbar />

      <div className="mx-auto max-w-md px-6 py-10 text-center">
        <h1 className="text-2xl font-bold">Tic-Tac-Toe</h1>
        <p className="mt-1 text-cyan-300 font-semibold">🪙 {coins} coins</p>

        {error && (
          <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {phase === "idle" && (
          <button
            onClick={startGame}
            className="mt-8 rounded-xl bg-gradient-to-r from-purple-500 to-cyan-500 px-6 py-3 font-semibold shadow-lg shadow-purple-500/30 hover:opacity-90 transition"
          >
            Find a Match
          </button>
        )}

        {phase === "waiting" && (
          <p className="mt-8 text-white/70 animate-pulse">
            Waiting for an opponent...
          </p>
        )}

        {(phase === "playing" || phase === "finished") && session && (
          <>
            <p className="mt-4 text-sm text-white/60">
              You are <span className="font-bold text-cyan-300">{mySymbol}</span>
            </p>

            {phase === "playing" && (
              <p className="mt-1 text-sm">
                {isMyTurn ? (
                  <span className="text-green-300">Your turn</span>
                ) : (
                  <span className="text-white/50">Opponent's turn...</span>
                )}
              </p>
            )}

            <div className="mt-6 grid grid-cols-3 gap-2 mx-auto w-fit">
              {session.boardState.map((cell, i) => (
                <button
                  key={i}
                  onClick={() => handleCellClick(i)}
                  disabled={phase !== "playing" || !isMyTurn || !!cell}
                  className="h-20 w-20 rounded-xl border border-white/10 bg-white/5 text-3xl font-bold flex items-center justify-center hover:bg-white/10 transition disabled:cursor-not-allowed"
                >
                  {cell === "X" && <span className="text-purple-400">X</span>}
                  {cell === "O" && <span className="text-cyan-400">O</span>}
                </button>
              ))}
            </div>

            {phase === "finished" && (
              <div className="mt-6">
                <p className="text-lg font-semibold">{resultText()}</p>
                <button
                  onClick={playAgain}
                  className="mt-4 rounded-xl border border-white/20 px-5 py-2 hover:bg-white/10 transition"
                >
                  Play Again
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}