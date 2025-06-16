import type { GameObj, KAPLAYCtx } from "kaplay";
import socket from "./socket";

export default function drawBuyerUI(k: KAPLAYCtx, buyer: GameObj, price: number) {
    // Create a UI container for the buyer
    const uiContainer = k.add([
        k.rect(360, 180), // Size of the UI container
        k.color(255, 255, 255), // White background
        k.outline(2, k.rgb(0, 0, 0)), // Black outline
        k.layer('ui'),
        k.pos(k.center()),
        k.anchor('center'),
        k.fixed(),
        {
            name: buyer.name,
        }
    ]);

    // Add a text label for the buyer UI
    uiContainer.add([
        k.text(buyer.name, { size: 24 }),
        k.color(0, 0, 0), // White text color
        k.layer('ui'),
        k.pos(0, -50), // Position the text above the center
        k.anchor('center'),
        k.fixed(),
    ]);

    // add a close button to the top right corner
    uiContainer.add([
        k.text('X', { size: 24 }),
        k.color(255, 0, 0), // Red color for the close button
        k.layer('ui'),
        k.pos(130, -55), // Position the close button
        k.anchor('center'),
        k.area(),
        k.fixed(),
    ]).onClick(() => {
        uiContainer.destroy(); // Destroy the UI when clicked
    });

    // add text to display the buyer's offer
    uiContainer.add([
        k.text(`Offer: $${price} for one ${buyer.type}`, { size: 20 }), // Example offer text
        k.color(0, 0, 0), // Black text color
        k.layer('ui'),
        k.pos(0, 0), // Position the offer text in the center
        k.anchor('center'),
        k.fixed(),
    ]);

    // add a button to accept the buyer's offer
    uiContainer.add([
        k.text('Accept', { size: 20 }),
        k.color(0, 255, 0), // Green color for the accept button
        k.layer('ui'),
        k.pos(0, 50), // Position the accept button
        k.anchor('center'),
        k.area(),
        k.fixed(),
    ]).onClick(() => {
        // Logic to accept the buyer's offer
        socket.emit('POST player/sell', {price: price, crop: buyer.type}, (response: { status: string, data: string }) => {
            if (response.status === 'ok') {
                console.log(response.data);
            } else {
                console.error(`Failed to sell: ${response.data}`);
            }
        })
        uiContainer.destroy(); // Destroy the UI after accepting
    });

    return uiContainer;
}