import './ArkAgent.scss'
import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send } from 'lucide-react'
import classNames from 'classnames'
import { useSelector } from 'react-redux'
import { convertToArkRequest, convertToArkResponse } from '../../utils/arkApiMapper'

const ArkAgent = () => {

  const projectList = useSelector(state => state.projectStore.projects)
  const projectsSummary = useSelector(state => state.projectStore.projectsSummary)
  const nuclioFunctions = useSelector(store => store.nuclioStore.functions)

  const [isOpen, setIsOpen] = useState(true)
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

    // TODO: Send request to Ark API
    const message = convertToArkRequest(input, {projectList, projectsSummary, nuclioFunctions})

    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      content: input,
      role: 'user'
    }])
    setInput('')

    // TODO: Handle response from Ark API
    setTimeout(() => {
      const assistantMessage = convertToArkResponse(
        {
          'success': true,
          'queryName': 'query-8v2c9',
          'responses': [
            {
              'target': {
                'type': 'agent',
                'name': 'mlrun'
              },
              'content': 'Here are the details for the project "fraud-demo-normal-user":\n\n- Name: fraud-demo-normal-user\n- Created: 2025-10-21T17:28:00.952000\n- Labels: None\n- Annotations: None\n- Description: Not provided\n- Owner: normal-user\n- Goals: Not provided\n- Parameters:\n  - transaction_stream: v3io:///projects/fraud-demo-normal-user/streams/transaction\n  - events_stream: v3io:///projects/fraud-demo-normal-user/streams/events\n- Functions: Not provided\n- Workflows: Not provided\n- Artifacts: Not provided\n- Artifact Path: Not provided\n- Conda: ""\n- Source: git://github.com/mlrun/demo-fraud.git\n- Subpath: Not provided\n- Origin URL: git://github.com/mlrun/demo-fraud.git\n- Desired State: online\n- Custom Packagers: Not provided\n- Default Image: Not provided\n- Build: Not provided\n- Default Function Node Selector: {}\n- Load Source On Run: true\n- Status State: online\n\nOrigin URL: git://github.com/mlrun/demo-fraud.git'
            }
          ]
        }      )
      setMessages((prev) => [...prev, {
        id: (Date.now() + 1).toString(),
        content: assistantMessage,
        role: 'assistant',
      }])
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