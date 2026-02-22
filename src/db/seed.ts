import { db } from "./index";
import {
  users,
  profiles,
  competencies,
  userCompetencies,
  credentials,
} from "./schema";
import { randomUUID } from "crypto";

async function seed() {
  console.log("Seeding database...");

  /* =========================
     USERS
  ========================= */

  const userIds = Array.from({ length: 10 }).map(() => randomUUID());

  await db.insert(users).values(
    userIds.map((id, i) => ({
      id,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      passHash: "hashed_password_example",
      role: i === 0 ? "admin" : i === 1 ? "moderator" : "user",
      isActive: true,
    }))
  );

  /* =========================
     PROFILES
  ========================= */

  await db.insert(profiles).values(
    userIds.map((userId, i) => ({
      userId,
      headline: `Software Developer ${i + 1}`,
      bio: `This is bio for user ${i + 1}. Experienced in modern web development.`,
      profilePhotoUrl: `https://picsum.photos/200?random=${i + 1}`,
      websiteUrl: `https://user${i + 1}.com`,
      linkedinUrl: `https://linkedin.com/in/user${i + 1}`,
      githubUrl: `https://github.com/user${i + 1}`,
      isPublic: true,
    }))
  );

  /* =========================
     COMPETENCIES
  ========================= */

  const competencyIds = Array.from({ length: 10 }).map(() => randomUUID());

  const competencyNames = [
    "Java",
    "Spring",
    "PostgreSQL",
    "React",
    "Next.js",
    "Docker",
    "TypeScript",
    "Node.js",
    "BPMN",
    "SQL",
  ];

  await db.insert(competencies).values(
    competencyIds.map((id, i) => ({
      id,
      name: competencyNames[i],
      category: "Technical",
      description: `Knowledge of ${competencyNames[i]}`,
    }))
  );

  /* =========================
     USER_COMPETENCIES
  ========================= */

  const userCompetencyData = [];

  for (let i = 0; i < 10; i++) {
    userCompetencyData.push({
      userId: userIds[i],
      competencyId: competencyIds[i],
      level: Math.floor(Math.random() * 5) + 1,
      years: (Math.random() * 5).toFixed(1),
      isFeatured: i % 2 === 0,
    });
  }

  await db.insert(userCompetencies).values(userCompetencyData);

  /* =========================
     CREDENTIALS
  ========================= */

  const credentialTypes = [
    "certificate",
    "diploma",
    "course",
    "license",
  ];

  await db.insert(credentials).values(
    userIds.map((userId, i) => ({
      id: randomUUID(),
      userId,
      type: credentialTypes[i % credentialTypes.length],
      title: `Credential ${i + 1}`,
      issuer: "Example Institute",
      issuedAt: new Date(),
      expiresAt: null,
      verificationUrl: "https://example.com/verify",
      credentialCode: `CODE-${i + 1}`,
      description: `Description for credential ${i + 1}`,
      note: "Sample note",
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