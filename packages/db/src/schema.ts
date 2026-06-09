import { relations } from "drizzle-orm"
import {
  boolean,
  index,
  pgSchema,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

/**
 * Drizzle tabloları Strapi'nin yönettiği `public` şemasıyla çakışmamak için
 * ayrı bir `app` şemasında tutulur. Strapi tablolarına burada DOKUNULMAZ.
 */
export const appSchema = pgSchema("app")

export const users = appSchema.table("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name"),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
})

export const comments = appSchema.table(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    // Strapi'deki blog yazısının documentId/slug referansı (API üzerinden eşlenir).
    articleRef: text("article_ref").notNull(),
    authorId: uuid("author_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    isApproved: boolean("is_approved").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("comments_article_ref_idx").on(table.articleRef)]
)

export const favorites = appSchema.table(
  "favorites",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    articleRef: text("article_ref").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("favorites_user_id_idx").on(table.userId)]
)

export const usersRelations = relations(users, ({ many }) => ({
  comments: many(comments),
  favorites: many(favorites),
}))

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}))

export const favoritesRelations = relations(favorites, ({ one }) => ({
  user: one(users, {
    fields: [favorites.userId],
    references: [users.id],
  }),
}))
