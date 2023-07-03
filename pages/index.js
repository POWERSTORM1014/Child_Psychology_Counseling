import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import styles from './index.module.css'

export default function Home() {
  const bottomRef = useRef(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState([])

  useEffect(() => {
    setMessages([{ name: 'AI', message: getGreeting() }])
  }, [0])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function getGreeting() {
    const greetings = [
      '안녕하세요! 아이들의 마음을 이해하는 것은 어렵지만 중요한 일입니다. 제가 여러분의 이야기를 듣고 도움을 드릴 수 있어 기쁩니다. 지금 가장 크게 고민하시는 문제는 무엇인가요?',
      '안녕하세요! 아이의 마음을 이해하려는 여러분의 노력을 정말로 존경합니다. 제가 어떤 부분에서 도움을 드릴 수 있을까요?',
      '안녕하세요! 아이들의 성장과 발달에 대한 고민이 있으시다면, 제가 도와드릴 수 있습니다. 어떤 문제로 고민하고 계신가요?',
      '안녕하세요! 아이의 심리를 이해하는 것은 어렵습니다. 하지만 함께 이야기하며 답을 찾아가봅시다. 어떤 고민으로 인해 도움이 필요하신가요?',
      '안녕하세요! 아동 심리 전문가로서, 여러분의 이야기를 듣고 아이들에게 도움이 될 수 있는 방향을 함께 찾아보고 싶습니다. 어떤 문제로 고민하고 계신가요?',
    ]
    const index = Math.floor(greetings.length * Math.random())
    return greetings[index]
  }

  async function onSubmit(event) {
    event.preventDefault()

    setMessages((prevMessages) => {
      const newMessages = [
        ...prevMessages,
        { name: '나', message: chatInput },
        { name: 'AI', message: '' },
      ]
      return newMessages
    })

    const sentInput = chatInput
    setChatInput('')

    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat: [...messages, { name: 'Me', message: sentInput }],
      }),
    })

    if (!response.ok) {
      alert('Please enter a valid input')
      return
    }

    const data = response.body
    if (!data) {
      return
    }

    const reader = data.getReader()
    const decoder = new TextDecoder()
    let done = false

    while (!done) {
      const { value, done: doneReading } = await reader.read()
      done = doneReading
      let chunkValue = decoder.decode(value)

      chunkValue = chunkValue.replace(/\. /g, '.\n')
      chunkValue = chunkValue.replace(/\? /g, '?\n')
      chunkValue = chunkValue.replace(/\! /g, '!\n')

      setMessages((prevMessages) => {
        const lastMsg = prevMessages.pop()
        const newMessages = [
          ...prevMessages,
          { name: lastMsg.name, message: lastMsg.message + chunkValue },
        ]
        return newMessages
      })
    }
  }

  function downloadChatLog() {
    const chatLog = messages.map((m) => `${m.name}: ${m.message}`).join('\n')
    const blob = new Blob(['\ufeff' + chatLog], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)

    const tempLink = document.createElement('a')
    tempLink.href = url
    tempLink.setAttribute('download', 'chat_log.txt')
    tempLink.click()

    URL.revokeObjectURL(url)
  }

  const messageElements = messages.map((m, i) => {
    return (
      <div
        style={{
          background: m.name === 'AI' ? 'none' : 'rgb(0 156 23 / 20%)',
        }}
        key={i}
        className={styles.message}
      >
        <div className={styles.messageName}>{m.name}</div>
        <div className={styles.messageContent}>
          {m.message.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </div>
      </div>
    )
  })

  return (
    <div>
      <style global jsx>{`
        html,
        body,
        body > div:first-child,
        div#__next,
        div#__next > div {
          height: 100%;
          margin: 0px;
        }
      `}</style>
      <Head>
        <title>아동심리상담전문 코선생 엠파스봇</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link
          href="https://cdn.jsdelivr.net/npm/comic-mono@0.0.1/index.min.css"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.main}>
        <div className={styles.icon}></div>
        <h3 className={styles.title}>아동심리상담사 코선생 엠파스봇</h3>
        <div className={styles.chat}>
          <div className={styles.chatDisplay}>
            {messageElements}
            <div ref={bottomRef} />
          </div>
          <form onSubmit={onSubmit}>
            <input
              type="text"
              name="chat"
              placeholder="편하게 말씀해 주세요.^^"
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value)
              }}
            />
            <input
              type="submit"
              value="질문하기"
              className={styles.buttonStyle}
            />
            <button
              type="button"
              onClick={downloadChatLog}
              className={styles.buttonStyle}
            >
              다운받기
            </button>
          </form>
        </div>
        <div className={styles.footer}>made by AI 종화</div>
      </main>
    </div>
  )
}
