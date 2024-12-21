export const calculateStandardDrinks = (oz: number, abv: number) => {
    // standardDrinks = (volume(ml) * ABV * 0.8) / 14
    const ml = oz * 29.57;
    return (ml * abv * 0.8) / 14;
  };
  