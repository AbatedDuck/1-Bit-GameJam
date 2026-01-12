export function updateDashers(enemies, dt, player, camera, canvas) {
    const playerHBox = { x: camera.x + canvas.width / 2 - player.hbW / 2, y: camera.y + canvas.height / 2 - player.hbH, height: player.hbH , width: player.hbW };
    for (let i = 0; i < enemies.length; i++) {  
        let enemy = enemies[i];
        const enemyHBox = { x: enemy.x, y: enemy.y , width: 64, height: 64 }
        if (enemy.state === 1) {
            const viewBox = { x: enemy.direction === 1 ? enemy.x : enemy.x - 160, y: enemy.y, height: 64, width: 160 };
            enemy.x += enemy.direction * 50 * dt;
            if (rectCollide(viewBox, playerHBox)) {
                enemy.state = 2;
                enemy.time = 1.2;
            }
            if (enemy.x > enemy.xr) {
                enemy.x = enemy.xr;
                enemy.direction = -1;
            } else if (enemy.x < enemy.xl) {
                enemy.x = enemy.xl;
                enemy.direction = 1;
            }
        } else if (enemy.state === 2) {
            enemy.time -= dt;
            enemy.x += enemy.direction * 133 * dt;
            if (enemy.x > enemy.xr || enemy.x < enemy.xl) {
                enemy.direction *= -1
                enemy.x += enemy.direction * 10;
                enemy.time = 0;
                enemy.state = 1;
                enemy.cd = 0.5;
            } else if (enemy.time < 0) {
                enemy.time = 0;
                enemy.state = 1;
            }
        }
    enemies[i] = enemy;
    }
}

function rectCollide(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}