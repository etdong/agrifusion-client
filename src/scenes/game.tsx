import { type GameObj, type KAPLAYCtx } from "kaplay";
import { getRelativeMousePos, updateCamPos, updateCamZoom } from "../utils/cam_utils";
import spawnCrop from "../utils/crop_utils";
import { CropSize, CropType } from "../entities/crop";

const GRID_SIZE = 72;

// Initialize a 2D matrix representing the game grid
const GRID_COLS = Math.ceil(1920 / GRID_SIZE); // Example width, adjust as needed
const GRID_ROWS = Math.ceil(1080 / GRID_SIZE); // Example height, adjust as needed

const GameGrid: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: GRID_COLS }, () =>
    Array.from({ length: GRID_ROWS }, () => null))


export default function initGame(k: KAPLAYCtx) {
    k.scene('game', () => {
        // const gameArea = k.add([
        //     k.rect(k.width(), k.height()),
        //     k.area(),
        //     k.scale(2),
        //     k.anchor('center'),
        //     k.pos(k.center()),
        //     k.layer('bg')
        // ]);
        // updateCamPos(k, gameArea.pos);
        // updateCamZoom(k);

        for (let x = 0; x <= k.width(); x += GRID_SIZE) {
            k.add([
                k.rect(2, k.height()),
                k.color(200, 200, 200),
                k.pos(x + GRID_SIZE/2, 0),
                k.anchor('topleft'),
                k.layer('bg'),
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
            spawnCrop(k, snapToGrid(k.vec2(100, 100)), CropSize.SMALL, CropType.CARROT);
        })

        button2.onClick(() => {
            spawnCrop(k, snapToGrid(k.vec2(200, 200)), CropSize.MEDIUM, CropType.CABBAGE);
        })

        button3.onClick(() => {
            // Log the current state of the game grid
            console.log("Current Game Grid State:");
            console.log(GameGrid);
        })


        // Helper to snap a position to the grid
        function snapToGrid(pos: { x: number, y: number }) {
            return k.vec2(
                Math.round(pos.x / GRID_SIZE) * GRID_SIZE,
                Math.round(pos.y / GRID_SIZE) * GRID_SIZE
            );
        }

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
                const oldGridX = oldPos.x / GRID_SIZE;
                const oldGridY = oldPos.y / GRID_SIZE;
                const snappedPos = snapToGrid(clicked.pos);
                const gridX = snappedPos.x / GRID_SIZE;
                const gridY = snappedPos.y / GRID_SIZE;
                const colls = clicked.getCollisions(); // Check for collisions on release
                if (colls.length > 0) {
                    for (const coll of colls) {
                        if (coll.target.tags.includes('crop') 
                            && coll.target.type === clicked.type
                            && coll.target.size === clicked.size
                            && clicked.size < CropSize.XLARGE) { // Prevent merging if already at max size
                            // merge the crops into a bigger one
                            const otherCrop = coll.target;
                            otherCrop.destroy()
                            const newSize = clicked.size + 5;
                            spawnCrop(k, snappedPos, newSize, clicked.type);
                            clicked.destroy()
                            GameGrid[oldGridX][oldGridY] = null; // Reset old position
                            // Find all adjacent crops of the same type and size
                        }
                    }
                }
                if (GameGrid[gridX][gridY] === null) {
                    GameGrid[oldGridX][oldGridY] = null; // Reset old position
                    GameGrid[gridX][gridY] = clicked; // Mark as occupied
                    clicked.pos = snappedPos;
                } else {
                    // If the grid square is already occupied, reset the position
                    clicked.pos = oldPos;
                }
                clicked.z = 1; // Reset z-index
                clicked = null;
            }
                
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

           
        });
    });
}
