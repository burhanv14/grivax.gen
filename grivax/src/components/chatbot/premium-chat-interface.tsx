"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Sparkles, ArrowRight } from "lucide-react"
import { getAIResponse } from "@/lib/chatService"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  onClose: () => void
}

export default function PremiumChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Generate unique ID for messages
  const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  useEffect(() => {
    // Add welcome message with typing effect
    const welcomeMessage = {
      id: generateId(),
      role: "assistant" as const,
      content: "Welcome to Axel, your premium AI assistant. How may I assist you today?",
      timestamp: new Date(),
    }

    setMessages([welcomeMessage])
    simulateTyping(welcomeMessage.content)

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, typingText])

  const simulateTyping = (text: string) => {
    setIsTyping(true)
    setTypingText("")

    let i = 0
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setTypingText((prev) => prev + text.charAt(i))
        i++
      } else {
        clearInterval(typingInterval)
        setIsTyping(false)
        setTypingText("")
      }
    }, 15) // Adjust speed as needed

    return () => clearInterval(typingInterval)
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    setError(null)

    const userMessage: Message = {
      id: generateId(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get AI response
      const response = await getAIResponse(
        messages
          .map((m) => ({ role: m.role, content: m.content }))
          .concat({
            role: userMessage.role,
            content: userMessage.content,
          }),
      )

      const assistantMessage: Message = {
        id: generateId(),
        role: "assistant",
        content: response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      simulateTyping(response)
    } catch (error) {
      console.error("Error getting AI response:", error)
      setError("Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpanded = () => {
    setExpanded(!expanded)
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "fixed bottom-8 right-8 z-50 transition-all duration-500 ease-in-out",
        expanded ? "w-[450px] max-w-[90vw] h-[600px] max-h-[80vh]" : "w-16 h-16",
      )}
    >
      <AnimatePresence>
        {!expanded ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-xl cursor-pointer flex items-center justify-center"
            onClick={toggleExpanded}
          >
            <Sparkles className="text-white h-8 w-8" />
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full h-full flex flex-col rounded-2xl overflow-hidden backdrop-blur-sm bg-background/80 dark:bg-background/90 border border-primary/10 shadow-[0_0_25px_rgba(0,0,0,0.1)] dark:shadow-[0_0_25px_rgba(0,0,0,0.3)]"
          >
            {/* Header */}
            <div className="relative px-6 py-4 border-b border-primary/10 backdrop-blur-sm bg-background/50 dark:bg-background/50">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                      <span className="text-white font-semibold text-lg">A</span>
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background"></span>
                  </div>
                  <div>
                    <h3 className="font-bold text-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                      Axel
                    </h3>
                    <p className="text-xs text-muted-foreground">Premium AI Assistant</p>
                  </div>
                </div>

                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpanded}
                    className="h-8 w-8 rounded-full hover:bg-primary/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-background to-background/80 dark:from-background dark:to-background/90">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
                  >
                    {message.role === "assistant" && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md mr-3 mt-1 flex-shrink-0">
                        <span className="text-white font-semibold text-lg">A</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "max-w-[80%] p-4 shadow-md",
                        message.role === "user"
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl rounded-tr-none"
                          : "bg-background dark:bg-background/80 border border-primary/10 rounded-2xl rounded-tl-none",
                      )}
                    >
                      <div className="text-sm">{message.content}</div>
                      <div
                        className={cn(
                          "text-xs mt-1 text-right",
                          message.role === "user" ? "text-white/70" : "text-muted-foreground",
                        )}
                      >
                        {new Intl.DateTimeFormat("en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(message.timestamp)}
                      </div>
                    </div>

                    {message.role === "user" && (
                      <div className="w-10 h-10 rounded-full bg-background border border-primary/20 flex items-center justify-center shadow-md ml-3 mt-1 flex-shrink-0">
                        <span className="text-foreground font-semibold text-lg">You</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-md mr-3 mt-1 flex-shrink-0">
                    <span className="text-white font-semibold text-lg">A</span>
                  </div>

                  <div className="bg-background dark:bg-background/80 border border-primary/10 p-4 rounded-2xl rounded-tl-none shadow-md max-w-[80%]">
                    {isTyping ? (
                      <div className="text-sm">
                        {typingText}
                        <span className="animate-pulse">|</span>
                      </div>
                    ) : (
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce delay-150" />
                        <div className="w-2 h-2 rounded-full bg-pink-500 animate-bounce delay-300" />
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex justify-center"
                >
                  <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm shadow-md">{error}</div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-primary/10 backdrop-blur-sm bg-background/50 dark:bg-background/50">
              <form
                className="flex items-center space-x-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
              >
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Send a message to Axel..."
                  className="flex-1 bg-background/50 dark:bg-background/80 border-primary/20 focus-visible:ring-primary/30 rounded-xl pl-4 pr-10 py-6 shadow-sm"
                  disabled={isLoading}
                />

                <Button
                  type="submit"
                  size="icon"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "rounded-full w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-md",
                    (!input.trim() || isLoading) && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>

              <div className="mt-2 text-center">
                <p className="text-xs text-muted-foreground">Powered by advanced AI technology</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
