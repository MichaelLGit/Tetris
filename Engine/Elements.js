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

export class GameObject extends EventObject {

    children = []

    constructor(gameview, style = null, children = []) {
        super(gameview)
        this.children = children;

    }

}


export class ImageObject extends EventObject{

    style = {position: {x:0, y:0}, size: {width: 100, height: 100}}
    img = Image;

    constructor(gameview){
        super(gameview)
    }

    render() {
        let gctx = this.gameview.ctx;
        gctx.drawImage(this.img, this.style.position.x, this.style.position.y ,this.style.width, this.style.height)

        if (this.gameview.debugmode === true) {
            gctx.beginPath();
            gctx.lineWidth = '1';
            gctx.strokeStyle = this.style.direction === 'horizontal' ? '#f00' : '#00f';
            gctx.rect(this.gameview.style.position.x + this.style.position.x + this.style.margin.l,
                this.gameview.style.position.y + this.style.position.y + this.style.margin.t,
                this.style.size.x, this.style.size.y)
            gctx.stroke()
        }
    }
}

export class SpriteComponent extends ImageObject{


    constructor(img, style = null){
        this.img = img;
        if (style != null){
            this.style = style;
        }
    }

}

export class GameLayer {
    gameview = GameView;
    gravity = 9;
    elems = [];
    style = { size: { x: 0, y: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 }, display: 'absolute' }

    constructor(gameview, style = null, elems = [], direction = 'vertical') {
        this.gameview = gameview
        this.elems = elems;

        if (style != null || undefined) this.style = style;

        this.style.size.x = gameview.style.size.x;
        this.style.size.y = gameview.style.size.y;
    }
}

export class GuiLayer {

    gameview = GameView;
    elems = [];
    style = { size: { x: 0, y: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 }, display: 'absolute' }

    constructor(gameview, style = null, elems = [], direction = 'vertical') {
        this.gameview = gameview
        this.elems = elems;

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
        if (style !== null) {
            this.style = style;
        }
        if (this.style.fontStyle == null || this.style.fontStyle == undefined) {
            this.style.fontStyle = 'serif';
        }
        if (this.style.fontSize == null || this.style.fontSize == undefined) {
            this.style.fontSize = 12;
        }
        if (this.style.color == null || this.style.color == undefined) {
            this.style.color = '#000';
        }
        if (this.style.text == null || this.style.text == undefined) {
            this.style.text = '';
        }
    }

    render() {
        let realcolor = this.active ? this.activestyle.bgcolor : this.style.bgcolor;
        let gctx = this.gameview.ctx;
        gctx.beginPath();
        gctx.rect((this.gameview.style.position.x + this.style.position.x) + this.style.margin.l,
            (this.gameview.style.position.y + this.style.position.y) + this.style.margin.t,
            this.style.size.x, this.style.size.y);
        gctx.fillStyle = realcolor;
        gctx.fill();

        if (this.gameview.debugmode === true) {
            gctx.beginPath();
            gctx.lineWidth = '1';
            gctx.strokeStyle = this.style.direction === 'horizontal' ? '#f00' : '#00f';
            gctx.rect(this.gameview.style.position.x + this.style.position.x + this.style.margin.l,
                this.gameview.style.position.y + this.style.position.y + this.style.margin.t,
                this.style.size.x, this.style.size.y)
            gctx.stroke()
        }
    }

    copystyle(style1, style2) {
        for (let key in style2) {
            if (style2[key] instanceof Object) {
                if (style1[key] == undefined) {
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

    addEventHandler(scene, type, func, args) {
        if ((args instanceof Array) == false) {
            args = [args];
        }
        args.unshift(this);
        scene.addEventHandler(type, func, args)
    }

    isInside(x, y) {
        x -= this.gameview.outerMargin.x;
        y -= this.gameview.outerMargin.y;
        if (x > (this.gameview.style.position.x + this.style.position.x + this.style.margin.l) && x < (this.gameview.style.position.x + this.style.position.x + this.style.margin.l + this.style.size.x)) {
            if (y > (this.gameview.style.position.y + this.style.position.y + this.style.margin.t) && y < (this.gameview.style.position.y + this.style.position.y + this.style.margin.t + this.style.size.y)) {
                // console.log(`{${(this.gameview.style.position.x + this.style.position.x + this.style.margin.l)}, ${(this.gameview.style.position.y + this.style.position.y + this.style.margin.t)}}, 
                //             {${(this.gameview.style.position.x + this.style.position.x + this.style.margin.l + this.style.size.x)}, ${(this.gameview.style.position.y + this.style.position.y + this.style.margin.t + this.style.size.y)}}`)
                return true;
            }
        }
        return false;
    }

}

export class Label extends Container {

    constructor(gameview, style, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction);
    }

    render(colldata) {
        super.render(colldata);
        let realfont = this.style.fontSize + 'px ' + this.style.fontStyle;
        let gctx = this.gameview.ctx;
        gctx.fillStyle = this.style.color;
        gctx.font = realfont;
        gctx.fillText(this.style.text,
            ((this.gameview.style.position.x + this.style.position.x) + this.style.margin.l),
            ((this.gameview.style.position.y + this.style.position.y) + this.style.margin.t) + (this.style.size.y - this.style.fontSize / 4));

    }

}

export class Button extends Container {


    constructor(gameview, style, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction);
    }

    render(colldata) {
        super.render(colldata);
        let realfont = this.style.fontSize + 'px ' + this.style.fontStyle;
        let gctx = this.gameview.ctx;
        gctx.font = realfont;
        gctx.fillStyle = this.style.color;
        gctx.fillText(this.style.text,
            ((this.gameview.style.position.x + this.style.position.x) + this.style.margin.l),
            ((this.gameview.style.position.y + this.style.position.y) + this.style.margin.t) + (this.style.size.y - this.style.fontSize / 4));

    }

}

export class Input extends Container {

    submitdata = undefined;
    is_initial_value = true;

    constructor(gameview, style, elems = [], direction = 'vertical') {
        super(gameview, style, elems, direction)
        this.style.editable = true;

    }

    addBasicEvents(context) {
        context.addEventHandler(
            'mousedown',
            (e) => {
                this.OnMouseDown(e);
            }
        )
        context.addEventHandler(
            'mouseup',
            (e) => {
                if (!this.isInside(e.clientX, e.clientY)) {
                    this.active = false;
                }
            }
        )
        context.addEventHandler('keydown',
            (e) => {
                if (this.active) {
                    switch (true) {
                        case e.key == 'Backspace'://BACKSPACE
                            this.style.text = this.style.text.length > 0 ? this.style.text.substring(0, this.style.text.length - 1) : this.style.text//ATTENTION
                            break;
                        case e.which >= 112 && e.which <= 123://Function KEYS
                            break;
                        case e.key == 'Tab'://TAB
                            break;
                        case e.key == 'CapsLock'://CAPS LOCK
                            break;
                        case e.key == 'Enter'://ENTER
                            this.Submit();
                            break;
                        case e.key.length == 1 && this.style.text.length < 6://DEFAULT
                            if (e.key.match(/[\d|a-z]/i)) {
                                this.style.text += e.key.toLowerCase();
                            }
                            break;
                    }
                }
            }
        )
    }

    render(colldata) {
        super.render(colldata);
        let realfont = this.style.fontSize + 'px ' + this.style.fontStyle;
        let gctx = this.gameview.ctx;
        gctx.font = realfont;
        gctx.fillStyle = this.style.color;
        gctx.fillText(this.style.text,
            ((this.gameview.style.position.x + this.style.position.x) + this.style.margin.l),
            ((this.gameview.style.position.y + this.style.position.y) + this.style.margin.t) + (this.style.size.y - this.style.fontSize / 4));

    }

    OnMouseDown(e, args) {
        if (this.isInside(e.clientX, e.clientY)) {
            if (this.is_initial_value) {
                this.style.text = "";
            }
            this.active = true;
        } else {
            this.active = false;
        }
    }

    OnMoveMouse() {

    }

    OnMouseUp() {
        this.active = false;
    }

    OnKeyDown(e, args) {


    }

    OnSubmit(context, func, ...args) {
        if ((func != undefined || null) || (context != undefined || null)) {
            this.submitdata = { func: func, context: context, args: args }
        }
    }

    clearSubmit() {
        this.submitdata = undefined;
    }

    Submit = () => {
        if (this.submitdata != undefined) {
            this.submitdata.func.call(this.submitdata.context, ...this.submitdata.args)
        }
    }

}