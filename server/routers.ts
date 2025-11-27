import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { eq, and } from "drizzle-orm";
import { getDb } from "./db";
import { books, readingProgress, bookmarks } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Books management
  books: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(books).where(eq(books.userId, ctx.user.id));
    }),
    
    getById: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'id' in val) {
          return { id: (val as { id: unknown }).id as number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return undefined;
        const book = await db.select().from(books).where(eq(books.id, input.id)).limit(1);
        if (book.length === 0 || book[0].userId !== ctx.user.id) return undefined;
        return book[0];
      }),
  }),

  // Reading progress tracking
  readingProgress: router({
    get: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'bookId' in val) {
          return { bookId: (val as { bookId: unknown }).bookId as number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return undefined;
        return db
          .select()
          .from(readingProgress)
          .where(and(eq(readingProgress.userId, ctx.user.id), eq(readingProgress.bookId, input.bookId)))
          .limit(1)
          .then(r => r[0]);
      }),
  }),

  // Bookmarks management
  bookmarks: router({
    list: protectedProcedure
      .input((val: unknown) => {
        if (typeof val === 'object' && val !== null && 'bookId' in val) {
          return { bookId: (val as { bookId: unknown }).bookId as number };
        }
        throw new Error('Invalid input');
      })
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        return db
          .select()
          .from(bookmarks)
          .where(and(eq(bookmarks.userId, ctx.user.id), eq(bookmarks.bookId, input.bookId)));
      }),
  }),
});

export type AppRouter = typeof appRouter;
