import TelegramBot from 'node-telegram-bot-api'
import express from 'express'

const botToken = '7032208203:AAEIZRDMHH1eFA6zh94icbEnXlQK8MeMCto'
const channelId = '1002032821328' // Channel ID starts with "-"

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

const bot = new TelegramBot(botToken)

// Start the bot
void bot.startPolling().then(() => {
  console.log('Bot is running...')
})

let messagesStore = [] as string[]

const server = express()

server.use(express.json())

server.post('/message', (req, res) => {
  console.log('accept message')

  const message = req.body.message as string
  const cleanedMessage = convertHtmlToTelegramString(message)

  messagesStore.push(cleanedMessage)

  res.sendStatus(204)
})

bot.on('message', async (msg) => {
  await Promise.all(
    messagesStore.map((message) => bot.sendMessage(msg.chat.id, message, { parse_mode: 'HTML' })),
  )
  // eslint-disable-next-line require-atomic-updates
  messagesStore = []
})

server.listen(3000, () => {
  console.log('Server is running...')
})
