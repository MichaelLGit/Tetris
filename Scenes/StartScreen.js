import { Button, Container, Input } from "../Engine/Elements.js";
import { MLColor, Scene } from "../Engine/GameEngine.js";


export class StartScreen extends Scene {


    constructor(name) {
        super(name)
    }

    setGameview(gv) {
        super.setGameview(gv);
    }


    onInit = () => {
        this.gameview.socketsys.OnMessage(this, 'test-message', (text) => {console.log(text)})

        let marg = { t: 10, r: 20, b: 10, l: 20 }

        let maincontainer = new Container(this.gameview);
        maincontainer.style.position = { x: 0, y: 0 }
        maincontainer.style.bgcolor = "rgba(0,0,0,.0)"
        maincontainer.style.size = { x: this.gameview.style.size.x, y: this.gameview.style.size.y }

        let startgame = new Button(this.gameview);
        startgame.style.text = 'Start';
        startgame.style.size = { x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5 };
        startgame.style.margin = { ...marg };
        startgame.style.bgcolor = "#c9a";
        startgame.style.fontSize = 150;
        startgame.activestyle.bgcolor = MLColor.darken(startgame.style.bgcolor, 14);
        startgame.addEventHandler(this, 'mousedown', (e, args) => {
            if (startgame.isInside(e.clientX, e.clientY)) {
                console.log('startgame Down');
                console.log(startgame.style.position.x)
                startgame.active = true;
            }
        })
        startgame.addEventHandler(this, 'mouseup', (e, args) => {
            if (startgame.isInside(e.clientX, e.clientY) && startgame.active == true) {
                console.log('move to new scene');
                startgame.active = false;
                this.gameview.SetMainScene('base');
                return;
            }
        })

        let createroom = new Input(this.gameview);
        createroom.style.text = 'Create';
        createroom.style.size = { x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5 };
        createroom.style.margin = { ...marg };
        createroom.style.bgcolor = "#5da";
        createroom.activestyle.bgcolor = MLColor.darken(createroom.style.bgcolor, 30);
        createroom.style.fontSize = 150;
        createroom.addBasicEvents(this);

        createroom.OnSubmit(this, args => {
            this.gameview.socketsys.SendMessage('create-room', createroom.style.text);
            createroom.clearSubmit();
        })

        let roominput = new Input(this.gameview);
        roominput.style.size = { x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5 };
        roominput.style.margin = { ...marg };
        roominput.style.bgcolor = "#77c";
        roominput.activestyle.bgcolor = MLColor.darken(roominput.style.bgcolor, 30)
        roominput.style.fontSize = 150;
        roominput.addBasicEvents(this)

        roominput.OnSubmit(this, args => {
            this.gameview.socketsys.SendMessage('join-room', roominput.style.text);
            roominput.clearSubmit()
        })

        let testinput = new Input(this.gameview);
        testinput.style.size = { x: this.gameview.style.size.x / 1.1, y: this.gameview.style.size.y / 5 };
        testinput.style.margin = { ...marg };
        testinput.style.bgcolor = "#ddd";
        testinput.activestyle.bgcolor = MLColor.darken(testinput.style.bgcolor, 30)
        testinput.style.fontSize = 150;

        testinput.addEventHandler(this, 'mousedown', (e, args) => {
            if (testinput.isInside(e.clientX, e.clientY)) {
                testinput.active = true;
            }else{
                testinput.active = false;
            }
        })
        testinput.addEventHandler(this, 'mouseup', (e, args) => {
            if (!testinput.isInside(e.clientX, e.clientY)) {
                testinput.active = false;
            }
        })

        testinput.OnSubmit(this, args => {
            console.log(testinput.style.text);
            this.gameview.socketsys.SendMessage('test-message', testinput.style.text);
            testinput.clearSubmit()
        })
    
        testinput.addEventHandler(this, 'keydown', (e, args) => {
            if (testinput.active) {
                switch (true) {
                    case e.key == 'Backspace'://BACKSPACE
                    testinput.style.text = testinput.style.text.length > 0 ? testinput.style.text.substring(0, testinput.style.text.length - 1) : testinput.style.text//ATTENTION
                        break;
                    case e.which >= 112 && e.which <= 123://Function KEYS
                        break;
                    case e.key == 'Tab'://TAB
                        break;
                    case e.key == 'CapsLock'://CAPS LOCK
                        break;
                    case e.key == 'Enter'://ENTER
                    testinput.Submit();
                        break;
                    case e.key.length == 1 && testinput.style.text.length < 6://DEFAULT
                        if(e.key.match(/[\d|a-z]/i)){
                            testinput.style.text += e.key.toLowerCase();
                        }
                        break;
                }
            }
        })

        maincontainer.elems.push(startgame)
        maincontainer.elems.push(createroom)
        maincontainer.elems.push(roominput)
        maincontainer.elems.push(testinput)

        this.guilayer.elems.push(maincontainer)

        this.gameview.render();
    }

}