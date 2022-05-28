const express = require("express")
const app = express()
const path = require("path")
var PORT = process.env.PORT || 3000; 

app.use(express.json())
app.use(express.static("static"))

app.get("/", async function (req, res) {
    res.sendFile(path.join(__dirname + "/static/index.html"))
})

var boardState = [ // 0 - empty, 1 - white, 2 - red (mepels)
    [0, 2, 0, 2, 0, 2, 0, 2],
    [2, 0, 2, 0, 2, 0, 2, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0]
]
var id
var killId = -1
var z
var x
var row = -1
var column = -1
var color = 0
var win = null
var users = []
var login
var reset = 0

app.post("/addUser", (req, res) => {
    login = req.body.login
    console.log("Login: " + login)
    if (users.length == 2) {
        res.json({ success: false, info: "The game is on! Wait until players finish or click reset button." })
    } else if (users.length == 1) {
        if (login == users[0]) {
            res.json({ success: false, info: "This login is occupied. Please enter different one." })
        } else {
            users.push(login)
            res.json({ success: true, player: 1 })
        }
    } else {
        users.push(login)
        res.json({ success: true, player: 2 })
    }
    console.log("Users: " + users)
    win = null
})

app.post("/waitingForOpponent", (req, res) => {
    if (users.length == 2) {
        res.json({ success: true })
    } else {
        res.json({ success: false })
    }
})

app.post("/getBoardState", (req, res) => {
    res.json({ boardState: boardState })
})

app.post("/moveMepel", (req, res) => {
    id = req.body.id
    killId = req.body.killId
    x = req.body.x
    z = req.body.z
    row = req.body.row
    column = req.body.column
    color = req.body.color
    boardState = req.body.boardState
    res.json({ "ok": "ok" })
})

app.post("/getLastMove", (req, res) => {
    res.json({ id, killId, boardState, x, z, row, column, color, win })
})

app.post("/win", (req, res) => {
    win = req.body.player
    res.json({ "ok": "ok" })
})

app.post("/reset", (req, res) => {
    console.log("Reseting the game...")
    users = []
    boardState = [ // 0 - empty, 1 - white, 2 - red (mepels)
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
    ]
    id = -1
    killId = -1
    color = -1
    reset = 0
    win = null
    console.log("New game")
    res.json({ success: true })
})

app.post("/resetRequest", (req, res) => {
    reset += 1
    if (reset == 1) {
        return
    }
    console.log("Reseting the game...")
    users = []
    boardState = [ // 0 - empty, 1 - white, 2 - red (mepels)
        [0, 2, 0, 2, 0, 2, 0, 2],
        [2, 0, 2, 0, 2, 0, 2, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0]
    ]
    id = -1
    killId = -1
    color = -1
    reset = 0
    win = null
    console.log("New game")
    res.json({ success: true })
})

app.listen(PORT, function () {
    console.log("Server runs on port: " + PORT)
})