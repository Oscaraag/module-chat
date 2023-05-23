import {
  collection,
  query,
  where,
  Timestamp,
  onSnapshot,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore'
import db from './firebase'

export const listenForSupervisorMessages = (
  executiveRUT: string,
  setChats: (chats: { chatID: string; messages: Message[] }[]) => void
): (() => void) => {
  const chatsCollectionRef = collection(db, 'chats')
  const chatsQuery = query(
    chatsCollectionRef,
    where('executiveRUT', '==', executiveRUT)
  )

  const unsubscribe = onSnapshot(chatsQuery, (snapshot) => {
    const updatedChats: { chatID: string; messages: Message[] }[] = []

    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const chatID = change.doc.id
        const chatData = change.doc.data() as {
          messages: Message[]
          supervisorName: string
        }
        const chat: {
          chatID: string
          messages: Message[]
          chatName: string
        } = {
          chatID,
          messages: chatData.messages,
          chatName: chatData.supervisorName,
        }
        updatedChats.push(chat)
      }
    })

    setChats(updatedChats)
  })

  return unsubscribe
}

export interface Message {
  senderID: string
  text: string
  timestamp: Timestamp
}

export const sendMessage = async (
  chatID: string,
  senderID: string,
  text: string
): Promise<void> => {
  try {
    // Crear una referencia a la subcolección de mensajes en el documento del chat
    const messagesCollectionRef = collection(db, 'chats', chatID, 'messages')

    // Crear el objeto del mensaje
    const message = {
      senderID,
      userName: 'ZQ Chat',
      text,
      timestamp: serverTimestamp(),
    }

    // Agregar el mensaje como un nuevo documento en la subcolección de mensajes
    await addDoc(messagesCollectionRef, message)

    console.log(`Message sent in chat room ${chatID}, message: ${message}`)
    return Promise.resolve()
  } catch (error) {
    console.error('Error sending message: ', error)
    return Promise.reject(error)
  }
}
