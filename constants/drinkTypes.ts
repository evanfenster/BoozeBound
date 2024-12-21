export interface DrinkType {
  id: string;
  name: string;
  abv: number;
  defaultVolume: number;
  minVolume: number;
  maxVolume: number;
  volumeStep: number;
}

export const DRINK_TYPES: DrinkType[] = [
  {
    id: 'beer',
    name: 'Beer',
    abv: 0.05,
    defaultVolume: 12,
    minVolume: 8,
    maxVolume: 32,
    volumeStep: 4,
  },
  {
    id: 'wine',
    name: 'Wine',
    abv: 0.12,
    defaultVolume: 5,
    minVolume: 3,
    maxVolume: 12,
    volumeStep: 1,
  },
  {
    id: 'cocktail',
    name: 'Cocktail',
    abv: 0.40,
    defaultVolume: 1.5,
    minVolume: 1,
    maxVolume: 4,
    volumeStep: 0.5,
  },
  {
    id: 'shot',
    name: 'Shot',
    abv: 0.40,
    defaultVolume: 1.5,
    minVolume: 1,
    maxVolume: 2,
    volumeStep: 0.5,
  },
  {
    id: 'custom',
    name: 'Custom',
    abv: 0.05,
    defaultVolume: 12,
    minVolume: 0.5,
    maxVolume: 40,
    volumeStep: 0.5,
  },
];