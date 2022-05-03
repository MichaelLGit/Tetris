import * as Engine from './Engine/GameEngine.js';
import { BaseGameScene } from './Scenes/BaseGame.js';
import { StartScreen } from './Scenes/StartScreen.js';


let gameboard;
//{elems: [{elems: [{elems: []}], direction: "horizontal"}], direction: "vertical"}
function OnLoad() {
    gameboard = new Engine.GameView();
    // gameboard.debugmode = true;
    
    let startScene = new StartScreen('start');
    startScene.setGameview(gameboard);
    startScene.SetAsMainScene();
    
    let mainscene = new BaseGameScene('base');
    mainscene.setGameview(gameboard);
    mainscene.AddScene();

    gameboard.LoopScene();
}



document.body.onload = OnLoad