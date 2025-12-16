import { describe, expect, it } from "vitest";
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
  it("returns books for current user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.books.list();

    expect(Array.isArray(result)).toBe(true);
    // All books should belong to user 1
    if (result.length > 0) {
      expect(result.every((b) => b.userId === 1)).toBe(true);
    }
  });

  it("returns only books belonging to current user", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.books.list();

    expect(Array.isArray(result)).toBe(true);
    // All returned books should belong to user 1
    expect(result.every((b) => b.userId === 1)).toBe(true);
  });
});

describe("readingProgress router", () => {
  it("returns reading progress or undefined", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.readingProgress.get({ bookId: 999 });

    // Should return undefined for non-existent progress or a valid progress object
    if (result) {
      expect(result.userId).toBe(1);
    } else {
      expect(result).toBeUndefined();
    }
  });
});

describe("bookmarks router", () => {
  it("returns bookmarks for a book", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.bookmarks.list({ bookId: 999 });

    expect(Array.isArray(result)).toBe(true);
    // All bookmarks should belong to user 1
    expect(result.every((b) => b.userId === 1)).toBe(true);
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
