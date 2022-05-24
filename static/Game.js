import Item from "./Item.js";
import Mepel from "./Mepel.js";

class Game {
    constructor() {
        this.scene = new THREE.Scene();
        this.mepels = [];
        this.blackTiles = [];
        this.id = 0;
        this.kill = 0;
        this.killed = false;
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

        // AXES
        // const axes1 = new THREE.AxesHelper(-1000)
        // const axes2 = new THREE.AxesHelper(1000)
        // this.scene.add(axes1)
        // this.scene.add(axes2)

        this.board = [
            // 1 - black, 0 - white (fields)
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

        this.boardState = [
            // 0 - empty, 1 - white, 2 - red (mepels)
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0],
        ];

        // MOVE - onClick on object - raycaster
        let selected = false;
        let object;
        let tileToKill = null;
        let killId = -1;
        let killAnimation = null;
        let mepel = null;
        let rowToClear;
        let columnToClear;

        window.addEventListener("mousedown", async(e) => {
            this.mouseVector.x = (e.clientX / window.innerWidth) * 2 - 1;
            this.mouseVector.y = -(e.clientY / window.innerHeight) * 2 + 1;
            this.raycaster.setFromCamera(this.mouseVector, this.camera);
            const intersects = this.raycaster.intersectObjects(this.scene.children);

            if (intersects.length > 0 && this.yourTurn) {
                object = intersects[0].object;
                if (mepel != null && mepel.isSelected) {
                    //if mepel to move is chosen
                    if (
                        object.constructor.name == "Item" &&
                        object.isHighlighted &&
                        this.boardState[object.row][object.column] == 0
                    ) {
                        killId = -1;
                        this.killed = false;
                        mepel.selected(false);
                        selected = false;

                        this.blackTiles.forEach((tile) => {
                            if (tile === object) {
                                if (tile.killId != -1) {
                                    this.mepels.forEach(async(m) => {
                                        if (m.id == tile.killId) {
                                            const index = this.mepels.indexOf(m);
                                            if (index > -1) {
                                                this.mepels.splice(index, 1);
                                            }
                                            killAnimation = new TWEEN.Tween(m.position)
                                                .easing(TWEEN.Easing.Cubic.Out)
                                                .to({ y: m.position.y - 20 }, 600);

                                            tileToKill = m;
                                            killId = m.id;
                                            tile.killId = -1;
                                            this.kill += 1;
                                            this.killed = true;
                                            if (this.kill == 8) {
                                                //win if all of enemy mepels are killed
                                                const body = JSON.stringify({ player: this.player });
                                                const headers = { "Content-Type": "application/json" };
                                                await fetch("/win", { method: "post", headers, body });
                                            }
                                        }
                                    });
                                }
                            }
                            tile.highlighted(false);
                        });

                        if (killId != -1) {
                            let mepelCopy = mepel;
                            this.boardState[tileToKill.row][tileToKill.column] = 0;
                            let upAnimation = new TWEEN.Tween(mepelCopy.position)
                                .easing(TWEEN.Easing.Cubic.Out)
                                .to({ y: mepelCopy.position.y + 30 }, 200)
                                .start();

                            upAnimation.onComplete(() => {
                                let moveAnimation = new TWEEN.Tween(mepelCopy.position)
                                    .easing(TWEEN.Easing.Cubic.Out)
                                    .to({ x: object.positionX, z: object.positionZ }, 400)
                                    .start();

                                moveAnimation.onComplete(() => {
                                    let downAnimation = new TWEEN.Tween(mepelCopy.position)
                                        .easing(TWEEN.Easing.Cubic.Out)
                                        .to({ y: mepelCopy.position.y - 30 }, 200)
                                        .start();

                                    downAnimation.onComplete(() => {
                                        killAnimation.start();
                                        killAnimation.onComplete(() => {
                                            this.scene.remove(tileToKill);
                                            console.log("KILL");
                                        });
                                    });
                                });
                            });
                        } else {
                            let moveAnimation = new TWEEN.Tween(mepel.position)
                                .easing(TWEEN.Easing.Cubic.Out)
                                .to({ x: object.positionX, z: object.positionZ }, 600)
                                .start();
                        }

                        mepel.row = object.row;
                        mepel.column = object.column;
                        if (
                            (mepel.color == 1 && mepel.row == 0) ||
                            (mepel.color == 2 && mepel.row == 7)
                        ) {
                            //check queen condition
                            mepel.becomeQueen();
                        }
                        this.boardState[rowToClear][columnToClear] = 0;
                        this.boardState[mepel.row][mepel.column] = mepel.color == 1 ? 1 : 2;

                        const headers = { "Content-Type": "application/json" };
                        let body = JSON.stringify({ boardState: this.boardState });
                        await fetch("/setBoardState", { method: "post", headers, body });

                        this.moved = true;

                        body = JSON.stringify({
                            x: object.positionX,
                            z: object.positionZ,
                            row: object.row,
                            column: object.column,
                            color: mepel.color,
                            id: mepel.id,
                            killId,
                            queen: mepel.type,
                        });
                        await fetch("/moveMepel", { method: "post", headers, body });

                        // if (killId == -1) {
                        //     this.yourTurn = false;
                        // }
                        this.yourTurn = false;
                        tileToKill = null;
                        mepel = null;
                    }
                } else {
                    //selecting mepel to move
                    if (object.constructor.name == "Mepel") {
                        mepel = object;
                        if (mepel.color == this.player) {
                            rowToClear = mepel.row;
                            columnToClear = mepel.column;
                            mepel.selected(true);
                            selected = true;

                            //mark possible moves
                            if (mepel.type == "queen") {
                                let right = this.checkField(mepel.row, mepel.column, "right", 1, -1, "normal");
                                let left = this.checkField(mepel.row,mepel.column,"left", 1, -1, "normal");
                                let rightDown = this.checkField(mepel.row,mepel.column, "right",1, -1, "queen");
                                let leftDown = this.checkField(mepel.row,mepel.column, "left", 1, -1,"queen");
                                if (!right && !left && !rightDown && !leftDown) {
                                    //if there are no possible moves - unselect
                                    mepel.selected(false);
                                    selected = false;
                                    mepel = null;
                                }
                            } else {
                                let right = this.checkField(mepel.row, mepel.column, "right", 1, -1, "normal");
                                let left = this.checkField(mepel.row,mepel.column,"left", 1, -1, "normal");
                                if (!right && !left) {
                                    //if there are no possible moves - unselect
                                    mepel.selected(false);
                                    selected = false;
                                    mepel = null;
                                }
                            }
                        }
                    }
                }
            }
        });
        this.render();
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
                            return this.checkField(row,column,direction,checkNumber + 1,mepel.id, mepelType);
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

    checkQueenMove = () => {
        row = mepelType == "queen" ? this.player == 1 ? row + 1 : row - 1 : this.player == 1 ?row - 1 : row + 1;
        column = direction == "right" ? column + 1 : column - 1;
        // if (mepelType == "queen") {
        //     this.checkField(row, column, direction, checkNumber, mepel.id, mepelType);
        // }
        if (row >= 0 && row < 8 && column >= 0 && column < 8 && checkNumber <= 2) {
            switch (this.boardState[row][column]) {
                case this.player: //your mepel
                    return false;
                case this.opponent: //opponent
                    this.mepels.forEach((mepel) => {
                        if (mepel.row == row && mepel.column == column) {
                            return this.checkField(row,column,direction,checkNumber + 1,mepel.id, mepelType);
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
    }

    createBoard = () => {
        const geometry = new THREE.BoxGeometry(50, 18, 50);
        const lightWood = new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            map: new THREE.TextureLoader().load("./textures/lightWood.png"),
        });

        let tile;
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] == 0) {
                    tile = new THREE.Mesh(geometry, lightWood);
                } else {
                    tile = new Item();
                    this.blackTiles.push(tile);
                }
                //tile.position.set(-175 + j * 50, -10, -175 + i * 50)
                tile.position.set(175 - j * 50, -10, 175 - i * 50);
                tile.row = i;
                tile.column = j;
                this.scene.add(tile);
            }
        }
    };

    createMepels = (boardState) => {
        let mepel;
        for (let i = 0; i < boardState.length; i++) {
            for (let j = 0; j < boardState[i].length; j++) {
                if (boardState[i][j] == 1) {
                    mepel = new Mepel("white");
                    mepel.position.set(175 - j * 50, 10, 175 - i * 50);
                    mepel.row = i;
                    mepel.column = j;
                    mepel.mepelId = this.id;
                    this.scene.add(mepel);
                    this.mepels.push(mepel);
                } else if (boardState[i][j] == 2) {
                    mepel = new Mepel("red");
                    mepel.position.set(175 - j * 50, 10, 175 - i * 50);
                    mepel.row = i;
                    mepel.column = j;
                    mepel.mepelId = this.id;
                    this.scene.add(mepel);
                    this.mepels.push(mepel);
                }
                this.id += 1;
            }
        }
        this.scene.add(mepel);
    };

    setPlayerPosition = (player) => {
        if (player == 2) {
            this.camera.position.set(0, 300, 400);
        } else {
            this.camera.position.set(0, 300, -400);
        }
        this.camera.lookAt(this.scene.position);
    };

    getCamera = () => {
        return this.camera;
    };

    getRenderer = () => {
        return this.renderer;
    };

    render = () => {
        TWEEN.update();
        requestAnimationFrame(this.render);
        this.renderer.render(this.scene, this.camera);
    };
}

export default Game;