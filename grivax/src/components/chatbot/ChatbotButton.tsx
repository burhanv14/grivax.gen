"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import PremiumChatInterface from "@/components/chatbot/premium-chat-interface"
import { Sparkles } from "lucide-react"

export default function ChatbotButton() {
  const [showChat, setShowChat] = useState(false)

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {!showChat && (
        <Button
          onClick={() => setShowChat(true)}
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white px-6 py-6 rounded-xl shadow-lg transition-all duration-300 flex items-center gap-2"
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-lg font-medium">Launch Premium Axel</span>
        </Button>
      )}

      {showChat && <PremiumChatInterface onClose={() => setShowChat(false)} />}
    </div>
  )
}
