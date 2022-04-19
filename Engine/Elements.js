import { GameView } from "./GameEngine.js";

export class EventObject {

    gameview = GameView
    events = { leftmouseheld: false }

    constructor(gameview) {
        this.gameview = gameview;
    }
    
    addEvent(name, func, context, args = {}) {
        if (this.events[name] == null || undefined) {
            this.events[name] = {};
        }
        this.events[name].func = func;
        this.events[name].args = args;
        this.events[name].context = context;
    }

}

export class GuiObject extends EventObject {

    style = { size: { x: 0, y: 0 }, margin: { t: 1, r: 1, b: 1, l: 1 }, padding: { t: 0, r: 0, b: 0, l: 0 }, display: 'block', bgcolor: 'rgba(0,0,0,0)' };
    collstyledata = {};
    elems = []

    constructor(gameview, style = null, elems = [], direction = 'vertical') {
        super(gameview)
        if (style != null || undefined) this.style = style;
        this.elems = elems;
        this.style.direction = direction;

    }
}

export class GuiLayer {

    gameview = GameView;
    elems = [];
    style = { size: { x: 0, y: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 }, display: 'absolute' }

    constructor(gameview, style = null, elems = [], direction = 'vertical') {
        this.gameview = gameview
        elems = elems;

        if (style != null || undefined) this.style = style;

        this.style.size.x = gameview.style.size.x;
        this.style.size.y = gameview.style.size.y;
    }
}

export class Container extends GuiObject {

    active = false;
    activestyle = {};

    constructor(gameview, style = null, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction)
        if(style !== null){
            this.style = style;
        }
        if (this.style.text == null || this.style.text == undefined) {
            this.style.text = '';
        }
    }

    render() {
        let addstyle = {};
        this.copystyle(addstyle, this.style);
        if (this.activestyle != {} && this.events.active == true) {
            this.copystyle(addstyle, this.activestyle);
        }
        let gctx = this.gameview.ctx;
        gctx.beginPath();
        gctx.rect((this.gameview.style.position.x + this.collstyledata.position.x) + addstyle.margin.l,
            (this.gameview.style.position.y + this.collstyledata.position.y) + addstyle.margin.t,
            addstyle.size.x, addstyle.size.y);
        gctx.fillStyle = addstyle.bgcolor;
        gctx.fill();

        if(this.gameview.debugmode === true){
            gctx.beginPath();
            gctx.lineWidth = '1';
            gctx.strokeStyle = this.style.direction === 'horizontal'? '#f00' : '#00f';
            gctx.rect((this.gameview.style.position.x + this.collstyledata.position.x) + addstyle.margin.l,
            (this.gameview.style.position.y + this.collstyledata.position.y) + addstyle.margin.t,
            addstyle.size.x, addstyle.size.y)
            gctx.stroke()
        }
    }

    copystyle(style1, style2) {
        for (let key in style2) {
            if (style2[key] instanceof Object) {
                if(style1[key] == undefined){
                    style1[key] = {};
                }
                this.copystyle(style1[key], style2[key]);
            } else {
                style1[key] = style2[key]
            }
        }
    }

    replaceStyle(target, acstyle) {
        for (let key in acstyle) {
            target[key] = acstyle[key];
        }
    }

}

export class Button extends Container {


    constructor(gameview, style, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction)
        this.addEvent('mousedown', this.OnMouseDown, this)
        this.addEvent('mouseup', this.OnMouseUp, this)
    }

    OnMouseDown() {

    }

    OnMouseUp() {

    }

}

export class Input extends Container {


    constructor(gameview, style, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction)
        this.style.editable = true;
        this.addEvent('mousedown', this.OnMouseDown, this)
        this.addEvent('mouseup', this.OnMouseUp, this)
        this.addEvent('keydown', this.OnKeyDown, this)
    }

    render(colldata) {
        super.render(colldata);
    }

    OnMouseDown(e, args) {

    }

    OnMouseUp() {

    }

    OnKeyDown(e, args) {
        if (this.active) {
            switch (true) {
                case e.keycode == 8://BACKSPACE
                    this.style.text = this.style.text.length > 0 ? this.style.text.substring(0, this.style.text.length - 1) : this.style.text//ATTENTION
                    break;
                case e.keycode >= 112 && e.keycode <= 123://Function KEYS
                    break;
                case e.keycode == 9://TAB
                    break;
                case e.keycode == 20://CAPS LOCK
                    break;
                case true://DEFAULT
                    this.style.text += e.key;
                    break;
            }
        }

    }

}