import type { KAPLAYCtx } from "kaplay";
import { updateCamPos, updateCamZoom } from "../utils/cam_utils";

/**
 * Initializes the menu screen
 * @param k KAPLAY context
 */
export default function initTitle(k: KAPLAYCtx) {
    k.scene('title', () => {

        const background = k.add([
            k.rect(k.width(), k.height()),
            k.area(),
            k.scale(2),
            k.anchor('center'),
            k.pos(k.center()),
        ])
        updateCamPos(k, background.pos);
        updateCamZoom(k);


        // Draw the title text
        k.add([
            k.text('AGRIFUSION', {
                size: 48,
                font: 'moot-jungle'
            }),
            k.pos(k.center()),
            k.anchor('center'),
            k.color(0, 0, 0),
            'title-text'
        ])

        k.onUpdate(() => {
            // Update camera zoom based on screen size
            updateCamZoom(k);

            // Center camera on the background
            updateCamPos(k, background.pos);
        });
    });
}