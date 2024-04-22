/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable require-atomic-updates */
import TelegramBot from 'node-telegram-bot-api'
import express from 'express'
import cors from 'cors'

const botToken = '7032208203:AAEIZRDMHH1eFA6zh94icbEnXlQK8MeMCto'
// const channelId = '1002032821328' // Channel ID starts with "-"

function convertHtmlToTelegramString(html: string): string {
  let temp = html.replace(/<img\b[^>]*>/gi, '')
  temp = temp.replace(/<canvas\b[^>]*>.*<\/canvas>/gi, '')
  temp = temp.replace(/<button\b[^>]*>.*<\/button>/gi, '')
  temp = temp.replace(/<defs\b[^>]*>.*<\/defs>/gi, '')
  temp = temp.replace(/<g\b[^>]*>.*<\/g>/gi, '')
  temp = temp.replace(/<svg\b[^>]*>.*<\/svg>/gi, '')
  temp = temp.replace(/<br>/gi, '\n')

  temp = temp.replace(/<div\b[^>]*>/gi, '<strong>')
  temp = temp.replace(/<\/div>/gi, '</strong>')

  temp = temp.replace(/<span\b[^>]*>/gi, '<strong>')
  temp = temp.replace(/<\/span>/gi, '</strong>')
  temp = temp.replace(/<\/svg>/gi, '')

  return temp
}

let messagesStore = [] as string[]

const server = express()

server.use(express.json())
server.use(
  cors({
    origin: '*',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  }),
)

server.post('/message', (req, res) => {
  const message = req.body.message as string

  console.log('accept body', req.body)
  console.log('accept message', req.body.message)

  const cleanedMessage = convertHtmlToTelegramString(message)

  messagesStore.push(cleanedMessage)

  res.sendStatus(204)
})

server.listen(3000, () => {
  console.log('Server is running...')
})

let telegramBot: TelegramBot | null = null

async function start(token: string): Promise<void> {
  telegramBot = new TelegramBot(token)
  await telegramBot.startPolling({ restart: true })

  telegramBot.on('message', async (msg) => {
    await Promise.all(
      messagesStore.map((message) => {
        console.log('🚀 ~ messagesStore.map ~ message:', message)

        return (telegramBot as TelegramBot).sendMessage(msg.chat.id, message, {
          parse_mode: 'HTML',
        })
      }),
    )
    // eslint-disable-next-line require-atomic-updates
    messagesStore = []
  })
}

async function stop(): Promise<void> {
  if (telegramBot != null) {
    await telegramBot.stopPolling({ cancel: true })
    telegramBot = null
  }
  process.exit()
}

void start(botToken)

process.on('SIGQUIT', stop)
process.on('SIGINT', stop)
