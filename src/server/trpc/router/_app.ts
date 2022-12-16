import { router } from "../trpc";
import { eventRouter } from "./event";
import { guideRouter } from "./guide";
import { operatorRouter } from "./operator";
import { stageRouter } from "./stage";
import { tagRouter } from "./tag";
import { youtubeRouter } from "./youtube";

export const appRouter = router({
  guide: guideRouter,
  operator: operatorRouter,
  youtube: youtubeRouter,
  tag: tagRouter,
  event: eventRouter,
  stage: stageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
