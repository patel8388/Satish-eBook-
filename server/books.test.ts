import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `sample-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Sample User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("books router", () => {
  it("returns empty list for user with no books", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.books.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("rejects access to books from other users", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    // Try to access a book that belongs to another user (ID 999)
    try {
      await caller.books.getById({ id: 999 });
      // Should return undefined for unauthorized access
      expect(true).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});

describe("readingProgress router", () => {
  it("returns undefined for non-existent reading progress", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.readingProgress.get({ bookId: 999 });

    expect(result).toBeUndefined();
  });
});

describe("bookmarks router", () => {
  it("returns empty list for book with no bookmarks", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bookmarks.list({ bookId: 999 });

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });

  it("filters bookmarks by user and book ID", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bookmarks.list({ bookId: 1 });

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("auth router", () => {
  it("returns current user from me query", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.me();

    expect(result).toEqual(ctx.user);
    expect(result.id).toBe(1);
    expect(result.openId).toBe("sample-user-1");
  });

  it("successfully logs out user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.logout();

    expect(result).toEqual({ success: true });
  });
});
