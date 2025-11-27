import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { books, InsertBook } from "../drizzle/schema";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const uploadRouter = router({
  uploadBook: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileSize: z.number().positive(),
        fileContent: z.string(), // base64 encoded file content
        title: z.string().min(1),
        author: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          throw new Error("Database not available");
        }

        // Validate file format
        const ext = input.fileName.split(".").pop()?.toLowerCase();
        if (!["pdf", "epub", "mobi", "txt"].includes(ext || "")) {
          throw new Error("Unsupported file format");
        }

        // Decode base64 content
        const buffer = Buffer.from(input.fileContent, "base64");

        // Upload to S3
        const fileKey = `books/${ctx.user.id}/${nanoid()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, "application/octet-stream");

        // Create database record
        const bookData: InsertBook = {
          userId: ctx.user.id,
          title: input.title,
          author: input.author,
          format: ext || "unknown",
          fileSize: input.fileSize,
          fileUrl: url,
          fileKey: fileKey,
          description: input.description,
        };

        await db.insert(books).values(bookData);

        return {
          success: true,
          message: "Book uploaded successfully",
          url,
        };
      } catch (error) {
        console.error("Upload error:", error);
        throw new Error(`Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  getUploadUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileSize: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }) => {
      // Validate file format
      const ext = input.fileName.split(".").pop()?.toLowerCase();
      if (!["pdf", "epub", "mobi", "txt"].includes(ext || "")) {
        throw new Error("Unsupported file format");
      }

      // Generate a presigned URL for direct upload
      const fileKey = `books/${ctx.user.id}/${nanoid()}-${input.fileName}`;

      return {
        fileKey,
        uploadUrl: `${process.env.BUILT_IN_FORGE_API_URL}/storage/upload`,
        headers: {
          Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
        },
      };
    }),
});
