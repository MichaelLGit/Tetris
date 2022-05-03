import * as Engine from '../Engine/GameEngine.js';
import { Button, Container } from '../Engine/Elements.js';
import { randomPiece, pieces, pickpiece } from '../shapes.js';

class Block extends Container {

    constructor(gameview = Engine.GameView, style = { size: { x: 32, y: 32 }, margin: { t: 1, r: 1, b: 1, l: 1 }, bgcolor: "#ddd" }, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction);
        this.style.moveable = false;
        this.style.playpiece = false;
        this.activestyle.bgcolor = Engine.MLColor.darken(this.style.bgcolor, 30);
        this.addEvent('mouseup', () => { console.log('up') })
        this.addEvent('mousedown', () => { console.log('down') })
    }

}

class Piece {
    gameview = Engine.GameView;
    piece = {}
    position = { x: 0, y: 0 }
    selectedshape = 0;
    hasMovedManually = false;

    constructor(gameview, pos, randomness, shape = null) {
        this.gameview = gameview;
        this.position = pos;

        this.piece = shape == null ? randomPiece(randomness) : pickpiece(randomness, shape)

        let b = new Block(this.gameview);
        b.style.playpiece = true;
        b.style.moveable = true;
        b.style.bgcolor = this.piece.bgcolor;
        b.activestyle.bgcolor = Engine.MLColor.darken(b.style.bgcolor, 14);

        this.setPositive(b);
        this.setpiececalled = true;
    }

    setPositive(item) {
        for (let i = 0; i < this.piece.shape.length; i++) {
            let shape = this.piece.shape[i];
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (shape[y][x] == 1) {
                        shape[y][x] = item;
                    }
                }
            }
        }
    }

    setMoveable(bool) {
        let selected = this.getSelected();
        for (let y = 0; y < selected.length; y++) {
            for (let x = 0; x < selected[y].length; x++) {
                if (selected[y][x] != 0) {
                    selected[y][x].style.moveable = bool;
                }
            }
        }
    }

    setPlaypiece(bool) {
        let selected = this.getSelected();
        for (let y = 0; y < selected.length; y++) {
            for (let x = 0; x < selected[y].length; x++) {
                if (selected[y][x] != 0) {
                    selected[y][x].style.playpiece = bool;
                }
            }
        }
    }

    getSelected() {
        return this.piece.shape[this.selectedshape]
    }

    rotateRight() {
        this.selectedshape = this.selectedshape + 1 > this.piece.shape.length - 1 ? 0 : this.selectedshape + 1;
        console.log(this.selectedshape)
    }

    checkRight() {
        let checknum = this.selectedshape + 1 > this.piece.shape.length - 1 ? 0 : this.selectedshape + 1;
        return this.piece.shape[checknum]
    }

    rotateLeft() {
        this.selectedshape = this.selectedshape - 1 < 0 ? this.piece.shape.length - 1 : this.selectedshape - 1;
        console.log(this.selectedshape)
    }

    checkLeft() {
        let checknum = this.selectedshape - 1 < 0 ? this.piece.shape.length - 1 : this.selectedshape - 1;
        return this.piece.shape[checknum]
    }

}

export class BaseGameScene extends Engine.Scene {

    lengthboard = 24;
    widthboard = 12;

    score = 0;

    timetonextblock = { currentiteration: 20, interval: 20 };
    gamerunning = false;

    FallingPieces = [];
    randomness = { 'l': 1, 'rl': 1, 'long': 1, 's': 1, 'rs': 1, 't': 1, 'block': 1 }

    constructor(name) {
        super(name);
    }

    // StartGame(){

    // }


    onInit() {
        console.log('INIT');

        let timer = { currenttime: 0, interval: 700 };

        let maincontainer = new Container(this.gameview, null, [], 'horizontal');
        let gamecontainer = new Container(this.gameview);
        for (let y = 0; y < this.lengthboard; y++) {
            let horizontalcontainer = new Container(this.gameview, null, [], 'horizontal');
            horizontalcontainer.style.margin.t = 0;
            horizontalcontainer.style.margin.b = 0;
            for (let x = 0; x < this.widthboard; x++) {
                horizontalcontainer.elems.push(new Block(this.gameview));
            }
            gamecontainer.elems.push(horizontalcontainer);
        }
        
        let buttons = new Container(this.gameview);
        let startbtn = new Button(this.gameview);
        startbtn.style.size = {x: 100 ,y: 100};
        startbtn.style.bgcolor = '#b35';
        startbtn.activestyle.bgcolor =  Engine.MLColor.darken(startbtn.style.bgcolor, 14);
        
        buttons.elems.push(startbtn);
        
        maincontainer.elems.push(gamecontainer);
        maincontainer.elems.push(buttons);
        maincontainer.style.size = {x: this.gameview.style.size.x, y: this.gameview.style.size.y}

        this.guilayer.elems.push(maincontainer);

        startbtn.addEventHandler(this, 'mousedown',(e, args) => {
            startbtn.active = true;
        });
        startbtn.addEventHandler(this, 'mouseup',(e, args) => { 
            if(startbtn.isInside(e.clientX, e.clientY) && startbtn.active == true){
                startbtn.active = false;
                this.StartGame();
            }
        });

        //Check 
        this.addEventHandler("keydown", this.KeyDown, this)



        this.onStart = () => {
            console.log('onStart()');
        }

        this.onUpdate = (sincelast) => {
        }

        this.onAfterUpdate = (sincelast) => {
            timer.currenttime += sincelast;
            if (this.gamerunning == true){
                if (timer.currenttime >= timer.interval) {
                    this.MoveDownAll(sincelast);
                    this.timetonextblock.currentiteration++;
                    if (this.timetonextblock.currentiteration >= this.timetonextblock.interval) {
    
                        let piece = new Piece(this.gameview, { x: (this.widthboard / 2) - 1, y: -1 }, this.randomness)
                        piece.setMoveable(true);
                        piece.setPlaypiece(true);
                        this.FallingPieces.push({piece: piece, control: undefined});
                        this.timetonextblock.currentiteration = 0;
                    }
                }
                this.CleanField();
                this.PlacePieces();
            }
            timer.currenttime %= timer.interval;
        }

        this.gameview.render();
    }

    KeyDown(e){
        switch(e.key){
            case ' ':
                this.logScene(e);
                break;
            case 'ArrowRight':
                this.MoveRight(e);
                break;
            case 'ArrowLeft':
                this.MoveLeft(e);
                break;
            case 'ArrowDown':
                this.MoveDown(e);
                break;
            case 'ArrowUp':
                this.Drop(e);
                break;
            case 'x':
                this.RotateRight(e);
                break;
            case 'z':
                this.RotateLeft(e);
                break;
        }
    }

    StartGame(){
        this.gamerunning = true;
    }

    PauseGame(){
        this.gamerunning = false;
    }

    setGameview(gv) {
        super.setGameview(gv);
    }

    logScene() {
        let str = "";
        for (let y = 0; y < this.guilayer.elems[0].elems[0].elems.length; y++) {
            for (let x = 0; x < this.guilayer.elems[0].elems[0].elems[y].elems.length; x++) {
                let b = this.guilayer.elems[0].elems[0].elems[y].elems[x];
                if (b.style.playpiece) {
                    str = str.concat("X ");
                } else {
                    str += "O ";
                }
            }
            str += "\n";
        }
        // console.log(str);
        console.log(`baseX: ${this.guilayer.elems[0].elems[0].style.size.x}, baseY: ${this.guilayer.elems[0].elems[0].style.size.y}`)
    }

    MoveLeft(e) {
        let piece = this.FallingPieces[0].piece;
        if (piece == undefined) { return };
        let p = piece.getSelected();
        let moveleft = true;
        for (let y = 0; y < p.length; y++) {
            for (let x = 0; x < p[y].length; x++) {
                if (p[y][x] != 0) {
                    let sideblock;
                    try {
                        sideblock = this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (p.length - 1)].elems[(piece.position.x + x) - 1];
                    } catch {
                        sideblock = { style: { playpiece: false, moveable: false } }
                    }
                    if ((piece.position.x + x) - 1 >= 0 && !(sideblock.style.playpiece == true && sideblock.style.moveable == false)) {
                        continue
                    } else {
                        moveleft = false;
                    }
                    break;
                }
            }
        }
        if (moveleft == true) {
            this.CleanField();
            piece.position.x -= 1;
        }

    }

    MoveRight(e) {
        let piece = this.FallingPieces[0].piece;
        if (piece == undefined) { return };
        let p = piece.getSelected();
        let moveright = true;
        for (let y = 0; y < p.length; y++) {
            for (let x = p[y].length - 1; x >= 0; x--) {
                if (p[y][x] != 0) {
                    let sideblock;
                    try {
                        sideblock = this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (p.length - 1)].elems[(piece.position.x + x) + 1];
                    } catch {
                        sideblock = { style: { playpiece: false, moveable: false } }
                    }
                    if ((piece.position.x + x) + 1 <= this.guilayer.elems[0].elems[0].elems[0].elems.length - 1 && !(sideblock.style.playpiece == true && sideblock.style.moveable == false)) {
                        continue
                    } else {
                        moveright = false;
                    }
                    break;
                }
            }
        }
        if (moveright == true) {
            this.CleanField();
            piece.position.x += 1;
        }

    }

    MoveDown() {
        let piece = this.FallingPieces[0].piece;
        if (piece == undefined || null) { return }
        piece.hasMovedManually = true;
        this.CleanField();
        let lockpiece = this.CheckAndMoveDown(piece);
        if (lockpiece != null) {
            this.LockPiece(0);
        }
    }

    MoveDownAll(sincelast) {
        for (let i = this.FallingPieces.length - 1; i >= 0; i--) {
            let piece = this.FallingPieces[i].piece;
            if (piece == undefined || null) { return }
            if (piece.hasMovedManually == true) {
                piece.hasMovedManually = false;
            } else {
                let lockpiece = this.CheckAndMoveDown(piece);
                //Somethin here with the lockage and such?
                if (lockpiece != null) {
                    this.LockPiece(i);
                }

            }
        }
    }

    RotateRight() {
        console.log('rotate R')
        let piece = this.FallingPieces[0].piece;
        let testpiece = piece.checkRight();
        for (let y = testpiece.length - 1; y >= 0; y--) {
            for (let x = 0; x < testpiece[y].length; x++) {

                let p = testpiece[y][x];
                if (p != 0 && (piece.position.y + y) - (testpiece.length - 1) >= 0) {
                    let block = this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (testpiece.length - 1)].elems[piece.position.x + x];
                    if (block.style.moveable == false && block.style.playpiece == true) {
                        console.log(block)
                        return
                    }
                }

            }
        }
        piece.rotateRight();
    }

    RotateLeft() {
        console.log('rotate L')
        let piece = this.FallingPieces[0].piece;
        let testpiece = piece.checkLeft();
        for (let y = testpiece.length - 1; y >= 0; y--) {
            for (let x = 0; x < testpiece[y].length; x++) {

                let p = testpiece[y][x];
                if (p != 0 && (piece.position.y + y) - (testpiece.length - 1) >= 0) {
                    let block = this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (testpiece.length - 1)].elems[piece.position.x + x];
                    if (block.style.moveable == false && block.style.playpiece == true) {
                        console.log(block)
                        return
                    }
                }

            }
        }
        piece.rotateLeft();
    }

    Drop() {

    }

    CleanField() {
        for (let y = 0; y < this.guilayer.elems[0].elems[0].elems.length; y++) {
            for (let x = 0; x < this.guilayer.elems[0].elems[0].elems[y].elems.length; x++) {
                let block = this.guilayer.elems[0].elems[0].elems[y].elems[x];
                if (block.style.moveable == true) {
                    this.guilayer.elems[0].elems[0].elems[y].elems[x] = new Block(this.gameview);
                }
            }
        }
    }

    PlacePieces() {
        for (let i = 0; i < this.FallingPieces.length; i++) {
            let piece = this.FallingPieces[i].piece;
            for (let y = piece.getSelected().length - 1; y >= 0; y--) {
                for (let x = 0; x < piece.getSelected()[y].length; x++) {

                    let p = piece.getSelected()[y][x];
                    let b = new Block(this.gameview);
                    b.style = {...p.style};
                    if (p != 0 && (piece.position.y + y) - (piece.getSelected().length - 1) >= 0) {
                        this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (piece.getSelected().length - 1)].elems[piece.position.x + x] = b;
                    }

                }
            }
        }
    }

    RemovePiece(piece) {
        for (let y = piece.getSelected().length - 1; y >= 0; y--) {
            for (let x = 0; x < piece.getSelected()[y].length; x++) {

                let p = piece.getSelected()[y][x];
                if (p != 0 && (piece.position.y + y) - (piece.getSelected().length - 1) >= 0) {
                    this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (piece.getSelected().length - 1)].elems[piece.position.x + x] = new Block(this.gameview);
                }

            }
        }
    }

    CheckAndMoveDown(piece) {
        let p = piece.getSelected()
        for (let x = 0; x < p[0].length; x++) {
            for (let y = p.length - 1; y >= 0; y--) {
                if (p[y][x] != 0) {
                    if (this == undefined) {
                        console.log(this);
                    }
                    let checky = ((piece.position.y + y) - (p.length - 1) + 1);
                    if (checky < 0) { break };
                    if (this.guilayer.elems[0].elems[0].elems[checky] == undefined) {
                        return piece;
                    }
                    let underblock = this.guilayer.elems[0].elems[0].elems[checky].elems[piece.position.x + x];
                    if ((underblock.style.playpiece == true && underblock.style.moveable == false)) {
                        console.log(piece)
                        return piece;
                    }
                    break;
                }
            }
        }
        // if (b != undefined && (b.style.playpiece == true && b.style.moveable == false)) {
        //     return piece
        // }


        piece.position.y += 1;
        return null;
    }

    LockPiece(num) {
        console.log('lock');
        let piece = this.FallingPieces[num].piece;
        piece.setMoveable(false);

        for (let y = piece.getSelected().length - 1; y >= 0; y--) {
            for (let x = 0; x < piece.getSelected()[y].length; x++) {
                let b = piece.getSelected()[y][x];
                if (b != 0 && (piece.position.y + y) - (piece.getSelected().length - 1) >= 0) {
                    let placeblock = new Block(this.gameview)
                    placeblock.style = { ...b.style };
                    this.guilayer.elems[0].elems[0].elems[(piece.position.y + y) - (piece.getSelected().length - 1)].elems[piece.position.x + x] = placeblock;
                }
            }
        }
        let checkdata = { posy: this.FallingPieces[num].piece.position.y, height: piece.getSelected().length };
        this.FallingPieces.splice(num, 1);
        this.CheckLines(checkdata.posy, checkdata.height);
        this.timetonextblock.currentiteration = this.timetonextblock.interval;
    }

    CheckLines(posy, height) {
        let removeRows = []
        let addrow = true;
        for (let y = height; y >= 0; y--) {
            let row = this.guilayer.elems[0].elems[0].elems[(posy + y) - height]
            if (row == undefined) { continue }
            addrow = true;
            for (let x = 0; x < row.elems.length; x++) {
                let block = row.elems[x]
                if (block.style.playpiece != true) {
                    addrow = false;
                    break;
                }
            }
            if (addrow == true) {
                removeRows.push((posy + y) - height)
            }
        }
        //Remove Rows and move shit down
        this.ScoreLines(removeRows);
    }

    ScoreLines(indices) {
        for (let i = 0; i < indices.length; i++) {
            let row = this.guilayer.elems[0].elems[0].elems[indices[i]];
            for (let x = 0; x < row.elems[0].elems.length; x++) {
                row.elems[x] = new Block(this.gameview);
            }
        }

        let amount = 1;

        for (let y = indices[0]; y >= 0; y--) {
            if (indices[amount] != undefined) {
                if (indices[amount] == y) {
                    console.log(`${y} == ${indices[amount]}: increase amount to ${amount + 1}`);
                    amount += 1;
                }
            }
            let row = this.guilayer.elems[0].elems[0].elems[y - 1];
            let newrow;
            if (row == undefined) {
                newrow = new Container(this.gameview, null, [], 'horizontal');
                newrow.style.margin.t = 0;
                newrow.style.margin.b = 0;
                for (let x = 0; x < this.widthboard; x++) {
                    newrow.elems.push(new Block(this.gameview));
                }
            } else {
                newrow = new Container(this.gameview, null, [], 'horizontal');
                newrow.style.margin.t = 0;
                newrow.style.margin.b = 0;
                for (let x = 0; x < this.widthboard; x++) {
                    let newblock = new Block(this.gameview);
                    newblock.style = { ...row.elems[x].style };
                    newrow.elems.push(newblock);
                }
            }
            this.guilayer.elems[0].elems[0].elems[(y - 1) + amount] = newrow;
        }

        let points = 0;
        if (indices.length < 1) { return }
        switch (indices.length) {
            case 1:
                points += 1000;
                break;
            case 2:
                points += 1500;
                break;
            case 3:
                points += 2500;
                break;
            case 4:
                points += 4500;
                break;
        }
        this.score += points;
        console.log(this.score);
    }

}