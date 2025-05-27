import { EventObject, GuiLayer } from "./Elements.js";
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export class GameView {

    quit = false;
    multiplayer = false;
    socketsys = ClientSocketSystem;

    sharedData = {};

    debugmode = false;
    
    cContainer;
    canvas;
    ctx;

    scenes = []
    style = { bgcolor: "#111", position: { x: 0, y: 0 }, size: { x: 574, y: 863 } };

    constructor(scene = new Scene()) {
        this.socketsys = new ClientSocketSystem('127.0.0.1:3002');
        console.log(this.socketsys);
        (function (that) { window.onbeforeunload = that.OnUnload })(this);//DO THIS BETTER
        this.cContainer = document.getElementById('canvas-container');
        this.outerMargin = {x: parseInt(window.getComputedStyle(this.cContainer).marginLeft.match(/(\d)*/)), 
                            y: parseInt(window.getComputedStyle(this.cContainer).marginTop.match(/(\d)*/))};
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d', { alpha: false });
        this.canvas.setAttribute('width', "" + this.style.size.x);
        this.canvas.setAttribute('height', "" + this.style.size.y);
        this.scenes.push(scene);
        this.scenes[0].onInit();
        this.eventsystem = new EventSys(this);
        this.style.position.x = parseInt(window.getComputedStyle(this.canvas).marginLeft.match(/(\d)*/));
        this.style.position.y = parseInt(window.getComputedStyle(this.canvas).marginTop.match(/(\d)*/));
    }

    SetMainScene(scene) {
        for (let i = this.scenes.length - 1; i > 0; i--) {

            let sn = scene instanceof Object ? scene.name : scene
            if (this.scenes[i].name === sn) {
                if (this.getCurrentScene().gameview === null || undefined) {
                    console.error(`line ${new Error().lineNumber}: please set the gameview to the scene before adding the scene to the gameview`)
                    return;
                }
                this.scenes.unshift(this.scenes[i]);
                this.scenes.splice(i, 1);
                this.clear();

                this.scenes[i].onInit();
                return this.getCurrentScene();
            }
        }
        if (scene instanceof Scene) {
            this.clear();
            return this.AddAsMainScene(scene);
        }
        return new Error(`line ${new Error().lineNumber}: There is no such scene available`)
    }

    AddAsMainScene(scene) {
        if (scene.gameview === null || undefined) {
            console.error(`line ${new Error().lineNumber}: please set the gameview to the scene before adding the scene to the gameview`)
            return;
        }
        this.scenes.unshift(scene)
        scene.onInit();
        return this.getCurrentScene();
    }

    addScene(scene) {
        this.scenes.push(scene);
    }

    getCurrentScene() {
        return this.scenes[0];
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    render() {
        //Render everything inside of content
        let renderstart = { position: { x: 0, y: 0 }, size: { x: 0, y: 0 }, margin: { t: 0, r: 0, b: 0, l: 0 } }

        this.walker(this.getCurrentScene().guilayer, renderstart)
        this.renderRecursive(this.getCurrentScene().guilayer)

        this.eventsystem.elemevents = {};
    }

    clear() {
        this.ctx.clearRect(0, 0, this.style.size.x, this.style.size.y);
    }

    walker(data, coll) {
        //
        if (data.style === undefined) {
            console.log(data);
        }
        //log base size for updating later
        let bounds = { x: data.style.size.x, y: data.style.size.y };
        //initiate variable for collective data for placement etc.
        let collectivedata = coll;
        //add margin of this object to collective data
        collectivedata.margin.t += data.style.margin.t;
        collectivedata.margin.r += data.style.margin.r;
        collectivedata.margin.b += data.style.margin.b;
        collectivedata.margin.l += data.style.margin.l;

        //if this is the last element in the branch
        if (data.elems.length < 1) {
            //add this margin to the size this element takes up

            bounds.x += (data.style.margin.l + data.style.margin.r);
            bounds.y += (data.style.margin.t + data.style.margin.b);

            data.style.position = { ...collectivedata.position };
            data.style.position.x + collectivedata.margin.l;
            data.style.position.y + collectivedata.margin.t;

            return bounds;
        }
        //initiate variables to log collective child size;
        let childX = 0;
        let childY = 0;
        for (let i = 0; i < data.elems.length; i++) {
            let el = data.elems[i];
            //if horizontal display;
            let minsize = this.walker(el, collectivedata);
            //UP

            if (data.style.display !== 'absolute') {
                if (data.style.direction === 'horizontal') {
                    collectivedata.position.x += minsize.x;
                    childX += minsize.x
                    if (minsize.y > childY) {
                        childY = minsize.y;
                    }
                } else if (data.style.direction === "vertical") {
                    collectivedata.position.y += minsize.y;
                    childY += minsize.y
                    if (minsize.x > childX) {
                        childX = minsize.x;
                    }
                }
            }
        }

        //Resetting collective data
        if (data.style.direction === 'horizontal') {
            collectivedata.position.x = 0;
        } else {
            collectivedata.position.y = 0;
        }

        bounds.x = childX > bounds.x ? childX : bounds.x;
        bounds.y = childY > bounds.y ? childY : bounds.y;

        data.style.size.x = bounds.x;
        data.style.size.y = bounds.y;

        
        data.style.position = {... collectivedata.position}
        data.style.position.x + collectivedata.margin.l;
        data.style.position.y + collectivedata.margin.t;
        //data.style = Object.assign({}, collectivedata);

        bounds.x += (data.style.margin.l + data.style.margin.r);
        bounds.y += (data.style.margin.t + data.style.margin.b);

        return bounds;
    }


    renderRecursive(elem) {
        if (elem.elems.length > 0) {
            if (typeof elem.render == 'function') {
                elem.render();
            }
            for (let i = 0; i < elem.elems.length; i++) {
                this.renderRecursive(elem.elems[i]);
            }
        } else {
            if (typeof elem.render == 'function') {
                elem.render();
            }
        }
    }

    lasttime = Date.now();
    LoopScene() {
        //Loop constructor
        //gameboard.render();
        this.getCurrentScene().onStart()
        this.lasttime = Date.now();

        this.Loop()
        requestAnimationFrame(() => { this.ReRender.call(this) });
    }

    async Loop() {
        await this.getCurrentScene().onUpdate(Date.now() - this.lasttime);
        await this.getCurrentScene().onAfterUpdate(Date.now() - this.lasttime);
        this.lasttime = Date.now();
        await this.sleep(10)
        this.Loop.call(this);
    }

    ReRender() {
        this.clear();
        this.render();
        if (!this.quit) {
            requestAnimationFrame(() => { this.ReRender.call(this) })
        }
    }

    OnUnload() {
        this.socketsys.OnUnload();
    }

}

export class EventSys {

    globalevents = { keydownevents: {} };
    elemeventhandlers = [];
    gameview = GameView;

    InputAxis = {
        positive: {key: "d", justDown: false}, negative: {key: "a", justDown: false},
        value: 0, minVal: -1, maxVal: 1
    }

    constructor(gameview) {
        this.gameview = gameview;
        this.globalevents.keydownevents = {};
        document.addEventListener('keydown', (e) => this.EmitEvent(e, this));
        document.addEventListener('keyup', (e) => this.EmitEvent(e, this));
        this.gameview.canvas.addEventListener('mousedown', (e) => this.EmitEvent(e, this));
        this.gameview.canvas.addEventListener('mouseup', (e) => this.EmitEvent(e, this));
        this.gameview.canvas.addEventListener('mousemove', (e) => this.EmitEvent(e, this));
    }

    async EmitEvent(event, that) {
        that.gameview.getCurrentScene().EmitEvent(event);
    }

}


export class ClientSocketSystem {

    socketmanager;
    socket;
    players = []
    connectip;
    me;

    constructor(ip) {
        this.connectip = ip;
        this.socketmanager = new io.Manager(this.connectip, {
            autoConnect: false
        });
        this.socket = this.socketmanager.socket("/");
    }

    Connect() {
        //connect
        return new Promise((resolve, reject) => {
            this.socket.on('connect', this.OnConnected)
            this.socket.on('disconnect', this.OnDisconnected)
            this.socket.onAny((eventname, ...args) => {
                console.log(eventname);
            })
            let connected = this.socket.connect()
            if(connected == 'error'){
                reject('cringe');
            }
            else{
                resolve('connected');
            }
        });
        
    }

    SendMessage(name, message) {
        if (this.socket != null && this.socket != undefined) {
            if (this.socket.connected == true) {
                this.socket.emit(name, message);
            }else{
                this.Connect().catch((data) => {
                    console.log(data);
                }).then((data) => {
                    console.log('good');
                    this.socket.emit(name, message);
                })
            }
        }
    }

    OnMessage(context, name, func){
        this.socket.on(name, func)
    }

    OnConnected = (e) => { 
        console.log(`Connected`);

    }
    OnDisconnected = () => { console.log(`Disconnected.`) }


    OnUnload() {
        if (socket != null && socket != undefined) {
            this.socket.removeAllListeners();
        }
    }
}

export class Scene {

    name = '';
    gameview = undefined;
    guilayer = undefined;
    content = [];
    elemevents = []

    constructor(name) {
        this.name = name;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setGameview(gv) {
        this.gameview = gv;
        this.guilayer = new GuiLayer(gv);
    }

    AddScene() {
        this.gameview.addScene(this);
    }

    SetAsMainScene() {
        this.gameview.SetMainScene(this);
    }

    addEventHandler(type, func, args){
        if ((args instanceof Array) == false){
            args = [args];
        }
        this.elemevents.push({type: type, func: func, args: args})
    }

    removeEventHandler(context, type){
        for(let i = 0; i < this.elemevents; i++){
            let e = this.elemevents[i];
            if(e.args[0] == context && e.type == type){{
                this.elemevents.splice(i, 1);
                break;
            }}
        }
    }

    EmitEvent(event){
        for(let i = 0; i < this.elemevents.length; i++){
            let e = this.elemevents[i];
            if(event.type == e.type){
                if((e.func != null || undefined) && (e.args != null || undefined || [])){
                    let args = undefined;
                    if (e.args.slice(1, e.args.length) != null || undefined || []){
                        	args = e.args
                    }
                    e.func.call(e.args[0], event, args);
                }
            }
        }
    }

    onInit() {

    }

    onStart() {

    }

    onUpdate() {

    }

    onAfterUpdate() {

    }

    OnUnload() {
        guilayer = null;
        content = [];
    }

}

export class MLColor {

    hexcolorvals = {
        '0': 0, '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
        '8': 8, '9': 9, 'a': 10, 'b': 11, 'c': 12, 'd': 13, 'e': 14, 'f': 15
    }

    static darken(colorval, amount) {
        let value = this.convertToValues(colorval)
        if(value != null){
            value.result[0] = (value.result[0] - amount) < 0? 0: value.result[0] - amount;
            value.result[1] = (value.result[1] - amount) < 0? 0: value.result[1] - amount;
            value.result[2] = (value.result[2] - amount) < 0? 0: value.result[2] - amount;
        }
        value = this.convertToFormat(value.result, value.colorformat);
        return value.result;
    }

    static lighten(colorval, amount) {
        let value = this.convertToValues(colorval)
        if(value != null){
            value.result[0] = (value.result[0] + amount) > 256? 256: value.result[0] + amount;
            value.result[1] = (value.result[1] + amount) > 256? 256: value.result[1] + amount;
            value.result[2] = (value.result[2] + amount) > 256? 256: value.result[2] + amount;
        }
        value = this.convertToFormat(value.result, value.colorformat);
        return value.result;
    }

    static convertToValues(colorval) {
        var result = [];
        let val = [];
        let colorformat = null;
        if(colorval[0] == '#'){
            if(colorval.length > 5){
                colorformat = 'h6'
            }else{
                colorformat = 'h3'
            }
        }else if(colorval.match(/^(rgb)/)){
            colorformat = 'rgb';
        }else if(colorval.match(/^(rgba)/)){
            colorformat = 'rgba';
        }

        if(colorformat == null){
            console.error(`line ${new Error().lineNumber}: Color format is not supported` );
            return null;
        }
        switch (colorformat){
            case 'h3':
                val = colorval.match(/[a-z\d]{1}/gi);
                break;
            case 'h6':
                val = colorval.match(/[a-z\d]{2}/gi);
                break;
            case 'rgb':
                val = colorval.match(/([\d]{1,3})/g)
                break;
            case 'rgba':
                val = colorval.match(/([\d]{1,3})/g)
                break;
        }
        if(colorformat[0] == 'h'){
            val.forEach(element => {
                if(element.length === 1){
                    element += '0';
                }
                result.push(parseInt(element, 16));
            });
        }else if(colorformat.startsWith('rgb')){
            val.forEach(element => {
                result.push(element)
            });
        }
        
        return {result: result, colorformat: colorformat};
    }

    static convertToFormat(values, colorformat){

        let result = '';
        switch(colorformat){
            case 'h3':
                result += '#';
                for(let i = 0; i < values.length; i++){
                    let num = values[i];
                    result += num.toString(16);
                }
                break;
            case 'h6':
                result += '#';
                for(let i = 0; i < values.length; i++){
                    let num = values[i];
                    result += num.toString(16);
                }
                break;
            case 'rgb':
                result += 'rgb(';
                for(let i = 0; i < values.length; i++){
                    let num = values[i];
                    result += num.toString();
                    result += ','
                }
                values[values.length-1] = ")"
                break;
            case 'rgba':
                result += 'rgba(';
                for(let i = 0; i < values.length; i++){
                    let num = values[i];
                    result += num.toString();
                    result += ','
                }
                values[values.length-1] = ")"
                break;
        }
        if(result == ''){
            console.error(`line ${new Error().lineNumber}: could not convert color value to this format`);
            return null;
        }
        return {result: result, colorformat: colorformat};
    }

}