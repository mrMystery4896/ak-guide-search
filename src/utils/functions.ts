import { EventWithChildren } from "./common-types";

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

export const getEvent = async () => {
  const eventList = await prisma?.event.findMany({
    include: {
      stages: {
        orderBy: {
          stageCode: "asc",
        },
      },
      parentEvent: true,
    },
  });

  // Transform eventList from flat list to tree
  const map = new Map<string, EventWithChildren>();
  const roots: EventWithChildren[] = [];

  eventList?.forEach((event) => map.set(event.id, event));
  eventList?.forEach((event) => {
    if (event.parentEventId) {
      const parent = map.get(event.parentEventId);
      if (parent) {
        if (!parent.childEvents) {
          parent.childEvents = [];
        }
        parent.childEvents.push(event);
      }
    } else {
      roots.push(event);
    }
  });

  return roots;
};

export const getEliteBasedOnRarity = (rarity: number) => {
  switch (rarity) {
    case 6:
    case 5:
    case 4:
      return [0, 1, 2];
    case 3:
      return [0, 1];
    case 2:
    case 1:
      return [0];
    default:
      return [];
  }
};

export const calculateMaxLevel = (rarity: number, elite: number) => {
  switch (rarity) {
    case 1:
    case 2:
      return 30;
    case 3:
      return elite === 0 ? 40 : 55;
    case 4:
      return elite === 0 ? 45 : elite === 1 ? 60 : 70;
    case 5:
      return elite === 0 ? 50 : elite === 1 ? 70 : 80;
    case 6:
      return elite === 0 ? 50 : elite === 1 ? 80 : 90;
    default:
      return null;
  }
};

export const getSkill = (rarity: number, elite: number) => {
  switch (rarity) {
    case 1:
    case 2:
      return [];
    case 3:
      return [1];
    case 4:
    case 5:
      return elite === 0 ? [1] : [1, 2];
    case 6:
      return elite === 0 ? [1] : elite === 1 ? [1, 2] : [1, 2, 3];
    default:
      return [];
  }
};

export const getSkillLevel = (elite: number) => {
  switch (elite) {
    case 0:
      return [1, 2, 3, 4];
    case 1:
    case 2:
      return [1, 2, 3, 4, 5, 6, 7];
    default:
      return [];
  }
};

export const getMastery = (elite: number) => {
  if (elite === 2) return [0, 1, 2, 3];
  return [];
};

export const getModule = (
  elite: number,
  rarity: number
): ("X" | "Y" | "None")[] => {
  switch (rarity) {
    case 1:
    case 2:
    case 3:
      return ["None"];
    default:
      return elite >= 2 ? ["None", "X", "Y"] : ["None"];
  }
};

export const formatEliteLevel = (
  elite: number | null,
  level: number | null
) => {
  if (elite === null && level === null) return "Unknown";
  if (level === null) return `Elite ${elite}`;
  return `E${elite} L${level}`;
};

export const formatSkillLevel = (
  skill: number | null,
  skillLevel: number | null,
  mastery: number | null
) => {
  if (skill === null && skillLevel === null && mastery === null)
    return "Unknown";
  if (skillLevel == 7 && mastery !== null && mastery !== 0)
    return `S${skill} M${mastery}`;
  if (skill !== null && skillLevel !== null) return `S${skill} L${skillLevel}`;
  if (skill !== null) return `S${skill}`;
};

export const formatModule = (
  moduleType: "X" | "Y" | "None" | null,
  moduleLevel: number | null
) => {
  if (moduleType === null && moduleLevel === null) return "Unknown";
  if (moduleType === "None") return "No Module";
  if (moduleLevel === null) {
    if (moduleType === "X") return "Module X";
    if (moduleType === "Y") return "Module Y";
  }
  return `Module ${moduleType} L${moduleLevel}`;
};
