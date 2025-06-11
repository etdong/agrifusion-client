import type { GameObj, KAPLAYCtx, Vec2 } from "kaplay";

const PlayerFarm: { [key: number]: { [key: number]: GameObj | null } } = Array.from({ length: 3 }, () =>
    Array.from({ length: 3 }, () => null))

export default function drawPlayer(k: KAPLAYCtx, 
    pos: Vec2, 
    farm: { [key: number]: { [key: number]: GameObj | null } } = PlayerFarm) {
    
    const player = k.add([
        k.circle(5),
        k.color(255, 255, 0),
        k.outline(2, k.rgb(0, 0, 0)),
        k.pos(pos),
        k.area(),
        k.anchor('center'),
        {
            playerId: Math.random(),
            name: 'Player',
            farm: farm,
            placed: false,
            home: {
                x: 0, 
                y: 0, 
                fence: null as GameObj | null,
                origin: null as GameObj | null,
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