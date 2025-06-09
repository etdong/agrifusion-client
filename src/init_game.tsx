import makeKaplayCtx from "./kaplay_context"

export default async function initGame() {
	const k = makeKaplayCtx()

    k.setLayers(['bg', 'game', 'fg'], 'game')
	
    // initialize scenes

	k.go('menu')
}