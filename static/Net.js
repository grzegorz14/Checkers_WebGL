class Net {
    constructor(game, ui) {
        this.game = game;
        this.ui = ui;

        this.timerInterval = null;
        this.updateInterval = null;

        document.getElementById("playButton").onclick = this.playButton;

        document.getElementById("resetButton").onclick = async function () {
            console.log("Game reset");
            let response = await fetch("/reset", { method: "post" });
            await response.json().then(data => {
                if (data.success) {
                    alert("New game! Log in");
                }
            })
        }
    }

    playButton = async () => {
        let login = document.getElementById("login").value.trim();
        document.getElementById("login").value = "";
        if (!login) {
            return;
        }

        const body = JSON.stringify({ login });
        const headers = { "Content-Type": "application/json" };
        let response = await fetch("/addUser", { method: "post", body, headers });
        await response.json().then(data => {
            if (data.success) {
                console.log("Player " + data.player + " Login: " + login);

                this.game.player = data.player;
                this.game.opponent = data.player == 1 ? 2 : 1;
                this.game.boardState = [
                    [0, 2, 0, 2, 0, 2, 0, 2],
                    [2, 0, 2, 0, 2, 0, 2, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 0, 0, 0, 0, 0, 0, 0],
                    [0, 1, 0, 1, 0, 1, 0, 1],
                    [1, 0, 1, 0, 1, 0, 1, 0]
                ];
                if (data.player == 2) {
                    this.waitForOpponent(login);
                } 
                else {
                    this.preparePlayer(login);
                }
            } 
            else {
                alert(data.info);
            }
        })
    }

    waitForOpponent = (login) => {
        this.ui.status.innerText = login;
        this.ui.hide(this.ui.logingDialog);
        this.ui.show(this.ui.dialog);
        this.ui.dialog.innerText = "Waiting for an opponent...";

        let intervalId = setInterval(async () => {
            const headers = { "Content-Type": "application/json" };
            let response = await fetch("/waitingForOpponent", { method: "post", headers });
            await response.json().then(data => {
                if (data.success) {
                    this.preparePlayer(login);
                    clearInterval(intervalId);
                }
            })
        }, 500);
    }

    preparePlayer = (login) => {
        this.ui.hide(this.ui.logingDialog);
        this.ui.hide(this.ui.dialog);
        this.ui.removeMist();
        this.ui.show(this.ui.boardStatus);
        this.ui.status.innerText = login;

        if (this.game.player == 2) {
            this.ui.info.innerText = "Welcome " + login + "! You play red.";
            this.startTimer();
            this.game.yourTurn = false;
        } 
        else {
            this.ui.info.innerText = "Welcome " + login + "! You play white.";
            this.game.yourTurn = true;
        }

        this.game.createMepels();
        this.game.setPlayerPosition();
        this.setBoardStatus(this.game.boardState);

        this.updateInterval = setInterval(this.update, 300);
    }

    update = async () => {
        let response = await fetch("/getLastMove", { method: "post" });

        await response.json().then(async data => { 
            if (data.win == this.game.player) { //you win
                console.log("WIN");
                clearInterval(this.updateInterval);
                clearInterval(this.timerInterval);
                this.win();
                await fetch("/resetRequest", { method: "post" });
            }
            else if (!this.game.moved && JSON.stringify(data.boardState) !== JSON.stringify(this.game.boardState)) { //opponent moves
                this.setBoardStatus(this.game.boardState);
                this.game.boardState = data.boardState;

                if (data.killId != -1) {
                    await this.killMepelAndMove(data.killId, data.id, data.x, data.z, data.row, data.column);
                }
                else {
                    await this.moveMepel(data.id, data.x, data.z, data.row, data.column);
                }

                clearInterval(this.timerInterval);
                this.ui.removeMist();
                this.ui.hide(this.ui.dialog);
                this.ui.hide(this.ui.counter);

                if (data.win == this.game.opponent) { //opponent wins
                    console.log("LOSE");
                    clearInterval(this.updateInterval);
                    this.lose();
                    await fetch("/resetRequest", { method: "post" });
                }
                else {
                    this.game.yourTurn = true;
                }
            }
            else if (this.game.moved && JSON.stringify(data.boardState) === JSON.stringify(this.game.boardState)) {
                this.game.yourTurn = false;
                this.game.moved = false;
                this.startTimer();
                this.setBoardStatus();
            }
        })
    }

    setBoardStatus = () => {
        let miniBoard = ""
        if (this.game.player == 2) { //reverse table for player 2
            for (let i = 7; i >= 0; i--) {
                for (let j = 7; j >= 0; j--) {
                    miniBoard += "<label>" + this.game.boardState[i][j] + "</label>";
                }
            }
        }
        else {
            this.game.boardState.forEach(row => {
                row.forEach(field => {
                    miniBoard += "<label>" + field + "</label>";
                })
            });
        }
        this.ui.boardStatus.innerHTML = miniBoard
    }

    moveMepel = async (id, toX, toZ, newRow, newColumn) => {
        this.game.mepels.forEach(mepel => {
            if (mepel.mepelId == id) {
                mepel.column = newColumn;
                mepel.row = newRow;
                if ((mepel.color == 1 && mepel.row == 0) || (mepel.color == 2 && mepel.row == 7)) {//check queen condition
                    mepel.becomeQueen();
                }
                new TWEEN.Tween(mepel.position)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .to({ x: toX, z: toZ }, 600)
                    .start();
            }
        })
    }

    killMepelAndMove = async (killId, id, toX, toZ, newRow, newColumn) => {
        let mepelToMove;
        let mepelToKill;
        let index = -1;
        this.game.mepels.forEach(mepel => {
            if (mepel.mepelId == id) {
                mepel.column = newColumn;
                mepel.row = newRow;
                if ((mepel.color == 1 && mepel.row == 0) || (mepel.color == 2 && mepel.row == 7)) {//check queen condition
                    mepel.becomeQueen();
                }
                mepelToMove = mepel;
            }
            else if (mepel.mepelId == killId) {
                mepelToKill = mepel;
                index = this.game.mepels.indexOf(mepel);
            }
        })

        if (index > -1) {
            this.game.mepels.splice(index, 1);
        }

        let upAnimation = new TWEEN.Tween(mepelToMove.position)
            .easing(TWEEN.Easing.Cubic.Out)
            .to({ y: mepelToMove.position.y + 30 }, 200)
            .start();

        upAnimation.onComplete(() => {
            let moveAnimation = new TWEEN.Tween(mepelToMove.position)
                .easing(TWEEN.Easing.Cubic.Out)
                .to({ x: toX, z: toZ }, 400)
                .start();

            moveAnimation.onComplete(() => {
                let downAnimation = new TWEEN.Tween(mepelToMove.position)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .to({ y: mepelToMove.position.y - 30 }, 200)
                    .start();

                downAnimation.onComplete(() => {
                    let killAnimation = new TWEEN.Tween(mepelToKill.position)
                        .easing(TWEEN.Easing.Cubic.Out)
                        .to({ y: mepelToKill.position.y - 20 }, 600)
                        .start();
                    killAnimation.onComplete(() => {
                        this.game.scene.remove(mepelToKill);
                    });
                });
            });
        });
    }

    startTimer = () => {
        this.ui.addMist();
        this.ui.show(this.ui.dialog);
        this.ui.show(this.ui.counter);
        let secondsLeft = 30;
        this.ui.counter.innerText = secondsLeft;
        secondsLeft -= 1;

        this.timerInterval = setInterval(async () => {
            if (secondsLeft == 0) {
                clearInterval(this.timerInterval);
                const body = JSON.stringify({ player: this.game.player });
                const headers = { "Content-Type": "application/json" };
                await fetch("/win", { method: "post", headers, body });
            }
            else {
                this.ui.counter.textContent = secondsLeft;
                secondsLeft -= 1;
            }
        }, 1000);
    }

    win = async () => {
        this.ui.hide(this.ui.dialog);
        this.ui.hide(this.ui.counter);
        this.ui.addMist();

        this.ui.dialog.innerText = "YOU WIN!";
        this.ui.show(this.ui.dialog);
    }

    lose = async () => {
        this.ui.hide(this.ui.dialog);
        this.ui.hide(this.ui.counter);
        this.ui.addMist();

        this.ui.dialog.innerText = "YOU LOSE!";
        this.ui.show(this.ui.dialog);
    }
}

export default Net