import { useEffect, useState } from 'react'
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Unsubscribe,
  Timestamp,
} from 'firebase/firestore'
import db from '../utils/firebase'

interface Message {
  senderID: string
  text: string
  timestamp: Timestamp
  userName: string
  uid?: string
}

const useChatMessages = (chatID: string | null): Message[] => {
  const [messages, setMessages] = useState<Message[]>([])

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined

    if (chatID) {
      const messagesCollectionRef = collection(db, 'chats', chatID, 'messages')
      const messagesQuery = query(
        messagesCollectionRef,
        orderBy('timestamp', 'asc')
      )

      unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const updatedMessages: Message[] = snapshot.docs.map(
          (doc) => doc.data() as Message
        )

        const uniqueMessages = Array.from(
          new Set(updatedMessages.map((message) => message.timestamp.seconds))
        )
          .map((seconds) => {
            return updatedMessages.find(
              (message) => message.timestamp.seconds === seconds
            )
          })
          .filter((message) => message !== undefined) as Message[]

        setMessages(uniqueMessages)
      })
    } else {
      setMessages([])
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [chatID])

  return messages
}

export default useChatMessages
