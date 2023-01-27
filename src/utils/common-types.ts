import type { Event, Operator, Stage, GuideOperator } from "@prisma/client";

export type EventWithChildren = Event & {
  stages: Stage[];
  childEvents?: EventWithChildren[];
  parentEvent: Event | null;
};

export type OperatorWithDetails = Operator &
  Omit<GuideOperator, "operatorId" | "guideId">;
