const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()

// =====================
// CORS CONFIG
// =====================
const allowedOrigins = [
  "http://localhost:5173",
  "https://pickme-frontend.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true)

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true)
    }

    console.log("BLOCKED CORS:", origin)
    return callback(new Error("Not allowed by CORS"))
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}))

app.options("*", cors())

// =====================
// BODY PARSER
// =====================
app.use(express.json())

// =====================
// DEBUG
// =====================
app.use((req, res, next) => {
  console.log("🔥", req.method, req.url)
  next()
})

// =====================
// ENV
// =====================
const PORT = process.env.PORT || 3000

// =====================
// SUPABASE
// =====================
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// =====================
// FRONTEND URL
// =====================
const CLIENT_URL = "https://pickme-frontend.vercel.app"

// =====================
// ROUTES
// =====================

app.get("/", (req, res) => {
  res.json({ status: "OK" })
})

// =====================
// CREATE PROJECT (UPGRADED)
// =====================
app.post("/create-project", async (req, res) => {
  try {
    console.log("🔥 HIT CREATE PROJECT")

    const {
      name,
      admin_whatsapp,
      max_photos,
      drive_link
    } = req.body

    if (!name || !admin_whatsapp) {
      return res.status(400).json({ error: "Missing data" })
    }

    const code = Math.random().toString(36).substring(2, 8)

    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          code,
          name,
          admin_whatsapp,
          max_photos: Number(max_photos) || 10,
          drive_link: drive_link || null,
          photos: []
        }
      ])
      .select()

    if (error) {
      console.log("SUPABASE ERROR:", error)
      return res.status(500).json({ error: error.message })
    }

    return res.json({
      link: `${CLIENT_URL}/project/${code}`,
      code
    })

  } catch (err) {
    console.log("SERVER ERROR:", err)
    return res.status(500).json({ error: err.message })
  }
})

// =====================
// GET PROJECT
// =====================
app.get("/project/:code", async (req, res) => {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("code", req.params.code)
    .single()

  if (error || !data) {
    return res.status(404).json({ error: "Not found" })
  }

  res.json(data)
})

// =====================
// START SERVER
// =====================
app.listen(process.env.PORT, "0.0.0.0", () => {
  console.log("🚀 Backend running on", process.env.PORT)
})