"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, X, ChevronDown } from "lucide-react"
import { getAIResponse } from "@/lib/chatService"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar } from "@/components/ui/avatar"

interface Message {
  role: "user" | "assistant"
  content: string
}

interface ChatInterfaceProps {
  onClose: () => void
}

export default function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        role: "assistant",
        content:
          "Hello! I'm Axel, your AI assistant. How can I help you today? You can ask me questions about the current page or any other topic.",
      },
    ])

    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    setError(null)

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // Get AI response
      const response = await getAIResponse(messages.concat(userMessage))

      const assistantMessage: Message = {
        role: "assistant",
        content: response,
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setError("Failed to get a response. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <Card className="flex flex-col h-full border shadow-lg rounded-xl overflow-hidden transition-all duration-300 bg-background">
      <CardHeader className="p-3 border-b flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center space-x-2">
          <Avatar className="h-8 w-8 bg-primary">
            <span className="text-primary-foreground font-semibold text-sm">A</span>
          </Avatar>
          <h3 className="font-semibold text-lg">Axel</h3>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" onClick={toggleCollapse} className="h-8 w-8">
            <ChevronDown className={cn("h-4 w-4 transition-transform", isCollapsed ? "rotate-180" : "")} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <>
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[60vh]">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                {message.role === "assistant" && (
                  <Avatar className="h-8 w-8 mr-2 mt-1 bg-primary flex-shrink-0">
                    <span className="text-primary-foreground font-semibold text-sm">A</span>
                  </Avatar>
                )}
                <div
                  className={cn(
                    "max-w-[80%] rounded-xl p-3 shadow-sm",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none",
                  )}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <Avatar className="h-8 w-8 mr-2 mt-1 bg-primary flex-shrink-0">
                  <span className="text-primary-foreground font-semibold text-sm">A</span>
                </Avatar>
                <div className="bg-muted rounded-xl p-3 rounded-tl-none">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-primary/80 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-destructive/10 text-destructive rounded-lg p-3 text-sm">{error}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <CardFooter className="p-3 border-t bg-background">
            <form
              className="flex gap-2 w-full"
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Message Axel..."
                className="flex-1 border-primary/20 focus-visible:ring-primary"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                className="transition-all duration-200"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
