import { type KAPLAYCtx, type Vec2 } from "kaplay";
import { CropType } from "../entities/crop";

/**
 * Spawns a crop at the specified position with the given size and type.
 * The crop can be clicked and dragged around the game area.
 *
 * @param {KAPLAYCtx} k - The Kaplay context.
 * @param {Vec2} pos - The spawned position of the crop.
 * @param {number} size - The size of the crop.
 * @param {string} type - The type of crop (default is 'carrot').
 * @returns {object} The spawned crop object.
 */
export default function spawnCrop(k: KAPLAYCtx, pos: Vec2, size: number, type: string = CropType.CARROT) {
    const crop = k.add([
        k.circle(size),
        k.pos(pos),
        k.color(255, 165, 0), // Default color (orange for carrot)
        k.anchor('center'),
        k.area(),
        k.scale(1),
        k.z(1),
        k.layer('game'),
        k.outline(2, k.rgb(0, 0, 0)),
        'crop',
        {
            size: size, // Store the size for potential future use
            type: type, // Custom property to identify the crop type
        }
    ]);

    switch (type) {
        case CropType.CARROT:
            crop.color = k.rgb(255, 165, 0); // Orange for carrot
            break;
        case CropType.POTATO:
            crop.color = k.rgb(210, 180, 140); // Tan for potato
            break;
        case CropType.TOMATO:
            crop.color = k.rgb(255, 99, 71); // Red for tomato
            break;
        case CropType.CABBAGE:
            crop.color = k.rgb(144, 238, 144); // Light green for cabbage
            break;
        case CropType.WHEAT:
            crop.color = k.rgb(255, 228, 181); // Wheat color
            break;
        case CropType.CORN:
            crop.color = k.rgb(255, 255, 0); // Yellow for corn
            break;
        case CropType.RICE:
            crop.color = k.rgb(245, 245, 220); // Beige for rice
            break;
        case CropType.BEAN:
            crop.color = k.rgb(34, 139, 34); // Green for bean
            break;
        case CropType.ONION:
            crop.color = k.rgb(255, 228, 196); // Light brown for onion
            break;
        case CropType.GARLIC:
            crop.color = k.rgb(255, 250, 205); // Light yellow for garlic
            break;
        default:
            crop.color = k.rgb(255, 165, 0); // Default to orange if type is unknown
    }

    return crop;
}