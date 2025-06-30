const { default: makeWASocket, DisconnectReason } = require("@adiwajshing/baileys")
const logger = require("./logger")

const startBot = () => {
  const sock = makeWASocket({
    // printQRInTerminal: true, // Removed deprecated option
    logger,
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      console.log("QR Code received, scan with WhatsApp:")
      const qrcode = require("qrcode-terminal")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      logger.warn("Connection closed due to", lastDisconnect?.error, "reconnecting:", shouldReconnect)
      if (shouldReconnect) {
        setTimeout(() => {
          startBot()
        }, 5000)
      }
    } else if (connection === "open") {
      logger.info("Connection opened successfully")
    }
  })

  sock.ev.on("messages.upsert", async (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    // const msg = m.messages[0]
    // if (!msg.key.fromMe && m.type === 'notify') {
    //     const chatId = msg.key.remoteJid
    //     await sock.readMessages([msg.key])
    //     console.log('recieved message from: ' + chatId)
    //     await sock.sendMessage(chatId, { text: 'Hai!' })
    // }
  })
}

startBot()
