let TILE_SIZE = 32;
let ATLAS_COLS = 8;

export function render({ x, y }, ctx, canvas, atlas, mapData) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    for (let i = 0; i < mapData.tiles.length; i++) {
        const tileID = mapData.tiles[i];
        const mapCol = i % mapData.width;
        const mapRow = Math.floor(i / mapData.width);       
        const worldX = mapCol * TILE_SIZE;
        const worldY = mapRow * TILE_SIZE;
        if (worldX + TILE_SIZE > x && 
            worldX < x + canvas.width &&
            worldY + TILE_SIZE > y && 
            worldY < y + canvas.height) {
            const sx = (tileID % ATLAS_COLS) * TILE_SIZE;
            const sy = Math.floor(tileID / ATLAS_COLS) * TILE_SIZE;
            ctx.drawImage(
                atlas,
                sx, sy, TILE_SIZE, TILE_SIZE,
                Math.floor(worldX - x),
                Math.floor(worldY - y),
                TILE_SIZE, TILE_SIZE
            );
        }
    }
    ctx.fillStyle = "green"; 
    ctx.fillRect((canvas.width / 2) - (20 / 2), (canvas.height / 2) - (28 / 2), 20, 28);
}