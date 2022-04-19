import { EventObject, GuiLayer } from "./Elements.js";
import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";

export class GameView {

    quit = false;
    multiplayer = false;
    socketsys = ClientSocketSystem;

    debugmode = false;

    canvas;
    ctx;

    scenes = []
    style = { bgcolor: "#111", position: { x: 0, y: 0 }, size: { x: 574, y: 863 } };

    constructor(scene = new Scene()) {
        this.socketsys = new ClientSocketSystem();
        console.log(this.socketsys);
        (function (that) { window.onbeforeunload = that.OnUnload })(this);//DO THIS BETTER
        this.scenes.push(scene);
        this.scenes[0].onInit();
        this.eventsystem = new EventSys();
        this.canvas = document.getElementById('game-canvas')
        this.ctx = this.canvas.getContext('2d', {alpha: false});
        this.canvas.setAttribute('width', "" + this.style.size.x);
        this.canvas.setAttribute('height', "" + this.style.size.y);
    }

    SetMainScene(scene) {
        for (let i = this.scenes.length - 1; i > 0; i--) {
            
            let sn = scene instanceof Object ? scene.name: scene
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
        if(scene instanceof Scene){
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
        let thissize = { x: data.style.size.x, y: data.style.size.y };
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
            data.style.size.x = thissize.x;
            data.style.size.y = thissize.y;

            thissize.x += (data.style.margin.l + data.style.margin.r);
            thissize.y += (data.style.margin.t + data.style.margin.b);

            this.CheckEvents(data, collectivedata);
            data.collstyledata.margin = { ...collectivedata.margin };
            data.collstyledata.position = { ...collectivedata.position };
            data.collstyledata.size = { ...collectivedata.size };

            return thissize;
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

        //Resetting collective data of horizontal element (i forgot why)
        if (data.style.direction === 'horizontal') {
            collectivedata.position.x = 0;
        } else {
            collectivedata.position.y = 0;
        }

        thissize.x = childX > thissize.x ? childX : thissize.x;
        thissize.y = childY > thissize.y ? childY : thissize.y;

        data.style.size.x = thissize.x;
        data.style.size.y = thissize.y;

        thissize.x += (data.style.margin.l + data.style.margin.r);
        thissize.y += (data.style.margin.t + data.style.margin.b);

        this.CheckEvents(data, collectivedata);
        data.collstyledata = Object.assign({}, collectivedata);

        return thissize;
    }

    CheckEvents(data, collectivedata) {
        let mouseupcalled = false;
        if (data instanceof EventObject) {
            for (let key in this.eventsystem.elemevents) {
                if (data.events.hasOwnProperty(key) === true && typeof data.events[key].func === 'function') {

                    let xp = (this.style.position.x + collectivedata.position.x) + data.style.margin.l
                    let yp = (this.style.position.y + collectivedata.position.y) + data.style.margin.t
                    let dofullclick = false;
                    if (this.eventsystem.elemevents[key].event.clientX > xp && this.eventsystem.elemevents[key].event.clientX < (xp + data.style.size.x)) {
                        if (this.eventsystem.elemevents[key].event.clientY > yp && this.eventsystem.elemevents[key].event.clientY < (yp + data.style.size.y)) {
                            if (key === 'mousedown' && data.events.leftmouseheld == false) {
                                data.events['active'] = true;
                                data.events.leftmouseheld = true;
                                console.log('hold')
                            }
                            if (key === 'mouseup') {
                                if (mouseupcalled === true) {
                                    mouseupcalled = false;
                                    data.events['active'] = false;
                                    data.events.leftmouseheld = false;
                                    console.log('release ')
                                    continue
                                }
                                if (data.events['active'] === true) {
                                    console.log('release')
                                    dofullclick = true;
                                    data.events['active'] = false;
                                    data.events.leftmouseheld = false;
                                }
                            }
                            mouseupcalled = false;
                            data.events[key].args.inside = true;
                            data.events[key].func.call(data.events[key].context, data.events[key].event, data.events[key].args);
                            if (data.events['fullclick'] !== undefined && dofullclick === true) {
                                data.events['fullclick'].args.inside = true;
                                data.events['fullclick'].func.call(data.events['fullclick'].context, data.events['fullclick'].event, data.events['fullclick'].args)
                            }
                            dofullclick = false;
                            return
                        }
                    }
                    else {
                        if (typeof this.eventsystem.elemevents['mouseup'] === 'function') {
                            console.log('mouseup outside')
                            data.events.leftmouseheld = false;
                            data.events['active'] = false;
                            data.events['mouseup'].args.inside = false;
                            data.events['mouseup'].func.call(data.events['mouseup'].context, data.events['mouseup'].event, data.events['mouseup'].args);
                            mouseupcalled = true;
                        } else if (typeof this.eventsystem.elemevents['mousedown'] === 'function') {
                            console.log('mousedown outside')
                            data.events['mousedown'].args.inside = false;
                            data.events['mousedown'].func.call(data.events['mousedown'].context, data.events['mousedown'].event, data.events['mousedown'].args);
                        }
                    }
                }
            }
        }
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

        requestAnimationFrame(() => { this.Loop.call(this) });
    }

    Loop() {
        this.getCurrentScene().onUpdate(Date.now() - this.lasttime);
        this.getCurrentScene().onAfterUpdate(Date.now() - this.lasttime);
        this.clear();
        this.render();
        this.lasttime = Date.now();
        if (!this.quit) {
            requestAnimationFrame(() => { this.Loop.call(this) })
        }
    }

    OnUnload() {
        this.socketsys.OnUnload();
    }

}

export class EventSys {

    globalevents = { keydownevents: {} };
    elemevents = {};

    constructor() {
        this.globalevents.keydownevents = {};
        document.addEventListener('keydown', (e) => this.KeyDown(e, this.globalevents));
        document.getElementById('game-canvas').addEventListener('mousedown', (e) => this.ElemEvent(e, this))
        document.getElementById('game-canvas').addEventListener('mouseup', (e) => this.ElemEvent(e, this))
        document.getElementById('game-canvas').addEventListener('keydown', (e) => this.ElemEvent(e, this))
        document.getElementById('game-canvas').addEventListener('keyup', (e) => this.ElemEvent(e, this))
    }

    KeyDown(e, evs) {
        if (evs.keydownevents[e.key] == undefined) return
        for (let i = 0; i < evs.keydownevents[e.key].length; i++) {
            evs.keydownevents[e.key][i].func.call(evs.keydownevents[e.key][i].args, e);
        }
    }

    OnKeyDown(key, func, args) {
        if (this.globalevents.keydownevents[key] == undefined) {
            this.globalevents.keydownevents[key] = [];
        }
        this.globalevents.keydownevents[key].push({ func: func, args: args });
        console.log(this.globalevents.keydownevents);
    }

    ElemEvent(event, that) {
        that.elemevents[event.type] = { event: event };
    }

}


export class ClientSocketSystem {

    socketmanager;
    socket;
    me;

    constructor(ip) {

        this.socketmanager = new io.Manager(ip, {
            autoConnect: false
        });
        this.socket = this.socketmanager.socket("/");
    }

    Connect(ip) {
        //connect
        this.socket.connect()
        this.socket.on('connect', this.OnConnected)
        this.socket.on('disconnect', this.OnDisconnected)
        this.socket.onAny((eventname, ...args) => {
            console.log(eventname);
        })
        console.log(this.socket);
    }

    SendMessage(name, message) {
        if (this.socket != null && this.socket != undefined) {
            if (this.socket.connected == true) {
                this.socket.emit(name, message);
            }
        }
    }

    OnConnected = (socket) => { console.log(`Connected to: ${socket}`); }
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

    onInit() {

    }

    onStart() {

    }

    onUpdate() {

    }

    onAfterUpdate() {

    }

    OnUnload(){
        guilayer = null;
        content = [];
    }

}