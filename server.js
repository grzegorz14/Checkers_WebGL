const express = require("express")
const app = express()
const path = require("path")
const { kill } = require("process")

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
var queen = "normal"
var killId
var z
var x
var row
var column
var color
var win = null
var users = []
let login

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

app.post("/setBoardState", (req, res) => {
    boardState = req.body.boardState
    res.json({ "ok": "ok" })
})

app.post("/getBoardState", (req, res) => {
    res.json({ boardState: boardState })
})

app.post("/compareBoardState", (req, res) => {
    if (JSON.stringify(boardState) !== JSON.stringify(req.body.boardState)) {
        res.json({ change: true, boardState: boardState })
    }
    else {
        res.json({ change: false, boardState: boardState })
    }
})

app.post("/moveMepel", (req, res) => {
    id = req.body.id
    killId = req.body.killId
    x = req.body.x
    z = req.body.z
    row = req.body.row
    column = req.body.column
    color = req.body.color
    queen = req.body.queen
    res.json({ "ok": "ok" })
})

app.post("/getLastMove", (req, res) => {
    res.json({ id, killId, boardState, x, z, row, column, color, win, queen })
    queen = "normal"
})

app.post("/win", (req, res) => {
    win = req.body.player
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
    color = null
    win = null
    console.log("New game")
    res.json({ success: true })
})

app.listen(3000, function () {
    console.log("Server runs on port: 3000")
})