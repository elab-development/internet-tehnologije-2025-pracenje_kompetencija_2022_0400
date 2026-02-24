import { GET, POST } from "./route";
import { NextResponse } from "next/server";

// Mock requireRole
jest.mock("@/lib/guards", () => ({
  requireRole: jest.fn(),
}));

// Mock db i schema
jest.mock("@/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  competencies: {
    id: "competencies.id",
    name: "competencies.name",
    category: "competencies.category",
    description: "competencies.description",
    createdAt: "competencies.createdAt",
    updatedAt: "competencies.updatedAt",
  },
}));

import { requireRole } from "@/lib/guards";
import { db } from "@/db";

function jsonRequest(body: any) {
  return new Request("http://test.local/api/competencies", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("GET /api/competencies", () => {
  it("returns list of competencies (public)", async () => {
    // db.select(...).from(...)
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockResolvedValue([
        { id: "1", name: "JS", category: "Tech", description: "desc", createdAt: new Date() },
      ]),
    });

    const res = await GET();
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.competencies).toHaveLength(1);
    expect(data.competencies[0].name).toBe("JS");
  });
});

describe("POST /api/competencies", () => {
  it("returns 401/403 when not moderator/admin", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const res = await POST(jsonRequest({ name: "React" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when name is missing", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    const res = await POST(jsonRequest({}));
    expect(res.status).toBe(400);

    const data = await res.json();
    expect(data.error).toBe("Name is required");
  });

  it("returns 409 when competency already exists", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    // db.select(...).from(...).where(...)
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([{ id: "existing-id" }]),
      }),
    });

    const res = await POST(jsonRequest({ name: "React" }));
    expect(res.status).toBe(409);

    const data = await res.json();
    expect(data.error).toBe("Competency already exists");
  });

  it("creates competency and returns 201", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    // existing check: return empty
    (db.select as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnValue({
        where: jest.fn().mockResolvedValue([]),
      }),
    });

    // db.insert(...).values(...).returning(...)
    (db.insert as jest.Mock).mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([
          { id: "new-id", name: "React", category: "Tech", description: "UI" },
        ]),
      }),
    });

    const res = await POST(jsonRequest({ name: "React", category: "Tech", description: "UI" }));
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.competency.id).toBe("new-id");
    expect(data.competency.name).toBe("React");
  });
});