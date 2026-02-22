import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  primaryKey,
  uniqueIndex,
  index,
  numeric,
} from "drizzle-orm/pg-core";

/* =========================
   USERS
========================= */
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),

    passHash: varchar("pass_hash", { length: 255 }).notNull(),

    role: varchar("role", { length: 20 }).notNull().default("user"),

    isActive: boolean("is_active").notNull().default(true),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    emailUq: uniqueIndex("users_email_uq").on(t.email),
  })
);

/* =========================
   PROFILES
========================= */
export const profiles = pgTable(
  "profiles",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => users.id, { onDelete: "cascade" }),

    headline: varchar("headline", { length: 140 }),
 
    bio: text("bio"),
 
    profilePhotoUrl: varchar("profile_photo_url", { length: 500 }),

    websiteUrl: varchar("website_url", { length: 255 }),
    linkedinUrl: varchar("linkedin_url", { length: 255 }),
    githubUrl: varchar("github_url", { length: 255 }),

    isPublic: boolean("is_public").notNull().default(false),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  }
);

/* =========================
   COMPETENCIES
========================= */
export const competencies = pgTable(
  "competencies",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    name: varchar("name", { length: 120 }).notNull(),
    category: varchar("category", { length: 120 }),
    description: text("description"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    nameUq: uniqueIndex("competencies_name_uq").on(t.name),
  })
);

/* =========================
   USER_COMPETENCIES
========================= */
export const userCompetencies = pgTable(
  "user_competencies",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    competencyId: uuid("competency_id")
      .notNull()
      .references(() => competencies.id, { onDelete: "cascade" }),

    level: integer("level").notNull().default(1),
    years: numeric("years", { precision: 4, scale: 1 }).default("0.0"),

    isFeatured: boolean("is_featured").notNull().default(false),

    

    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.competencyId], name: "user_competencies_pk" }),
    userIdx: index("user_competencies_user_idx").on(t.userId),
    compIdx: index("user_competencies_comp_idx").on(t.competencyId),
  })
);

/* =========================
   CREDENTIALS
========================= */
export const credentials = pgTable(
  "credentials",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 30 }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    issuer: varchar("issuer", { length: 200 }),

    issuedAt: timestamp("issued_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    verificationUrl: varchar("verification_url", { length: 500 }),
    credentialCode: varchar("credential_code", { length: 120 }),

    description: text("description"),

 
    note: text("note"),

    status: varchar("status", { length: 20 }).notNull().default("active"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdx: index("credentials_user_idx").on(t.userId),
  })
);