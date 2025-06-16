import type { KAPLAYCtx, Vec2 } from "kaplay";

export const BuyerName: {[key: string]: string} = {
    'wheat': 'Baker',
    'cabbage': 'Chef'
}

export default function drawBuyer(k: KAPLAYCtx, pos: Vec2, cropType: string) {
    const buyer = k.add([
        k.rect(50, 50),
        k.color(0, 255, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.pos(pos),
        k.area(),
        k.anchor('center'),
        'buyer',
        {
            type: cropType,
            name: BuyerName[cropType] || 'Buyer',
        }
    ]);

    // Add text label for the buyer
    buyer.add([
        k.text(buyer.name, { size: 16 }),
        k.color(0, 0, 0), // Black text color
        k.pos(0, -30),
        k.anchor('center'),
    ]);

    return buyer;
}