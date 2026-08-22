// src/socket.ts
import { io } from "socket.io-client"

const endpoint = import.meta.env.VITE_API_HOST || import.meta.env.VITE_API_LIVEHOST

// We won't connect immediately — allow setting auth dynamically
const socket = io(endpoint, {
  autoConnect: false, // ✅ important
  transports: ["websocket"],
})

 
export const connectSocket = () => {
  // ✅ get token from cookies each time before connect
  const token = document.cookie
    .split("; ")
    .find((row) => row.startsWith("token="))
    ?.split("=")[1]

  // ✅ attach token in auth payload
  socket.auth = { token }

  if (!socket.connected) {
    socket.connect()
    console.log("🔌 Socket connecting with token:", token)
  }
}

export default socket
