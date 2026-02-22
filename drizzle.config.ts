import { type Config } from "drizzle-kit";

//OVO NE KUCAMO SAMI, NEGO JE STD SABLON IZ DRIZZLE DOKUMENTACIJE
export default {
  // GDE JE TVOJA ŠEMA
  schema: "./src/db/schema.ts",

  // GDE DA SNIMA MIGRACIJE (SQL fajlove)
  out: "./src/db/migrations",

  // KOJU BAZU KORISTIŠ
  dialect: "postgresql",

  // KAKO DA SE POVEŽE NA BAZU
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
