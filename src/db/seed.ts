import { db } from "./index";
import {
  users,
  profiles,
  competencies,
  userCompetencies,
  credentials,
} from "./schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

async function hashPw(pw: string) {
  return bcrypt.hash(pw, 10);
}

async function seed() {
  console.log("Seeding database...");

  /* =========================
     WIPE (obriši sve prvo)
  ========================= */
  console.log("Wiping tables...");

  await db.delete(userCompetencies);
  await db.delete(credentials);
  await db.delete(profiles);
  await db.delete(competencies);
  await db.delete(users);

  console.log("Wipe completed.");

  /* =========================
     USERS (konkretni)
  ========================= */

  const fixedUsers = [
    {
      id: randomUUID(),
      name: "Janko Jankovic",
      email: "janko@fon.rs",
      passHash: await hashPw("janko123"),
      role: "admin",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "Mina Jovanović",
      email: "mina@fon.rs",
      passHash: await hashPw("mina123"),
      role: "moderator",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "Marko Marković",
      email: "marko@example.com",
      passHash: await hashPw("marko123"),
      role: "user",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "Ana Anić",
      email: "ana@example.com",
      passHash: await hashPw("ana123"),
      role: "user",
      isActive: true,
    },
    {
      id: randomUUID(),
      name: "Petar Petrović",
      email: "petar@example.com",
      passHash: await hashPw("petar123"),
      role: "user",
      isActive: true,
    },
  ];

  const targetUserCount = 10;
  const extraCount = Math.max(0, targetUserCount - fixedUsers.length);

  const extraUsers = await Promise.all(
    Array.from({ length: extraCount }).map(async (_, i) => {
      const n = i + 1;
      return {
        id: randomUUID(),
        name: `Test User ${n}`,
        email: `test${n}@example.com`,
        passHash: await hashPw(`test${n}pass`),
        role: "user",
        isActive: true,
      };
    })
  );

  const allUsers = [...fixedUsers, ...extraUsers];

  await db.insert(users).values(allUsers);

  /* =========================
     PROFILES
  ========================= */

  await db.insert(profiles).values(
    allUsers.map((u, i) => ({
      userId: u.id,
      headline:
        u.role === "admin"
          ? "Administrator platforme"
          : u.role === "moderator"
          ? "Moderator"
          : "Standard korisnik",
      bio:
        u.role === "admin"
          ? "Admin nalog za upravljanje korisnicima, kompetencijama i kredencijalima."
          : u.role === "moderator"
          ? "Moderator nalog za pregled i odobravanje sadržaja."
          : `Profil korisnika ${u.name}.`,
      profilePhotoUrl: `https://picsum.photos/200?random=${i + 10}`,
      websiteUrl: u.role === "admin" ? "https://teachify.rs" : null,
      linkedinUrl: `https://linkedin.com/in/${u.email.split("@")[0]}`,
      githubUrl: `https://github.com/${u.email.split("@")[0]}`,
      isPublic: u.role !== "admin",
    }))
  );

  /* =========================
     COMPETENCIES
  ========================= */

  const competencySeed = [
    { name: "Java", category: "Technical", description: "OOP, kolekcije, stream API" },
    { name: "Spring", category: "Technical", description: "Spring Boot, REST, DI" },
    { name: "PostgreSQL", category: "Technical", description: "SQL, indeksi, relacije" },
    { name: "React", category: "Technical", description: "Komponente, state, hooks" },
    { name: "Next.js", category: "Technical", description: "App router, SSR, API routes" },
    { name: "Docker", category: "DevOps", description: "Images, containers, compose" },
    { name: "TypeScript", category: "Technical", description: "Types, generics, interfaces" },
    { name: "Node.js", category: "Technical", description: "Runtime, APIs, async" },
    { name: "BPMN", category: "Process", description: "Modelovanje poslovnih procesa" },
    { name: "SQL", category: "Technical", description: "Upiti, join, agregacije" },
  ];

  const competencyIds = competencySeed.map(() => randomUUID());

  await db.insert(competencies).values(
    competencySeed.map((c, i) => ({
      id: competencyIds[i],
      name: c.name,
      category: c.category,
      description: c.description,
    }))
  );

  /* =========================
     USER_COMPETENCIES
  ========================= */

  const userCompetencyData: {
    userId: string;
    competencyId: string;
    level: number;
    years: string;
    isFeatured: boolean;
  }[] = [];

  userCompetencyData.push(
    { userId: allUsers[0].id, competencyId: competencyIds[1], level: 5, years: "4.0", isFeatured: true },
    { userId: allUsers[0].id, competencyId: competencyIds[2], level: 4, years: "3.5", isFeatured: true },
    { userId: allUsers[0].id, competencyId: competencyIds[5], level: 4, years: "2.0", isFeatured: false }
  );

  userCompetencyData.push(
    { userId: allUsers[1].id, competencyId: competencyIds[3], level: 4, years: "2.5", isFeatured: true },
    { userId: allUsers[1].id, competencyId: competencyIds[6], level: 3, years: "2.0", isFeatured: false }
  );

  for (let i = 2; i < allUsers.length; i++) {
    const u = allUsers[i];
    const c1 = competencyIds[i % competencyIds.length];
    const c2 = competencyIds[(i + 3) % competencyIds.length];

    userCompetencyData.push(
      {
        userId: u.id,
        competencyId: c1,
        level: (i % 5) + 1,
        years: (1 + (i % 4) * 0.5).toFixed(1),
        isFeatured: i % 2 === 0,
      },
      {
        userId: u.id,
        competencyId: c2,
        level: ((i + 2) % 5) + 1,
        years: (0.5 + (i % 3) * 0.7).toFixed(1),
        isFeatured: false,
      }
    );
  }

  await db.insert(userCompetencies).values(userCompetencyData);

  /* =========================
     CREDENTIALS
  ========================= */

  const credentialTypes = ["certificate", "diploma", "course", "license"] as const;

  await db.insert(credentials).values(
    allUsers.map((u, i) => ({
      id: randomUUID(),
      userId: u.id,
      type: credentialTypes[i % credentialTypes.length],
      title:
        u.role === "admin"
          ? "Administrator Certification"
          : u.role === "moderator"
          ? "Moderator Training"
          : `Credential ${i + 1}`,
      issuer: "Teachify Institute",
      issuedAt: new Date("2025-10-01"),
      expiresAt: null,
      verificationUrl: "https://example.com/verify",
      credentialCode: `CODE-${String(i + 1).padStart(3, "0")}`,
      description:
        u.role === "user"
          ? `Kredencijal za korisnika ${u.name}.`
          : `Kredencijal za ulogu: ${u.role}.`,
      note: "Seed podaci",
      status: "active",
    }))
  );

  console.log("Seeding completed!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });