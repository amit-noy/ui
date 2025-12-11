import './ArkAgent.scss'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import classNames from 'classnames'

const ArkAgent = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: '1',
      content: "Hi! I'm Ark Agent. How can I help you today?",
      role: 'assistant',
    },
  ])
  const [input, setInput] = useState('')
  const messagesEndRef = useRef()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: input,
      role: 'user',
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')

    setTimeout(() => {
      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: "Thanks for your message! I'm here to assist you.",
        role: 'assistant',
      }
      setMessages((prev) => [...prev, assistantMessage])
    }, 1000)
  }

  return (
    <div className="ark-agent">
      {/* Chat Window */}
      <div className={classNames('chat-window', isOpen ? 'open' : 'closed')}>
        {/* Header */}
        <div className="header">
          <div className="title-area">
            <div className="status-dot" />
            <span>Ark Agent</span>
          </div>

          <button className="close-btn" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="messages">
          {messages.map((message) => (
            <div
              key={message.id}
              className={classNames(
                'message',
                message.role === 'user' ? 'user' : 'assistant',
              )}
            >
              {message.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="input-section">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
            />
            <button type="submit">
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      {/* Toggle Button */}
      <button className="toggle-btn" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <MessageCircle size={20} />}
      </button>
    </div>
  )
}

export default ArkAgent