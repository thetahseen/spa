import qrcode from "qrcode-terminal"
import { makeWASocket, DisconnectReason } from "@adiwajshing/baileys"

async function startSock() {
  const sock = makeWASocket({
    // printQRInTerminal: true, // Removed deprecated option
  })

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update

    // Handle QR code generation
    if (qr) {
      console.log("QR Code received, scan with WhatsApp:")
      qrcode.generate(qr, { small: true })
    }

    if (connection === "close") {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      console.log("Connection closed due to ", lastDisconnect?.error, ", reconnecting ", shouldReconnect)
      if (shouldReconnect) {
        startSock()
      }
    } else if (connection === "open") {
      console.log("Opened connection")
    }
  })

  // for handling messages
  sock.ev.on("messages.upsert", (m) => {
    console.log(JSON.stringify(m, undefined, 2))

    console.log("replying to", m.messages[0].key.remoteJid)
    sock.sendMessage(m.messages[0].key.remoteJid, { text: "Hello there!" })
  })
}

// run in main file
startSock()
