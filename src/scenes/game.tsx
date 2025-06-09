import { type KAPLAYCtx } from "kaplay";
import { getRelativeMousePos, updateCamPos, updateCamZoom } from "../utils/cam_utils";
import spawnCarrot from "../utils/crops";

export default function initGame(k: KAPLAYCtx) {
    k.scene('game', () => {
        // Add a rectangle to represent the game area
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


        // Add a simple text label
        k.add([
            k.text('Game Scene', { size: 32 }),
            k.color(0, 0, 0),
            k.pos(k.center()),
            k.anchor('center'),
            k.area(),
            'game-text',
        ]);

        const button = k.add([
            k.rect(40, 30),
            k.area(),
            k.outline(2, k.rgb(0, 0, 0)),
            k.color(255,0,0)
        ])

        button.onClick(() => {
            spawnCarrot(k, k.vec2(100, 100), 30);
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let clicked: any = null;

        // Spawn some carrots in the game area
        spawnCarrot(k, k.vec2(100, 100), 20);
        spawnCarrot(k, k.vec2(200, 150), 20);

        // letter dropped
        k.onMouseRelease("left", () => {
            // @ts-expect-error global currentlyDraggingCarrot = null; // Reset the global dragging carrot reference
            const colls = k.currentlyDraggingCarrot.getCollisions();

            if (colls.length != 0) {
                for (let i = 0; i < colls.length; i++) {
                    if (colls[i].target.tags.includes("carrot")) {
                        k.debug.log(`Collided with carrot`);
                        
                    }
                }
            }
            k.wait(0.1, () => {
            clicked.z = 1; // Reset z-index after the tween
            clicked = null; // Reset clicked object
            })
        })

        k.onUpdate(() => {
            // // Update camera zoom based on screen size
            // updateCamZoom(k);

            // // Center camera on the game area
            // updateCamPos(k, gameArea.pos);
        });
    });
}