import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Books/Files table - stores uploaded ebook files
 */
export const books = mysqlTable("books", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  author: varchar("author", { length: 255 }),
  format: varchar("format", { length: 20 }).notNull(), // pdf, epub, mobi, etc
  fileSize: int("fileSize").notNull(), // in bytes
  fileUrl: text("fileUrl").notNull(), // S3 URL
  fileKey: text("fileKey").notNull(), // S3 key for reference
  coverUrl: text("coverUrl"), // cover image URL
  description: text("description"),
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Book = typeof books.$inferSelect;
export type InsertBook = typeof books.$inferInsert;

/**
 * Reading progress table - tracks where user is in each book
 */
export const readingProgress = mysqlTable("readingProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  currentPage: int("currentPage").default(0).notNull(),
  totalPages: int("totalPages"),
  currentPosition: int("currentPosition").default(0).notNull(), // for EPUB, byte position
  percentRead: int("percentRead").default(0).notNull(),
  lastReadAt: timestamp("lastReadAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ReadingProgress = typeof readingProgress.$inferSelect;
export type InsertReadingProgress = typeof readingProgress.$inferInsert;

/**
 * Bookmarks table - user bookmarks/highlights in books
 */
export const bookmarks = mysqlTable("bookmarks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  bookId: int("bookId").notNull().references(() => books.id, { onDelete: "cascade" }),
  page: int("page"),
  position: int("position"), // byte position for EPUB
  text: text("text"), // highlighted text
  note: text("note"), // user's note
  color: varchar("color", { length: 20 }).default("yellow"), // highlight color
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Bookmark = typeof bookmarks.$inferSelect;
export type InsertBookmark = typeof bookmarks.$inferInsert;

/**
 * User preferences table - stores user settings
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  fontSize: int("fontSize").default(16).notNull(),
  fontFamily: varchar("fontFamily", { length: 50 }).default("serif").notNull(),
  theme: varchar("theme", { length: 20 }).default("light").notNull(), // light, dark, sepia
  lineHeight: varchar("lineHeight", { length: 10 }).default("1.5").notNull(),
  autoScroll: int("autoScroll").default(0).notNull(), // 0 = off, speed in ms
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = typeof userPreferences.$inferInsert;