import { Event, Stage } from "@prisma/client";

export type EventWithChildren = Event & {
  stages: Stage[];
  childEvents?: EventWithChildren[];
};
