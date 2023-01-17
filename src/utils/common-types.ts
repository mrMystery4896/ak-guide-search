import { Event, Operator, Stage } from "@prisma/client";

export type EventWithChildren = Event & {
  stages: Stage[];
  childEvents?: EventWithChildren[];
  parentEvent: Event | null;
};

export type OperatorWithDetails = Operator & {
  elite: number | null;
  level: number | null;
  skill: number | null;
  skillLevel: number | null;
  mastery: number | null;
  hasModule: boolean | null;
  moduleLevel: number | null;
};
