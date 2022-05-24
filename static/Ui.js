class Ui {
    constructor() {
        this.root = document.getElementById("root")
        this.logingDialog = document.getElementById("logingDialog")
        this.dialog = document.getElementById("dialog")
        this.counter = document.getElementById("counter")
        this.boardStatus = document.getElementById("boardStatus")
        this.status = document.getElementById("status")
        this.info = document.getElementById("info")
    }

    addMist = () => {
        this.root.classList.add("blackMist")
    }

    removeMist = () => {
        this.root.classList.remove("blackMist")
    }

    show = (element) => {
        element.classList.remove("invisible")
    }

    hide = (element) => {
        element.classList.add("invisible")
    }
}

export default Ui