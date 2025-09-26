import {
  createCallerFactory,
  createTRPCRouter,
  baseProcedure,
} from "~/server/trpc/main";

export const appRouter = createTRPCRouter({
  // AI procedures removed - now using frontend simulations
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
