import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Send } from "lucide-react"
import { Button } from "antd"
import { toast } from "react-toastify"
import socket, { connectSocket } from "../../socket"

type ApiMessage = {
  _id?: string
  sender: string
  message: string
  senderRole: "user" | "admin" | "gym_owner"
  sentAt: string
  ticketId?: string
}

type TicketData = {
  _id: string
  createdBy: string
  subject: string
  description: string
  status: string
  messages: ApiMessage[]
}

type Message = {
  id: string
  text: string
  sender: "me" | "other"
  time: string
  senderRole: "user" | "admin" | "gym_owner"
}

export default function ChatScreen() {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [ticketInfo, setTicketInfo] = useState<{ subject: string; status: string } | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement | null>(null)
  const { id: routeId } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const ticketId = routeId ?? ""

  const endpoint = import.meta.env.VITE_API_LIVEHOST
  const token =
    typeof window !== "undefined"
      ? document.cookie.split("; ").find((r) => r.startsWith("token="))?.split("=")[1]
      : ""
  const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null
  const userRole = localStorage.getItem("userRole") || "admin"

  // --- Map API → UI
  const mapApiMessages = (apiMessages: ApiMessage[]): Message[] =>
    apiMessages.map((msg) => ({
      id: msg._id || Math.random().toString(),
      text: msg.message,
      sender: userRole === msg.senderRole ? "me" : "other",
      time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      senderRole: msg.senderRole,
    }))

  // --- Fetch ticket history (only once)
  const fetchTicket = async () => {
    if (!ticketId) return
    try {
      const fetchUrl =
        userRole === "admin"
          ? `${endpoint}/v1/admin/list/listpar/${ticketId}`
          : `${endpoint}/v1/user/ticket/${ticketId}`

      const res = await fetch(fetchUrl, { headers: { token: token || "" } })
      const data: TicketData = await res.json()

      if (data?.messages) {
        setMessages(mapApiMessages(data.messages))
        setTicketInfo({ subject: data.subject, status: data.status })
      } else {
        toast.error("Failed to load ticket messages")
      }
    } catch (err) {
      toast.error("Error fetching ticket messages")
      console.error(err)
    }
  }

  // --- Socket connect
  useEffect(() => {
    connectSocket()

    socket.on("connect", () => {
      setIsConnected(true)
      console.log("✅ Socket connected:", socket.id)

      if (userRole === "admin") socket.emit("join-admin")
      else if (userRole === "gym_owner") socket.emit("join-gym", userId)
      else socket.emit("join-user", userId)
    })

    socket.on("disconnect", () => {
      setIsConnected(false)
      console.warn("⚠️ Socket disconnected")
    })

    return () => {
      socket.off("connect")
      socket.off("disconnect")
    }
  }, [userRole, userId])

  // --- Listen for real-time incoming messages
useEffect(() => {
  if (!socket) return

  const handleNewMessage = (data: ApiMessage) => {
    if (!data.ticketId || data.ticketId !== ticketId) return
    console.log("💬 New message:", data)

    setMessages((prev) => [
      ...prev,
      {
        id: data._id || Math.random().toString(),
        text: data.message,
        sender: userRole === data.senderRole ? "me" : "other",
        time: new Date(data.sentAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        senderRole: data.senderRole,
      },
    ])
  }

  socket.on("ticket_message", handleNewMessage)

  // ✅ TS-safe cleanup — explicitly returns void
  return () => {
    socket.off("ticket_message", handleNewMessage)
  }
}, [ticketId, userRole])


  // --- Load messages
  useEffect(() => {
    fetchTicket()
  }, [ticketId])

  // --- Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // --- Send message via SOCKET
  const handleSendMessage = () => {
    if (!message.trim() || !ticketId) return

    const newMsg = {
      ticketId,
      message,
      senderRole: userRole,
      sentAt: new Date().toISOString(),
    }

    // Optimistic UI update
    setMessages((prev) => [
      ...prev,
      {
        id: Math.random().toString(),
        text: message,
        sender: "me",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        senderRole: userRole as "user" | "admin" | "gym_owner",
      },
    ])
    setMessage("")

    // Emit to backend
    if (socket.connected) {
      socket.emit("send_ticket_message", newMsg) // 🔥 tell server to broadcast
    } else {
      toast.error("Socket not connected. Please wait...")
    }
  }

  // --- Handle missing ticket ID
  if (!ticketId) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-red-500 font-semibold mb-2">⚠️ Missing or invalid Ticket ID</p>
          <Button type="primary" onClick={() => navigate("/tickets")}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // --- UI
  return (
    <div className="flex flex-col h-screen bg-muted/30">
      <div className="flex-shrink-0 bg-card border-b px-6 py-4">
        <h2 className="text-lg font-semibold">{ticketInfo?.subject || "Support Ticket"}</h2>
        <p className="text-xs text-muted-foreground">
          {isConnected ? "🟢 Connected" : "🔴 Connecting..."} • Status:{" "}
          {ticketInfo?.status || "N/A"}
        </p>
      </div>

      <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No messages yet</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-2xl ${
                  msg.sender === "me"
                    ? "bg-blue-500 text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 border rounded-bl-md"
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {msg.sender === "me"
                    ? "You"
                    : msg.senderRole === "admin"
                    ? "Admin"
                    : msg.senderRole === "gym_owner"
                    ? "Gym Owner"
                    : "User"}
                </p>
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className="text-[10px] mt-1 opacity-60">{msg.time}</p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex-shrink-0 bg-card border-t px-6 py-4 flex items-end gap-4">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          rows={1}
          className="flex-grow px-4 py-3 bg-gray-100 border rounded-2xl resize-none focus:ring-2 focus:ring-blue-400"
          style={{ maxHeight: 120 }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          shape="circle"
          icon={<Send />}
          type="primary"
        />
      </div>
    </div>
  )
}
