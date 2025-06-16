import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

export default function drawPlayer(k: KAPLAYCtx, pos: Vec2) {
    
    const player = k.add([
        k.circle(5),
        k.color(255, 255, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.pos(pos),
        k.area(),
        k.anchor('center'),
        {
            username: '-1',
            placed: false,
            home: {
                fence: null as GameObj | null,
                label: null as GameObj | null,
            },
            freeze: false,
        }
    ])

    const speed = 200;

     k.onKeyDown(['w', 'up'], () => {
        if (!player.freeze) {
            player.move(k.vec2(0, -1).scale(speed))            
        }
    });
    k.onKeyDown(['a', 'left'], () => {
        if (!player.freeze) {
            player.move(k.vec2(-1, 0).scale(speed))            
        }
    });
    k.onKeyDown(['s', 'down'], () => {
        if (!player.freeze) {
            player.move(k.vec2(0, 1).scale(speed))            
        }
    })
    k.onKeyDown(['d', 'right'], () => {
        if (!player.freeze) {
            player.move(k.vec2(1, 0).scale(speed))            
        }
    });

    return player;
}