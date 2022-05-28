import Item from "./Item.js";
import Mepel from "./Mepel.js";

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.mepels = [];
        this.blackTiles = [];
        this.kill = 0;
        this.moved = false;
        this.player = null;
        this.opponent = null;
        this.yourTurn = false;
        this.raycaster = new THREE.Raycaster();
        this.mouseVector = new THREE.Vector2();

        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        );
        this.camera.position.set(0, 300, 400);
        this.camera.lookAt(this.scene.position);

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setClearColor(0x000000);
        this.renderer.setSize(window.innerWidth, window.innerHeight);

        document.getElementById("root").append(this.renderer.domElement);

        window.onresize = () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        };

        this.board = [ // 1 - black, 0 - white (fields)
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ];

        this.createBoard();

        this.boardState = [ // 0 - empty, 1 - white, 2 - red (mepels)
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ];

        // MOVE - onClick on object
        let selected = false;
        let object = null;
        let killId = -1;
        let mepelToKill = null;
        let mepel = null;
        let rowToClear;
        let columnToClear;
        let win = false

        window.addEventListener("mousedown", async(e) => {
            this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0 && this.yourTurn) {
                object = intersects[0].object;
                //selecting mepel to move
                if (object.constructor.name == "Mepel") {
                    this.unselectAll()
                    mepel = object;
                    if (mepel.color == this.player) {
                        rowToClear = mepel.row;
                        columnToClear = mepel.column;
                        mepel.selected(true);
                        selected = true;

                        //mark possible moves
                        if (mepel.type == "queen") {
                            // let right = this.checkField(mepel.row, mepel.column, "right", 1, -1, "normal");
                            // let left = this.checkField(mepel.row,mepel.column,"left", 1, -1, "normal");
                            // let rightDown = this.checkField(mepel.row,mepel.column, "right",1, -1, "queen");
                            // let leftDown = this.checkField(mepel.row,mepel.column, "left", 1, -1,"queen");
                            let rightUp = this.checkQueenMove(mepel.row, mepel.column, "right", "up", -1);
                            let leftUp = this.checkQueenMove(mepel.row,mepel.column,"left", "up", -1);
                            let rightDown = this.checkQueenMove(mepel.row,mepel.column, "right","down", -1);
                            let leftDown = this.checkQueenMove(mepel.row,mepel.column, "left", "down", -1);
                        } else {
                            let right = this.checkField(mepel.row, mepel.column, "right", 1, -1, "normal");
                            let left = this.checkField(mepel.row,mepel.column,"left", 1, -1, "normal");
                            if (!right && !left) { //if there are no possible moves - unselect
                                mepel.selected(false);
                                selected = false;
                                mepel = null;
                            }
                        }
                    }
                }
                else if (mepel != null && mepel.isSelected) { //if mepel to move is chosen
                    if (object.constructor.name == "Item" && object.isHighlighted && this.boardState[object.row][object.column] == 0) {
                        killId = -1;
                        mepel.selected(false);
                        selected = false;
                        this.yourTurn = false;

                        this.blackTiles.forEach((tile) => {
                            if (tile === object) {
                                if (tile.killId != -1) {
                                    this.mepels.forEach(async(m) => {
                                        if (m.mepelId == tile.killId) {
                                            const index = this.mepels.indexOf(m);
                                            if (index > -1) {
                                                this.mepels.splice(index, 1);
                                            }
                                            mepelToKill = m;
                                            killId = m.mepelId;
                                            this.kill += 1;
                                            if (this.kill == 8) { //win if all of enemy mepels are killed
                                                win = true
                                            }
                                        }
                                    });
                                }
                            }
                            tile.highlighted(false);
                            tile.killId = -1;
                        });

                        if (killId != -1) {
                            await this.killAndMove(mepel, mepelToKill, object)
                        } else {
                            new TWEEN.Tween(mepel.position)
                                .easing(TWEEN.Easing.Cubic.Out)
                                .to({ x: object.position.x, z: object.position.z }, 600)
                                .start();
                        }

                        mepel.row = object.row;
                        mepel.column = object.column;
                        if ((mepel.color == 1 && mepel.row == 0) || (mepel.color == 2 && mepel.row == 7)) {//check queen condition
                            mepel.becomeQueen();
                        }
                        this.boardState[rowToClear][columnToClear] = 0;
                        this.boardState[mepel.row][mepel.column] = mepel.color == 1 ? 1 : 2;

                        this.moved = true;

                        const headers = { "Content-Type": "application/json" };
                        let body = JSON.stringify({
                            x: object.position.x,
                            z: object.position.z,
                            row: object.row,
                            column: object.column,
                            color: mepel.color,
                            id: mepel.mepelId,
                            killId,
                            boardState: this.boardState
                        });
                        await fetch("/moveMepel", { method: "post", headers, body });

                        mepel = null;

                        if (win) {
                            const body = JSON.stringify({ player: this.player });
                            const headers = { "Content-Type": "application/json" };
                            await fetch("/win", { method: "post", headers, body });
                        }
                    }
                } 
            }
        });

        this.render();
    } //end of constructor

    killAndMove = async (mepel, mepelToKill, tile) => {
        this.boardState[mepelToKill.row][mepelToKill.column] = 0;
        let upAnimation = new TWEEN.Tween(mepel.position)
            .easing(TWEEN.Easing.Cubic.Out)
            .to({ y: mepel.position.y + 30 }, 200)
            .start();

        upAnimation.onComplete(() => {
            let moveAnimation = new TWEEN.Tween(mepel.position)
                .easing(TWEEN.Easing.Cubic.Out)
                .to({ x: tile.position.x, z: tile.position.z }, 400)
                .start();

            moveAnimation.onComplete(() => {
                let downAnimation = new TWEEN.Tween(mepel.position)
                    .easing(TWEEN.Easing.Cubic.Out)
                    .to({ y: mepel.position.y - 30 }, 200)
                    .start();

                downAnimation.onComplete(() => {
                    let killAnimation = new TWEEN.Tween(mepelToKill.position)
                        .easing(TWEEN.Easing.Cubic.Out)
                        .to({ y: mepelToKill.position.y - 20 }, 600)
                        .start();
                    killAnimation.onComplete(() => {
                        this.scene.remove(mepelToKill);
                        mepelToKill = null;
                    });
                });
            });
        });
    }

    unselectAll = () => {
        this.mepels.forEach(m => {
            if (m.isSelected) {
                m.selected(false)
            }
        });
        this.blackTiles.forEach(tile => {
            if (tile.isHighlighted) {
                tile.highlighted(false)
            }
        });
    }

    checkField = (row, column, direction, checkNumber, killId, mepelType) => {
        row = mepelType == "queen" ? this.player == 1 ? row + 1 : row - 1 : this.player == 1 ?row - 1 : row + 1;
        column = direction == "right" ? column + 1 : column - 1;
        if (row >= 0 && row < 8 && column >= 0 && column < 8 && checkNumber <= 2) {
            switch (this.boardState[row][column]) {
                case this.player: //your mepel
                    return false;
                case this.opponent: //opponent
                    this.mepels.forEach((mepel) => {
                        if (mepel.row == row && mepel.column == column) {
                            return this.checkField(row,column,direction,checkNumber + 1,mepel.mepelId, mepelType);
                        }
                    });
                    return true;
                case 0: //empty field
                    this.blackTiles.forEach((tile) => {
                        if (tile.row == row && tile.column == column) {
                            if (tile.row == row && tile.column == column) {
                                tile.highlighted(true);
                                if (checkNumber == 2) {
                                    tile.killId = killId;
                                }
                            }
                        }
                    });
                    return true;
                case -1: //out of the board
                    return false;
            }
        }
        return false;
    };

    checkQueenMove = (row, column, rightOrLeft, upOrDown, killId) => {
        row = upOrDown == "up" ? row + 1 : row - 1;
        column = rightOrLeft == "right" ? column + 1 : column - 1;
        if (row >= 0 && row < 8 && column >= 0 && column < 8) {
            switch (this.boardState[row][column]) {
                case this.player: //your mepel - blocks queen
                    return false;
                case this.opponent: //opponent
                    if (killId == -1) { //two opponent's mepels block queen
                        this.mepels.forEach((mepel) => {
                            if (mepel.row == row && mepel.column == column) {
                                this.checkQueenMove(row, column, rightOrLeft, upOrDown, mepel.mepelId);
                            }
                        });
                    }
                    return false;
                case 0: //empty field
                    this.blackTiles.forEach((tile) => {
                        if (tile.row == row && tile.column == column) {
                            tile.highlighted(true);
                            if (killId != -1) {
                                tile.killId = killId;
                            }
                        }
                    });
                    this.checkQueenMove(row, column, rightOrLeft, upOrDown, -1);
                    return true;
                case -1: //out of the board
                    return false;
            }
        }
        return false;
    }

    createBoard = () => {
        const geometry = new THREE.BoxGeometry(50, 18, 50);
        const lightWood = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load("https://i.imgur.com/Z5fkFZp.png"),
        });

        let tile;
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] == 0) { //white field
                    tile = new THREE.Mesh(geometry, lightWood);
                } else { //black field
                    tile = new Item(i ,j);
                    this.blackTiles.push(tile);
                }
                tile.position.set(175 - j * 50, -10, 175 - i * 50);
                this.scene.add(tile);
            }
        }
    };

    createMepels = () => {
        let mepel;
        let id = 0;
        for (let i = 0; i < this.boardState.length; i++) {
            for (let j = 0; j < this.boardState[i].length; j++) {
                if (this.boardState[i][j] != 0) {
                    mepel = new Mepel(id++, this.boardState[i][j], i, j);
                    mepel.position.set(175 - j * 50, 10, 175 - i * 50);
                    this.scene.add(mepel);
                    this.mepels.push(mepel);
                } 
            }
        }
    };

    setPlayerPosition = () => {
        this.camera.position.set(0, 300, this.player == 2 ? 400 : -400);
        this.camera.lookAt(this.scene.position);
    };

    render = () => {
        TWEEN.update();
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    };
}

export default Game;