const express = require("express")
const cors = require("cors")
const { createClient } = require("@supabase/supabase-js")

const app = express()

// ✅ CORS CONFIG (FIX VERCEL + LOCAL)
const allowedOrigins = [
  "http://localhost:5173",
  "https://pickme-frontend.vercel.app"
]

app.use(cors({
  origin: function (origin, callback) {
    // allow request tanpa origin (postman, mobile app, dll)
    if (!origin) return callback(null, true)

    if (
      allowedOrigins.includes(origin) ||
      origin.endsWith(".vercel.app")
    ) {
      return callback(null, true)
    } else {
      console.log("BLOCKED CORS:", origin)
      return callback(new Error("Not allowed by CORS"))
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}))

// ✅ HANDLE PREFLIGHT (PENTING)
app.options("*", cors())

app.use(express.json())

const PORT = process.env.PORT || 3000

// 🔥 SUPABASE CONFIG
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

// FRONTEND URL
const CLIENT_URL = "https://pickme-frontend.vercel.app"

app.get("/", (req, res) => {
  res.json({ status: "OK" })
})

// CREATE PROJECT
app.post("/create-project", async (req, res) => {
  try {
    console.log("HIT CREATE PROJECT")

    const { name, admin_whatsapp } = req.body

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
          photos: [
            { name: "foto1", url: "https://picsum.photos/500?1" },
            { name: "foto2", url: "https://picsum.photos/500?2" },
            { name: "foto3", url: "https://picsum.photos/500?3" }
          ]
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

// GET PROJECT
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

app.listen(PORT, () => {
  console.log("Backend running on", PORT)
})