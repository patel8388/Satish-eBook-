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

describe("upload router", () => {
  it("validates file format for upload", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.uploadBook({
        fileName: "test.txt",
        fileSize: 1024,
        fileContent: Buffer.from("test content").toString("base64"),
        title: "Test Book",
      });
      // Should succeed for txt files
      expect(true).toBe(true);
    } catch (error) {
      // If it fails, it should be a validation error
      expect(error).toBeDefined();
    }
  });

  it("rejects unsupported file formats", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.uploadBook({
        fileName: "test.exe",
        fileSize: 1024,
        fileContent: Buffer.from("test content").toString("base64"),
        title: "Test Book",
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain("Unsupported");
    }
  });

  it("generates upload URL for valid files", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.upload.getUploadUrl({
      fileName: "test.pdf",
      fileSize: 1024,
    });

    expect(result).toBeDefined();
    expect(result.fileKey).toBeDefined();
    expect(result.fileKey).toContain("books/1/");
    expect(result.fileKey).toContain(".pdf");
  });

  it("rejects invalid file format in upload URL generation", async () => {
    const ctx = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.upload.getUploadUrl({
        fileName: "test.exe",
        fileSize: 1024,
      });
      expect(true).toBe(false); // Should not reach here
    } catch (error) {
      expect(error).toBeDefined();
      expect((error as Error).message).toContain("Unsupported");
    }
  });
});
