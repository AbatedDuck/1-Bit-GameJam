export function resolvePlayerCollisions(player, camera, canvas, obstacles, axis) {
    const screenCenterX = canvas.width / 2;
    const screenCenterY = canvas.height / 2;
    const buffer = 0.1;
    const px = (camera.x + screenCenterX) - (player.hbW / 2);
    const py = (camera.y + screenCenterY) - (player.hbH / 2);
    for (const obs of obstacles) {
        if (px < obs.x + obs.width &&
            px + player.hbW > obs.x &&
            py < obs.y + obs.height &&
            py + player.hbH > obs.y) {
            if (axis === 'x') {
                if (px + player.hbW / 2 < obs.x + obs.width / 2) {
                    camera.x = obs.x - player.hbW - screenCenterX + (player.hbW / 2) - buffer;
                    player.wallDir = 1;
                } else {
                    camera.x = obs.x + obs.width - screenCenterX + (player.hbW / 2) + buffer;
                    player.wallDir = -1;
                }
            }             
            if (axis === 'y') {
                player.gravity = 1;
                if (py + player.hbH / 2 < obs.y + obs.height / 2) {
                    player.touchingGround = true;
                    camera.y = obs.y - player.hbH - screenCenterY + (player.hbH / 2) - buffer;
                } else {
                    player.touchingGround = false;
                    camera.y = obs.y + obs.height - screenCenterY + (player.hbH / 2) + buffer;
                }
            }
        }
    }
}

export function touchingExit(playerX, playerY, playerW, playerH, block) {
    return (
        playerX < block.x + block.width && 
        playerX + playerW > block.x &&
        playerY < block.y + block.height &&
        playerY + playerH > block.y
    );
}