import { Vec2, type GameObj, type KAPLAYCtx } from "kaplay";
import { getRelativeMousePos } from "../utils/cam_utils";
import spawnCrop from "../utils/crop_utils";
import { CropSize, CropType, type Crop } from "../entities/crop";
import drawPlayer from "../entities/player";
import socket from "../utils/socket";

const GRID_SIZE = 72;

const MAP_SIZE = 50

const GameGrid: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: MAP_SIZE }, () =>
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

        socket.emit('GET_player', (response: any) => {
            if (response.status === 'ok') {
                // const playerFarm = response.data;
                // drawPlayer(k, k.center(), playerFarm)
            }
        })

        k.onKeyPress('r', () => {
            handleFarmPlacement(k, player);
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
                if (clicked.pos.x < 0 || clicked.pos.x >  GRID_SIZE * MAP_SIZE 
                    || clicked.pos.y < 0 || clicked.pos.y > GRID_SIZE * MAP_SIZE) {
                    // If the clicked crop is outside the game area, reset its position
                    clicked.pos = oldPos;
                } else {
                    handleMerge(k, clicked, oldPos);
                }
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

function handleFarmPlacement(k: KAPLAYCtx, player: GameObj) {
    const playerGridPos = getGridCoords(k, player.pos);
    if (!player.placed) {
        const placingText = k.add([
            k.text('Placing farm...'),
            k.pos(player.pos),
            k.anchor('center'),
            k.layer('ui'),
            k.z(1000),
            k.color(0, 0, 0),
        ])
        const placingTextBackground = k.add([
            k.rect(placingText.width + 32, placingText.height + 32),
            k.pos(placingText.pos.sub(k.vec2(5, 5))),
            k.anchor('center'),
            k.layer('ui'),
            k.color(255, 255, 255),
            k.outline(2, k.rgb(0, 0, 0)),
        ])
        player.freeze = true;
        socket.emit('GET player/farm', { id: player.playerId }, (response: any) => {
            if (response.status === 'ok') {
                console.log(`Player ${player.playerId} farm data received`);
                const playerFarm = response.data
                for (let x = 0; x < 3; x++) {
                    for (let y = 0; y < 3; y++) {
                        const cropData = playerFarm[x][y];
                        if (cropData) {
                            const tempX = playerGridPos.x + x;
                            const tempY = playerGridPos.y + y;
                            player.farm[x][y] = spawnCrop(k, k.vec2(tempX * GRID_SIZE, tempY * GRID_SIZE), cropData.size, cropData.type);
                            GameGrid[playerGridPos.x + x][playerGridPos.y + y] = player.farm[x][y];
                        } else {
                            player.farm[x][y] = null;
                        }
                    }
                }
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
                player.home = { x: playerGridPos.x, y: playerGridPos.y, fence: fence, origin: origin };
            } else {
                console.error('Failed to place farm:', response.data);
            }
            player.freeze = false;
            placingText.destroy();
            placingTextBackground.destroy()
        })
    } else {
        if (playerGridPos.x === player.home.x && playerGridPos.y === player.home.y) {
            const PlayerFarmPackage: { 
                [key: number]: { [key: number]: Crop | null } 
            } = Array.from({ length: 3 }, () =>
                Array.from({ length: 3 }, () => null))

            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    const tempX = playerGridPos.x + x;
                    const tempY = playerGridPos.y + y;
                    const crop = GameGrid[tempX][tempY];
                    PlayerFarmPackage[x][y] = crop ? {
                        type: crop.type,
                        size: crop.size
                    } : null;
                }
            }

            const savingText = k.add([
                k.text('Saving farm...'),
                k.pos(player.pos),
                k.anchor('center'),
                k.color(0, 0, 0),
                k.layer('ui'),
                k.z(1000),
            ])
            const savingTextBackground = k.add([
                k.rect(savingText.width + 32, savingText.height + 32),
                k.pos(savingText.pos.sub(k.vec2(5, 5))),
                k.anchor('center'),
                k.layer('ui'),
                k.color(255, 255, 255),
                k.outline(2, k.rgb(0, 0, 0)),
            ])

            player.freeze = true;

            socket.emit('POST player/farm', {
                id: player.playerId,
                farm: PlayerFarmPackage
            }, (response: { status: string; data: string; }) => {
                if (response.status === 'ok') {
                    console.log(`Player ${player.playerId} farm saved successfully`);
                    player.home.fence?.destroy();
                    player.home.origin?.destroy();
                    for (let x = 0; x < 3; x++) {
                        for (let y = 0; y < 3; y++) {
                            const tempX = playerGridPos.x + x;
                            const tempY = playerGridPos.y + y;
                            if (GameGrid[tempX][tempY] !== null) {
                                GameGrid[tempX][tempY].destroy()
                            }
                            player.farm[x][y] = GameGrid[tempX][tempY];
                            GameGrid[tempX][tempY] = null;
                        }
                    }
                    player.placed = false;
                } else {
                    console.error('Failed to save farm:', response.data);
                }
                player.freeze = false;
                savingText.destroy();
                savingTextBackground.destroy();
            })
        }
    }
}

function handleMerge(k: KAPLAYCtx, clicked: GameObj, oldPos: Vec2) {
    // Keep track of old and new grid positions
    const oldGridPos = getGridCoords(k, oldPos);
    const snappedPos = snapToGrid(k, clicked.pos);
    const newGridPos = getGridCoords(k, clicked.pos);

    // Check if the dropped crop is in a new grid position and if the new position is occupied
    if ((oldGridPos.x !== newGridPos.x || oldGridPos.y !== newGridPos.y) && GameGrid[newGridPos.x][newGridPos.y] !== null) {
        const coll = GameGrid[newGridPos.x][newGridPos.y];

        // Is the colliding object a crop of the same type and size?
        if (coll && coll.tags.includes('crop') 
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
                        if (crop) {
                            crop.destroy();
                            const tempGridPos = getGridCoords(k, crop.pos);
                            GameGrid[tempGridPos.x][tempGridPos.y] = null; // Reset old position
                        }
                    }
                    // Spawn one new crop of the next size
                    GameGrid[newGridPos.x][newGridPos.y] = spawnCrop(k, snappedPos, newSize, clicked.type);
                    GameGrid[oldGridPos.x][oldGridPos.y] = null; // Reset old position
                    break;
                case mergeGroup.length >= 5:
                    // Bonus merge: Merge up to 5 crops into two new crops of the next size
                    { for (let i = 0; i < 5; i++) {
                        const crop = mergeGroup[i];
                        crop.destroy();
                        const tempGridPos = getGridCoords(k, crop.pos);
                        GameGrid[tempGridPos.x][tempGridPos.y] = null; // Reset old position
                    }

                    GameGrid[newGridPos.x][newGridPos.y] = spawnCrop(k, snappedPos, newSize, clicked.type);
                    // Spawn the second crop at nearest position to the first
                    const bonusCropGridPos = getGridCoords(k, mergeGroup[2].pos);
                    GameGrid[bonusCropGridPos.x][bonusCropGridPos.y] = spawnCrop(k, snapToGrid(k, mergeGroup[2].pos), newSize, clicked.type);
                    GameGrid[oldGridPos.x][oldGridPos.y] = null;

                    break; 
                }
            }
        }
    }

    // If the grid square is empty, move the clicked crop to the new position
    if (GameGrid[newGridPos.x][newGridPos.y] === null) {
        GameGrid[oldGridPos.x][oldGridPos.y] = null; // Set old position to unoccupied
        GameGrid[newGridPos.x][newGridPos.y] = clicked; // Mark new position as occupied
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

function getGridCoords(k: KAPLAYCtx, pos: { x: number, y: number }) {
    return {
        x: snapToGrid(k, pos).x / GRID_SIZE,
        y: snapToGrid(k, pos).y / GRID_SIZE
    };
}