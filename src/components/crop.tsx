export const CropType = {
    WHEAT: 'wheat',
    CANE: 'sugarcane',
    CARROT: 'carrot',
    CABBAGE: 'cabbage',
    POTATO: 'potato',
    TOMATO: 'tomato',
    PUMPKIN: 'pumpkin',
    CORN: 'corn',
    BEAN: 'bean',
    ONION: 'onion',
    GARLIC: 'garlic'
} as const;

export type CropType = (typeof CropType)[keyof typeof CropType];

export const CropSize = {
    SMALL: 20,
    MEDIUM: 25,
    LARGE: 30,
    XLARGE: 35
} as const;

export type Crop = {
    id: number,
    pos: { x: number; y: number },
    type: (typeof CropType)[keyof typeof CropType];
    size: (typeof CropSize)[keyof typeof CropSize];
};