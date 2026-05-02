const express = require("express")
const cors = require("cors")

const app = express()

app.use(cors({ origin: "*" }))
app.use(express.json())

const PORT = process.env.PORT || 3000

let projects = []

app.get("/", (req, res) => {
  res.json({ status: "OK" })
})

app.post("/create-project", (req, res) => {
  const { name, admin_whatsapp } = req.body

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

  res.json({
    link: `http://localhost:5173/project/${code}`
  })
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