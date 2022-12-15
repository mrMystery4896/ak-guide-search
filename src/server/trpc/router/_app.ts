import { router } from "../trpc";
import { guideRouter } from "./guide";
import { operatorRouter } from "./operator";
import { youtubeRouter } from "./youtube";

export const appRouter = router({
  guide: guideRouter,
  operator: operatorRouter,
  youtube: youtubeRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
