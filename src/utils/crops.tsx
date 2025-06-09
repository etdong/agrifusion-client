import type { KAPLAYCtx, Vec2 } from "kaplay";
import { getRelativeMousePos } from "./cam_utils";


export default function spawnCarrot(k: KAPLAYCtx, pos: Vec2, size: number) {
    const carrot = k.add([
        k.circle(size),
        k.pos(pos),
        k.color(255, 128, 0), // Carrot color
        k.anchor('center'),
        k.area(),
        k.scale(1),
        k.z(1),
        k.layer('game'),
        k.outline(2, k.rgb(0, 0, 0)),
        'crop',
        {
            size: size, // Store the size for potential future use
            type: 'carrot', // Custom property to identify the crop type
        }
    ]);

    let isDragging = false;

    // Track the currently dragged carrot globally
    // @ts-ignore
    if (!k.currentlyDraggingCarrot) k.currentlyDraggingCarrot = null;

    k.onMousePress("left", () => {
        // Only allow dragging if no other carrot is being dragged
        if (carrot.isHovering() && !k.currentlyDraggingCarrot) {
            isDragging = true;
            // @ts-ignore
            k.currentlyDraggingCarrot = carrot;
            carrot.z = 3 /// Bring the clicked object to the front
            k.tween(
                carrot.scale,
                k.vec2(1.2),
                0.1,
                (newScale) => carrot.scale = newScale,
                k.easings.linear
            )
            k.tween(
                carrot.pos,
                getRelativeMousePos(k),
                0.1,
                (newPos) => carrot.pos = newPos,
                k.easings.easeOutQuad
            )
        }
    });

    k.onMouseRelease("left", () => {
        if (isDragging) {
            isDragging = false;
            // @ts-expect-error global currentlyDraggingCarrot = null; // Reset the global dragging carrot reference
            k.currentlyDraggingCarrot = null;
            carrot.z = 1; // Reset z-index
            k.tween(
                carrot.scale,
                k.vec2(1),
                0.1,
                (newScale) => carrot.scale = newScale,
                k.easings.linear
            )
        }
    });

    k.onMouseRelease("left", () => {
        isDragging = false;
    });

    k.onUpdate(() => {
        if (isDragging) {
            const mousePos = getRelativeMousePos(k);
            carrot.pos = mousePos;
        }
    });

    return carrot;
}

// export default function spawnCrop(k: KAPLAYCtx, pos: Vec2, cropType: string) {
//     const crop = k.add([
//         k.sprite(cropType),
//         k.pos(pos),
//         k.anchor('center'),
//         k.area(),
//         k.scale(1),
//         k.z(1),
//         k.outline(2, k.rgb(0, 0, 0)),
//         'crop',
//     ]);

//     // Add a click handler to the crop
//     k.onClick(crop, () => {
//         // Handle crop click logic here
//         console.log(`Crop clicked: ${cropType}`);
//     });

//     return crop;
// }