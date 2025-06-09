import makeKaplayCtx from "./kaplay_context"
import initTitle from "./scenes/title"

export default async function initGame() {
	const k = makeKaplayCtx()

    k.setLayers(['bg', 'game', 'fg'], 'game')

    // load font
    k.loadFont('moot-jungle', './fonts/moot-jungle.ttf')
	
    // initialize scenes
    initTitle(k)

	k.go('title')
}