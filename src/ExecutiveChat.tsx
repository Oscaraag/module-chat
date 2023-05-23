/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react'

import {
  listenForSupervisorMessages,
  Message,
  sendMessage,
} from './utils/index'
import useChatMessages from './hooks/useChatMessages'

interface Chat {
  chatID: string
  messages: Message[]
  chatName: string
}

const ExecutiveChat: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [newMessage, setNewMessage] = useState('')

  const messages = useChatMessages(selectedChat)

  useEffect(() => {
    const unsubscribe = listenForSupervisorMessages('6789', setChats)

    return () => {
      unsubscribe()
    }
  }, [])

  const handleChatSelection = (chatID: string) => {
    setSelectedChat(chatID)
  }

  const handleNewMessageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setNewMessage(event.target.value)
  }

  const handleSendMessage = (event: React.FormEvent) => {
    event.preventDefault()
    if (selectedChat) {
      sendMessage(selectedChat, '6789', newMessage)
      setNewMessage('')
    }
  }

  const formatTimestamp = (timestamp: any) => {
    const date = timestamp.toDate()
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear().toString().slice(-2)
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')

    return `${day}/${month}/${year} ${hours}:${minutes}`
  }

  return (
    <div>
      <h2>Executive Chat</h2>
      <div>
        {chats.map((chat) => (
          <div
            key={chat.chatID}
            onClick={() => handleChatSelection(chat.chatID)}
          >
            <h3>Chat ID: {chat.chatName}</h3>
            {selectedChat === chat.chatID && (
              <div>
                {messages.map((message) => (
                  <div key={message.timestamp.toMillis()}>
                    <p>Sender: {message.senderID}</p>
                    <p>Message: {message.text}</p>
                    <p>Timestamp: {formatTimestamp(message.timestamp)}</p>
                  </div>
                ))}
                <form onSubmit={handleSendMessage}>
                  <input
                    type='text'
                    value={newMessage}
                    onChange={handleNewMessageChange}
                    placeholder='Enter your message...'
                  />
                  <button type='submit'>Send</button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExecutiveChat
