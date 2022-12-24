export const translateRarityToClassName = (rarity: number) => {
  switch (rarity) {
    case 1:
      return "bg-1-star";
    case 2:
      return "bg-2-star";
    case 3:
      return "bg-3-star";
    case 4:
      return "bg-4-star";
    case 5:
      return "bg-5-star";
    case 6:
      return "bg-6-star";
    default:
      return "bg-gray-100";
  }
};
