import { router } from "../trpc";
import { guideRouter } from "./guide";

export const appRouter = router({
  guide: guideRouter
});

// export type definition of API
export type AppRouter = typeof appRouter;
