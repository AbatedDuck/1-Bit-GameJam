import { keys } from './engine/controls.js';
import { resolvePlayerCollisions, touchingExit } from './entities/player/collisions.js';
import { render } from './engine/render.js';
import { loadRoom } from './engine/roomLoader.js';
import { updateDashers } from './entities/enemies/dasher.js';

let gameState = 0;

let camera = {x: 0, y: 0};
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let map = await loadRoom("1");

const atlasImage = new Image();
const mainScreen = new Image();
mainScreen.src = 'assets/tiles/tiles.png';

let menuLastTime = 0;
let dif = 0;
let dState = 1;
let enemies = { 
    dasher: [] 
};

mainScreen.onload = () => {
    menuLastTime = performance.now(); 
    requestAnimationFrame(mainMenu);
};

function mainMenu(currentTime) {
    if (!menuLastTime) {
        menuLastTime = currentTime;
        requestAnimationFrame(mainMenu);
        return;
    }
    let dt = (currentTime - menuLastTime) / 1000;
    menuLastTime = currentTime;
    if (isNaN(dt) || dt > 0.1) dt = 0;
    if (dState === 1) {
        dif += 20 * dt;
        if (dif > 10) dState = 2;
    } else {
        dif -= 20 * dt;
        if (dif < -10) dState = 1;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mainScreen, 0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.font = "20px Arial";
    ctx.fillText("PRESS ANY KEY TO START", canvas.width / 2, Math.round((canvas.height - 50) + dif));
    if (gameState === 0) {
        requestAnimationFrame(mainMenu);
    }
}

window.addEventListener("keydown", function start() {
    gameState = 1;
    atlasImage.src = 'assets/tiles/tiles.png';
    atlasImage.onload = () => {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    };
}, { once: true });

const OBSTACLE_IDS = [1, 2];
function isObstacle(col, row, mapData) {
    const tileIndex = row * mapData.width + col;
    const tileID = mapData.tiles[tileIndex];
    return OBSTACLE_IDS.includes(tileID);
}

let player = {
    hbW: 20,
    hbH: 28,
    gravity: 1,
    touchingGround: false,
    wallDir: 0,
    dir: 0
}

let rects = [];
handleMapChange(map, 32);

function handleMapChange(mapData, tileSize = 32) {
    const OBSTACLE_IDS = [1, 2];
    rects = []
    for (let i = 0; i < map.tiles.length; i++) {
        const tileID = mapData.tiles[i];
        if (OBSTACLE_IDS.includes(tileID)) {
            const col = i % mapData.width;
            const row = Math.floor(i / mapData.width);
            rects.push({
                x: col * tileSize,
                y: row * tileSize,
                width: tileSize,
                height: tileSize
            });
        }
    }
    enemies.dasher = [];
    if (mapData.enemies && Array.isArray(mapData.enemies)) {
        for (let i = 0; i < map.enemies.length; i++) {
            let val = map.enemies[i]
            if (val.type === "dasher") {
                enemies.dasher.push({
                    x: val.x,
                    y: val.y,
                    direction: val.direction,
                    cd: 0,
                    state: 1,
                    xl: val.xl,
                    xr: val.xr,
                    time: 0,
                    width: 32,
                    height: 32
                })
            }
        }
    }
}

let dashTime = 0;
let dashCooldownTime = 0;
let dashDir

function updateCamera(dt) {
    const speed = 200;
    let move = { x: 0, y: 0 };
    if (keys["KeyA"]) { move.x -= speed * dt; player.dir = -1; }
    if (keys["KeyD"]) { move.x += speed * dt; player.dir = 1; }
    if (Math.abs(player.gravity) > 30) player.touchingGround = false;
    if (keys["KeyW"]) {
        if (player.touchingGround) {
        player.gravity = -300;
        player.touchingGround = false;
        }
    }   
    if (player.gravity !== 0) {
        move.y += player.gravity * dt;
        if (player.wallDir !== 0 ){
            player.gravity += 150 * dt;
        } else {
            player.gravity += 300 * dt;
        }
    }  
    if (keys["ShiftLeft"]) {
        if (dashTime === 0 && dashCooldownTime === 0) {
            dashTime = 0.2;
            dashCooldownTime = 1;
            dashDir = player.dir;
        }
    }
    if (dashCooldownTime > 0) dashCooldownTime -= dt; if (dashCooldownTime < 0) dashCooldownTime = 0;
    if (dashTime > 0) {
        dashTime -= dt;       
        if (dashTime < 0) {
            let excess = -dashTime;
            dashTime = 0;
            move.x = dashDir * 600 * excess;
        } else {
            move.x = dashDir * 600 * dt;  
        }           
    }
    return move;
}

async function checkExits() {
    if (!map.exits) return;
    for (let i = 0; i < map.exits.length; i++) {
        const exit = map.exits[i];
        const block = { 
            x: exit.x * 32 - 32, 
            y: exit.y * 32 - 32, 
            width: 32, 
            height: 32 
        };
        const px = (camera.x + canvas.width / 2) - (player.hbW / 2);
        const py = (camera.y + canvas.height / 2) - (player.hbH / 2);
        if (touchingExit(px, py, player.hbW, player.hbH, block)) {
            camera.x = (exit.toX * 32) - (canvas.width / 2) + 16,
            camera.y = (exit.toY * 32) - (canvas.height / 2) + 16
            player.gravity = 1;
            player.touchingGround = true;
            dashTime = 0;
            dashCooldownTime = 0;
            const newMap = await loadRoom(exit.toRoom);
            map = newMap;
            handleMapChange(map, 32)
            break;
        }
    }
}

function movement(deltaTime) {
    const move = updateCamera(deltaTime);
    camera.x += move.x;
    resolvePlayerCollisions(player, camera, canvas, rects, 'x');
    camera.y += move.y;
    resolvePlayerCollisions(player, camera, canvas, rects, 'y');
}

function enemyManage(deltaTime) {
    updateDashers(enemies.dasher, deltaTime, player, camera, canvas);
}

let lastTime = 0;
function gameLoop(currentTime) {
    let deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    if (deltaTime > 0.1) deltaTime = 0;
    player.wallDir = 0;
    movement(deltaTime);
    enemyManage(deltaTime);
    render(camera, ctx, canvas, atlasImage, map);
    checkExits();
    ctx.fillStyle = "white";
    ctx.fillText(`dashtime: ${dashTime}`, 10, 30);
    ctx.fillText(`dcdt: ${dashCooldownTime}`, 10, 50);
    ctx.fillText(`dir: ${player.dir}`, 10, 70);  
    requestAnimationFrame(gameLoop);
}