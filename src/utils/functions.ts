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

export const convertDateToUTCMinus7 = (date: Date | null) => {
  if (!date) return null;
  date = new Date(date);
  return new Date(
    Date.UTC(
      new Date(date).getFullYear(),
      new Date(date).getMonth(),
      new Date(date).getDate()
    )
  );
};

export const convertDateToUTCMinus7String = (
  day: string | null | undefined,
  month: string | null | undefined,
  year: string | null | undefined
) => {
  if (!day || !month || !year) return null;
  return convertDateToUTCMinus7(new Date(`${month}/${day}/${year}`));
};
