import Game from "./Game.js";
import Net from "./Net.js";
import Ui from "./Ui.js";

window.onload = () => {
    let game = new Game();
    let ui = new Ui();
    let net = new Net(game, ui);

    window.addEventListener('resize', onWindowResize, false);

    function onWindowResize() {
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        game.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}