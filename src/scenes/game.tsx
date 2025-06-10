import { Vec2, type GameObj, type KAPLAYCtx } from "kaplay";
import { getRelativeMousePos } from "../utils/cam_utils";
import spawnCrop from "../utils/crop_utils";
import { CropSize, CropType } from "../entities/crop";
import drawPlayer from "../entities/player";

const GRID_SIZE = 72;

const MAP_SIZE = 50

const GameGrid: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: MAP_SIZE }, () =>
    Array.from({ length: MAP_SIZE }, () => null))

const ClaimGrid: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: MAP_SIZE }, () =>
    Array.from({ length: MAP_SIZE }, () => null))

export default function initGame(k: KAPLAYCtx) {
    k.scene('game', () => {
        k.add([
            k.rect(GRID_SIZE * MAP_SIZE, GRID_SIZE * MAP_SIZE, { fill: false }),
            k.anchor('topleft'),
            k.outline(2, k.rgb(255, 0, 0)),
            k.pos(-GRID_SIZE/2),
        ]);

        const player = drawPlayer(k, k.center())

        k.onKeyPress('r', () => {
            const playerGridX = snapToGrid(k, player.pos).x / GRID_SIZE;
            const playerGridY = snapToGrid(k, player.pos).y / GRID_SIZE;
            if (!player.placed) {
                const fence = k.add([
                    k.rect(GRID_SIZE * 3, GRID_SIZE * 3, { fill: false }),
                    k.pos(snapToGrid(k, player.pos).sub(GRID_SIZE/2)),
                    k.anchor('topleft'),
                    k.area(),
                    k.outline(2, k.rgb(0, 255, 0)),
                ])

                const origin = k.add([
                    k.circle(4),
                    k.color(255, 0, 0),
                    k.pos(snapToGrid(k, player.pos)),
                    k.anchor('center'),
                ])
                
                player.placed = true;

                // Place down the player's farm in the game grid
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        const tempX = playerGridX + x;
                        const tempY = playerGridY + y;
                        if (GameGrid[tempX][tempY] !== null) {
                            GameGrid[tempX][tempY].destroy()
                        }
                        GameGrid[tempX][tempY] = player.farm[x][y];
                        if (player.farm[x][y] !== null) {
                            player.farm[x][y].pos = k.vec2(
                                (tempX * GRID_SIZE),
                                (tempY * GRID_SIZE)
                            );
                            k.add(player.farm[x][y]);
                        }
                    }
                }
                
                player.home = { x: playerGridX, y: playerGridY, fence: fence, origin: origin };
            } else {
                if (playerGridX === player.home.x && playerGridY === player.home.y) {
                    player.home.fence.destroy();
                    player.home.origin.destroy();
                    for (let x = 0; x < 3; x++) {
                        for (let y = 0; y < 3; y++) {
                            const tempX = playerGridX + x;
                            const tempY = playerGridY + y;
                            if (GameGrid[tempX][tempY] !== null) {
                                GameGrid[tempX][tempY].destroy()
                            }
                            player.farm[x][y] = GameGrid[tempX][tempY];
                            GameGrid[tempX][tempY] = null;
                        }
                    }
                }
                player.placed = false;
            }
        })

        for (let x = 0; x <= k.width(); x += GRID_SIZE) {
            k.add([
                k.rect(2, k.height()),
                k.color(200, 200, 200),
                k.pos(x + GRID_SIZE/2, 0),
                k.anchor('topleft'),
                k.layer('bg'),
                k.area(),
                'gridline'
            ]);
        }
        for (let y = 0; y <= k.height(); y += GRID_SIZE) {
            k.add([
                k.rect(k.width(), 2),
                k.color(200, 200, 200),
                k.pos(0, y + GRID_SIZE/2),
                k.anchor('topleft'),
                k.layer('bg'),
                k.area(),
                'gridline'
            ]);
        }

        k.add([
            k.text('Game Scene', { size: 32 }),
            k.color(0, 0, 0),
            k.pos(k.center()),
            k.anchor('center'),
            k.area(),
            'game-text',
        ]);

        const button1 = k.add([
            k.text('Carrot', { size: 24 }),
            k.pos(k.vec2(10, 10)),
            k.area(),
            k.color(255,0,0)
        ])

        const button2 = k.add([
            k.text('Cabbage', { size: 24 }),
            k.pos(button1.pos.add(k.vec2(0, 32))),
            k.anchor('topleft'),
            k.color(0, 255, 0),
            k.area(),
            'button-text'
        ])

        const button3 = k.add([
            k.text('Check Grid', { size: 24 }),
            k.pos(button2.pos.add(k.vec2(0, 32))),
            k.anchor('topleft'),
            k.color(255, 255, 0),
            k.area(),
            'button-text'
        ])

        button1.onClick(() => {
            spawnCrop(k, snapToGrid(k, k.vec2(400, 400)), CropSize.SMALL, CropType.CARROT);
        })

        button2.onClick(() => {
            spawnCrop(k, snapToGrid(k, k.vec2(200, 200)), CropSize.MEDIUM, CropType.CABBAGE);
        })

        button3.onClick(() => {
            // Log the current state of the game grid
            console.log("Current Game Grid State:");
            console.log(GameGrid);
        })
        

        let clicked: GameObj | null = null;
        let oldPos = k.vec2(0, 0);

        // Track the currently dragged carrot globally
        k.onClick('crop', (obj) => {
            if (clicked && clicked !== obj) {
                return
            }
            clicked = obj;
            oldPos = obj.pos
            obj.z = 10; // Bring the clicked crop to the front
        })

        k.onMouseRelease("left", () => {
            if (clicked) {
                handleMerge(k, clicked, oldPos);
                clicked.z = 1; // Reset z-index
                clicked = null;
            }
            k.setCamPos(k.getCamPos())
                
        });

        k.onUpdate(() => {
            if (clicked) {
                const mousePos = getRelativeMousePos(k);
                clicked.pos = mousePos;
            }
            
        });

        k.onUpdate(() => {
            // // Update camera zoom based on screen size
            // updateCamZoom(k);

            // // Center camera on the game area
            // updateCamPos(k, gameArea.pos);

            k.tween(
                k.getCamPos(),
                player.pos,
                0.1,
                newPos => {k.setCamPos(newPos)},
                k.easings.easeInOutQuad
            )

            const camPos = k.getCamPos();
            const camZoom = k.getCamScale();
            const screenWidth = k.width() / camZoom.x;
            const screenHeight = k.height() / camZoom.x;
            const left = camPos.x - screenWidth / 2;
            const top = camPos.y - screenHeight / 2;
            const startX = Math.floor(left / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2;
            const startY = Math.floor(top / GRID_SIZE) * GRID_SIZE + GRID_SIZE / 2; 

            // Remove previous gridlines
            k.get('gridline').forEach(line => line.destroy());

            // Draw vertical gridlines
            for (let x = startX; x < left + screenWidth; x += GRID_SIZE) {
                k.add([
                    k.rect(1, screenHeight),
                    k.color(200, 200, 200),
                    k.pos(x, top),
                    k.anchor('topleft'),
                    k.layer('bg'),
                    'gridline'
                ]);
            }

            // Draw horizontal gridlines
            for (let y = startY; y < top + screenHeight; y += GRID_SIZE) {
                k.add([
                    k.rect(screenWidth, 1),
                    k.color(200, 200, 200),
                    k.pos(left, y),
                    k.anchor('topleft'),
                    k.layer('bg'),
                    'gridline'
                ]);
            }
        });
    });
}

function handleMerge(k: KAPLAYCtx, clicked: GameObj, oldPos: Vec2) {
    // Keep track of old and new grid positions
    const oldGridX = oldPos.x / GRID_SIZE;
    const oldGridY = oldPos.y / GRID_SIZE;
    const snappedPos = snapToGrid(k, clicked.pos);
    const gridX = snappedPos.x / GRID_SIZE;
    const gridY = snappedPos.y / GRID_SIZE;

    // Check if the dropped crop is in a new grid position and if the new position is occupied
    if ((oldGridX !== gridX || oldGridY !== gridY) && GameGrid[gridX][gridY] !== null) {
        const coll = GameGrid[gridX][gridY];

        // Is the colliding object a crop of the same type and size?
        if (coll.tags.includes('crop') 
        && coll.type === clicked.type
        && coll.size === clicked.size
        && clicked.size < CropSize.XLARGE) { // Prevent merging if already at max size
            // Merge logic: DFS the game grid to find all connected crops of the same type and size
            const mergeGroup = [clicked, coll];
            const stack = [coll];
            const visited = new Set();
            visited.add(coll.id);
            visited.add(clicked.id);

            while (stack.length > 0 && mergeGroup.length < 5) { 
                const current = stack.pop();
                const currentGridX = current?.pos.x / GRID_SIZE;
                const currentGridY = current?.pos.y / GRID_SIZE;
                
                // Check all 4 directions for connected crops
                const directions = [
                    { x: 1, y: 0 }, // Right
                    { x: -1, y: 0 }, // Left
                    { x: 0, y: 1 }, // Down
                    { x: 0, y: -1 } // Up
                ];
                
                for (const dir of directions) {
                    const neighborX = currentGridX + dir.x;
                    const neighborY = currentGridY + dir.y;
                    
                    if (GameGrid[neighborX] && GameGrid[neighborY]) {
                        const neighbor = GameGrid[neighborX][neighborY];
                        if (neighbor && neighbor.tags.includes('crop') 
                            && neighbor.type === clicked.type 
                            && neighbor.size === clicked.size 
                            && !visited.has(neighbor.id)) {
                            mergeGroup.push(neighbor);
                            stack.push(neighbor);
                            visited.add(neighbor.id);
                        }
                    }
                }
            }

            const newSize = clicked.size + 5;
            switch (true) {
                case mergeGroup.length < 3:
                    // Not enough crops to merge, do nothing
                    break;
                case mergeGroup.length < 5:
                    // Only merge up to 3 crops if there are less than 5
                    for (let i = 0; i < 3; i++) {
                        const crop = mergeGroup[i];
                        crop.destroy();
                        const tempSnappedPos = snapToGrid(k, crop.pos);
                        const tempGridX = tempSnappedPos.x / GRID_SIZE;
                        const tempGridY = tempSnappedPos.y / GRID_SIZE;
                        GameGrid[tempGridX][tempGridY] = null; // Reset old position
                    }
                    // Spawn one new crop of the next size
                    GameGrid[gridX][gridY] = spawnCrop(k, snappedPos, newSize, clicked.type);
                    GameGrid[oldGridX][oldGridY] = null; // Reset old position
                    break;
                case mergeGroup.length >= 5:
                    // Bonus merge: Merge up to 5 crops into two new crops of the next size
                    { for (let i = 0; i < 5; i++) {
                        const crop = mergeGroup[i];
                        crop.destroy();
                        const tempSnappedPos = snapToGrid(k, crop.pos);
                        const tempGridX = tempSnappedPos.x / GRID_SIZE;
                        const tempGridY = tempSnappedPos.y / GRID_SIZE;
                        GameGrid[tempGridX][tempGridY] = null; // Reset old position
                    }

                    GameGrid[gridX][gridY] = spawnCrop(k, snappedPos, newSize, clicked.type);
                    // Spawn the second crop at nearest position to the first
                    const newPos = k.vec2(mergeGroup[2].pos.x, mergeGroup[2].pos.y);
                    const newPosX = newPos.x / GRID_SIZE;
                    const newPosY = newPos.y / GRID_SIZE;
                    GameGrid[newPosX][newPosY] = spawnCrop(k, newPos, newSize, clicked.type);
                    GameGrid[oldGridX][oldGridY] = null;

                    break; 
                }
            }
        }
    }

    // If the grid square is empty, move the clicked crop to the new position
    if (GameGrid[gridX][gridY] === null) {
        GameGrid[oldGridX][oldGridY] = null; // Set old position to unoccupied
        GameGrid[gridX][gridY] = clicked; // Mark new position as occupied
        clicked.pos = snappedPos;
    } else {
        // If the grid square is already occupied, reset the position
        clicked.pos = oldPos;
    }
        
}

// Helper to snap a position to the grid
function snapToGrid(k: KAPLAYCtx, pos: { x: number, y: number }) {
    return k.vec2(
        Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
        Math.round(pos.y / GRID_SIZE) * GRID_SIZE
    );
}
