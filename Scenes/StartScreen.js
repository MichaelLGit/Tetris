import { Button, Container, Input } from "../Engine/Elements.js";
import { Scene } from "../Engine/GameEngine.js";


export class StartScreen extends Scene{

    constructor(name){
        super(name)
    }

    setGameview(gv){
        super.setGameview(gv);
    }

    onInit = () => {

        let marg = { t: 5, r: 5, b: 5, l: 5}

        let maincontainer = new Container(this.gameview);
        maincontainer.style.position = {x: 0, y: 0}
        maincontainer.style.bgcolor = "rgba(0,0,0,.0)"
        maincontainer.style.size = {x: this.gameview.style.size.x, y: this.gameview.style.size.y}

        let startgame = new Button(this.gameview);
        startgame.style.text = 'Start';
        startgame.style.size = {x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5};
        startgame.style.margin = marg;
        startgame.style.bgcolor = "#c9a";
        startgame.activestyle.bgcolor = "#a78";
        startgame.addEvent('fullclick', (e, args) => {
            console.log('fullclick')
            console.log(args);
            if(args.inside == true){
                console.log('move to new scene');
                this.gameview.SetMainScene('base');
            }
        }, this)

        let createroom = new Button(this.gameview);
        createroom.style.text = 'Create';
        createroom.style.size = {x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5};
        createroom.style.margin = marg;
        createroom.style.bgcolor = "#5da";
        createroom.addEvent('mouseup', (e, args) => {
            if(args.inside == true){
                //console.log('CREATING ROOM');
            }
        }, this)

        let roominput = new Input(this.gameview);
        roominput.style.size = {x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5};
        roominput.style.margin = marg;
        roominput.style.bgcolor = "#77c";
        roominput.addEvent('mousedown', (e, args) => {
            if(args.inside == true){
                // console.log('SELECTED INPUT');
            }
        }, this)

        maincontainer.elems.push(startgame)
        maincontainer.elems.push(createroom)
        maincontainer.elems.push(roominput)

        this.guilayer.elems.push(maincontainer)

        this.gameview.render();
    }

}