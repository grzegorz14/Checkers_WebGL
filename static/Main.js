import Game from "./Game.js"
import Net from "./Net.js"
import Ui from "./Ui.js"

let game
let net
let ui

window.onload = () => {
    game = new Game()
    ui = new Ui()
    net = new Net(game, ui)

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        game.getCamera().aspect = window.innerWidth / window.innerHeight;
        game.getCamera().updateProjectionMatrix();
        game.getRenderer().addEventListener.setSize(window.innerWidth, window.innerHeight);
    }
}