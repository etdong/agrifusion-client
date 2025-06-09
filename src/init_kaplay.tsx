import makeKaplayCtx from "./kaplay_context"
import initGame from "./scenes/game"
import initTitle from "./scenes/title"

export default async function initKaplay() {
	const k = makeKaplayCtx()

    k.setLayers(['bg', 'game', 'fg'], 'game')

    // load font
    k.loadFont('moot-jungle', './fonts/moot-jungle.ttf')
	
    // initialize scenes
    initTitle(k)
    initGame(k)

	k.go('game')
}