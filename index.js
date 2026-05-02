const express = require("express")
const cors = require("cors")

const app = express()

// 🔥 CORS FIX FULL (VERCEL + LOCAL + PRE-FLIGHT SAFE)
const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://pickme-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}

app.use(cors(corsOptions))
app.options("*", cors(corsOptions))

app.use(express.json())

const PORT = process.env.PORT || 3000

let projects = []

// 🔥 FRONTEND URL (PRODUCTION)
const CLIENT_URL = "https://pickme-frontend.vercel.app"

app.get("/", (req, res) => {
  res.json({ status: "OK" })
})

app.post("/create-project", (req, res) => {
  const { name, admin_whatsapp } = req.body

  if (!name || !admin_whatsapp) {
    return res.status(400).json({ error: "Missing data" })
  }

  const code = Math.random().toString(36).substring(2, 8)

  const project = {
    code,
    name,
    admin_whatsapp,
    photos: [
      { name: "foto1", url: "https://picsum.photos/500?1" },
      { name: "foto2", url: "https://picsum.photos/500?2" },
      { name: "foto3", url: "https://picsum.photos/500?3" }
    ]
  }

  projects.push(project)

  const link = `${CLIENT_URL}/project/${code}`

  res.json({ link, code })
})

app.get("/project/:code", (req, res) => {
  const project = projects.find(p => p.code === req.params.code)

  if (!project) {
    return res.status(404).json({ error: "Not found" })
  }

  res.json(project)
})

app.listen(PORT, () => {
  console.log("Backend running on", PORT)
})