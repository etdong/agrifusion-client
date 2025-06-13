import { Vec2, type GameObj, type KAPLAYCtx } from "kaplay";
import { getRelativeMousePos } from "../utils/cam_utils";
import spawnCrop from "../utils/crop_utils";
import { CropSize, CropType, type Crop } from "../entities/crop";
import drawPlayer from "../entities/player";
import socket from "../utils/socket";
import drawFriend from "../entities/friend";

const GRID_SIZE = 72;

const MAP_SIZE = 50

const GameGrid: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: MAP_SIZE }, () =>
    Array.from({ length: MAP_SIZE }, () => null))

const playerList: { [key: string]: GameObj } = {};

export default function initGame(k: KAPLAYCtx) {
    k.scene('game', () => {
        k.add([
            k.rect(GRID_SIZE * MAP_SIZE, GRID_SIZE * MAP_SIZE, { fill: false }),
            k.anchor('topleft'),
            k.outline(2, k.rgb(255, 0, 0)),
            k.pos(-GRID_SIZE/2),
        ]);

        k.setCamPos(0, 0)

        socket.on('UPDATE player/disconnect', (data) => {
            const playerId = data.playerId;
            const friend = playerList[playerId];
            if (friend) {
                friend.home.fence.destroy();
                friend.destroy();
                delete playerList[playerId];
                console.debug(`Player ${playerId} disconnected`);
            }
        })

        let player: GameObj | null = null;
        
        k.load(new Promise<void>((resolve, reject) => {
            let tries = 0;
            const checkLogin = setInterval(() => {
                fetch(import.meta.env.VITE_SERVER_URL + "/account", { 
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'include',
                }).then(res => res.json()).then(data => {
                    if (data.loggedIn) {
                        player = drawPlayer(k, k.vec2(0, 0))
                        player.name = data.name;
                        player.playerId = data.id;
                        clearInterval(checkLogin);
                        socket.emit('POST player/login', { playerId: data.id, playerName: data.name }, (response: { status: string; data: string; }) => {
                            if (response.status === 'ok') {
                                console.debug(`Player ${data.id} logged in as ${data.name}`);
                                socket.emit('GET player/data', (response: { status: string, data: string }) => {
                                    if (response.status === 'ok') {
                                        playerList[player!.playerId] = player!;
                                        console.debug(`Player ${player!.playerId} data loaded successfully`);
                                        resolve();
                                    } else {
                                        reject(new Error(`Failed to load player data: ${response.data}`));
                                        if (window.location.href === import.meta.env.VITE_CLIENT_URL + '/#/play') {
                                            window.location.href = import.meta.env.VITE_CLIENT_URL
                                        }
                                    }
                                })
                            } else {
                                reject(new Error(`Failed to log in: ${response.data}`));
                                if (window.location.href === import.meta.env.VITE_CLIENT_URL + '/#/play') {
                                    window.location.href = import.meta.env.VITE_CLIENT_URL
                                }
                            }
                        })
                    } else {
                        console.debug(`Failed to get login data. Retrying... (${tries + 1}/5)`);
                        tries++;
                        if (tries >= 5) {
                            clearInterval(checkLogin);
                            reject(new Error(`Failed to get login data after 5 attempts`));
                            if (window.location.href === import.meta.env.VITE_CLIENT_URL + '/#/play') {
                                window.location.href = import.meta.env.VITE_CLIENT_URL
                            }
                        }
                    }
                })
            }, 1000)
        }))

        socket.on('UPDATE player/pos', (data) => {
            for (const i in data) {
                const p = data[i];  
                if (player && p.playerId !== '-1' && p.playerId !== player.playerId) {
                    if (!playerList[p.playerId]) {
                        const friend = drawFriend(k, k.vec2(p.pos.x, p.pos.y));
                        friend.playerId = p.playerId;
                        playerList[p.playerId] = friend;
                    } else {
                        const friend = playerList[p.playerId];
                        friend.pos = k.vec2(p.pos.x, p.pos.y);
                    }
                }
            }
            
        })

        k.onKeyPress('r', () => {
            if (player) handleFarmPlacement(k, player);
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
            const newCrop: Crop = {
                id: Math.floor(Math.random() * 1000), // Random ID for the crop
                pos: getGridCoords(k, k.vec2(200, 200)),
                type: CropType.CABBAGE,
                size: CropSize.MEDIUM
            }
            socket.emit('POST game/crop/spawn', { newCrop }, (response: { status: string, data: Crop }) => {
                if (response.status === 'ok') {
                    console.debug(`Crop spawned ${response.data}`);
                }
            })
        })

        button3.onClick(() => {
            // Log the current state of the game grid
            console.debug("Current Game Grid State:");
            console.debug(GameGrid);
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
                    handleCropMove(k, clicked, oldPos);
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
            if (!player) return;
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

        setInterval(() => {
            if (player) {
                socket.emit('POST player/pos', { pos: player.pos }, (response: { status: string; data: string; }) => {
                    if (response.status !== 'ok') {
                        console.error('Failed to update player position:', response.data);
                    }
                })
            }
        }, 1000/10);
        

        socket.on('UPDATE game/grid', (data) => {
            const gridData = data.grid;
            const claimData = data.claim;
            for (let x = 0; x < MAP_SIZE; x++) {
                for (let y = 0; y < MAP_SIZE; y++) {
                    // If cropData is null, it means the grid square is empty
                    const currentSquare = GameGrid[x][y]
                    if (gridData[`${x},${y}`] && gridData[`${x},${y}`] !== undefined) {
                        const cropData = gridData[`${x},${y}`].crop
                        if (currentSquare !== null) {
                            if (currentSquare.type !== cropData.type || currentSquare.size !== cropData.size) {
                                GameGrid[x][y]!.destroy();
                                GameGrid[x][y] = spawnCrop(k, k.vec2(x * GRID_SIZE, y * GRID_SIZE), cropData.size, cropData.type);
                            }
                        } else {
                            GameGrid[x][y] = spawnCrop(k, k.vec2(x * GRID_SIZE, y * GRID_SIZE), cropData.size, cropData.type);
                        }
                    } else {
                        if (GameGrid[x][y] !== null) {
                            GameGrid[x][y]!.destroy();
                            GameGrid[x][y] = null;
                        }
                    }
                }
            }

            for (const claimOwner in claimData) {
                const claim = claimData[claimOwner];
                const claimSize = claim.size;
                const claimOrigin = claim.origin;
                if (claimOrigin.x < 0 && claimOrigin.y < 0) {
                    const temp = playerList[claimOwner];
                    if (temp && temp.placed) {
                        temp.home.fence.destroy();
                        temp.home.label.destroy();
                        temp.home.fence = null;
                        temp.home.label = null;
                    }
                    
                } 
                else if (player && claimOwner === player.playerId && !player.home.fence) {
                    player.home.fence = k.add([
                        k.rect(GRID_SIZE * claimSize, GRID_SIZE * claimSize, { fill: false }),
                        k.pos(claimOrigin.x * GRID_SIZE - GRID_SIZE/2, claimOrigin.y * GRID_SIZE - GRID_SIZE/2),
                        k.anchor('topleft'),
                        k.area(),
                        k.outline(2, k.rgb(85, 164, 255)),
                    ])
                    player.home.label = k.add([
                        k.text(claim.name, { size: 24, font: 'moot-jungle' }),
                        k.pos(claimOrigin.x * GRID_SIZE, claimOrigin.y * GRID_SIZE - GRID_SIZE/2 - 20),
                        k.anchor('center'),
                        k.color(0, 0, 0),
                        k.z(10),
                    ])
                } else {
                    const friend = playerList[claimOwner];
                    if (friend && !friend.home.fence) {
                        friend.home.fence = k.add([
                            k.rect(GRID_SIZE * claimSize, GRID_SIZE * claimSize, { fill: false }),
                            k.pos(claimOrigin.x * GRID_SIZE - GRID_SIZE/2, claimOrigin.y * GRID_SIZE - GRID_SIZE/2),
                            k.anchor('topleft'),
                            k.area(),
                            k.outline(2, k.rgb(91, 243, 111)),
                        ])

                        friend.home.label = k.add([
                            k.text(claim.name, { size: 24, font: 'moot-jungle' }),
                            k.pos(claimOrigin.x * GRID_SIZE, claimOrigin.y * GRID_SIZE - GRID_SIZE/2 - 20),
                            k.anchor('center'),
                            k.color(0, 0, 0),
                        ])
                    }
                }
            }
        })
    });
}

function handleFarmPlacement(k: KAPLAYCtx, player: GameObj) {
    const playerGridPos = getGridCoords(k, player.pos);
    if (!player.placed) {
        const placingText = k.add([
            k.text('Placing farm...', {
                    font: 'moot-jungle',
                }),
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        socket.emit('GET player/farm', (response: { status: string; data: any; }) => {
            if (response.status === 'ok') {
                console.debug(`Player ${player.playerId} farm data received`);
                player.placed = true;
                player.home = { x: playerGridPos.x, y: playerGridPos.y };
            } else {
                console.error('Failed to place farm:', response.data);
            }
            player.freeze = false;
            placingText.destroy();
            placingTextBackground.destroy()
        })
    } else {
        const savingText = k.add([
            k.text('Saving farm...', {
                font: 'moot-jungle',
            }),
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

        socket.emit('POST player/farm', (response: { status: string; data: string; }) => {
            if (response.status === 'ok') {
                console.debug(`Player ${player.playerId} farm saved successfully`);
                player.home.fence?.destroy();
                player.home.label?.destroy();
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

function handleCropMove(k: KAPLAYCtx, clicked: GameObj, oldPos: Vec2) {
    // Keep track of old and new grid positions
    const oldGridPos = getGridCoords(k, oldPos);
    const newGridPos = getGridCoords(k, clicked.pos);
    clicked.pos = k.vec2(newGridPos.x * GRID_SIZE, newGridPos.y * GRID_SIZE);

    socket.emit('POST game/crop/move', { oldPos: oldGridPos, newPos: newGridPos }, (response: { status: string, data: string }) => {
        if (response.status !== 'ok') {
            console.debug('Failed to move crop:', response.data);
            // Reset the position of the clicked crop if the move fails
            clicked.pos = oldPos;
        }
    })       
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