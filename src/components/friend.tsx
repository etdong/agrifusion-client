import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

export default function drawFriend(k: KAPLAYCtx, pos: Vec2) {
    
    const friend = k.add([
        k.circle(5),
        k.color(0, 255, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.pos(pos),
        k.area(),
        k.anchor('center'),
        {
            username: '-1',
            name: 'Friend',
            home: {
                fence: null as GameObj | null,
                label: null as GameObj | null,
            },
        }
    ])


    return friend;
}