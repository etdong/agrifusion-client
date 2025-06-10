import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";


const PlayerFarm: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => null))

export default function drawPlayer(k: KAPLAYCtx, pos: Vec2) {
    
    const player = k.add([
        k.circle(5),
        k.color(255, 255, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.pos(pos),
        k.area(),
        k.anchor('center'),
        {
            farm: PlayerFarm,
            placed: false,
            home: {
                x: 0, 
                y: 0, 
                fence: null,
                origin: null,
            },
        }
    ])

    const speed = 200;

     k.onKeyDown(['w', 'up'], () => {
        player.move(k.vec2(0, -1).scale(speed))
    });
    k.onKeyDown(['a', 'left'], () => {
        player.move(k.vec2(-1, 0).scale(speed))
    });
    k.onKeyDown(['s', 'down'], () => {
        player.move(k.vec2(0, 1).scale(speed))
    })
    k.onKeyDown(['d', 'right'], () => {
        player.move(k.vec2(1, 0).scale(speed))
    });

    return player;
}