import makeKaplayCtx from "./kaplay_context"
import initGame from "./scenes/game"

export default async function initKaplay() {
	const k = makeKaplayCtx()

    k.setLayers(['bg', 'game', 'fg', 'ui'], 'game')

    // load font
    k.loadFont('moot-jungle', './fonts/moot-jungle.ttf')
	
    // initialize scenes
    initGame(k)

    k.go('game')
}