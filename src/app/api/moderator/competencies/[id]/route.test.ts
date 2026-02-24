import { PATCH, DELETE } from "./route";
import { NextResponse } from "next/server";

jest.mock("@/lib/guards", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/db", () => ({
  db: {
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  competencies: {
    id: "competencies.id",
    name: "competencies.name",
    category: "competencies.category",
    description: "competencies.description",
    updatedAt: "competencies.updatedAt",
  },
}));

// eq se koristi u where(...) pa ga možemo mockovati da ne zavisi od drizzle implementacije
jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "EQ_CONDITION"),
}));

import { requireRole } from "@/lib/guards";
import { db } from "@/db";

function patchRequest(body: any) {
  return new Request("http://test.local/api/competencies/1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PATCH /api/competencies/:id", () => {
  it("returns 401/403 when not moderator/admin", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const res = await PATCH(patchRequest({ name: "New" }), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when competency not found", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const res = await PATCH(patchRequest({ name: "New" }), { params: Promise.resolve({ id: "nope" }) });
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toBe("Not found");
  });

  it("updates competency and returns 200", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    (db.update as jest.Mock).mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: "1", name: "New", category: "Tech", description: "Updated" },
          ]),
        }),
      }),
    });

    const res = await PATCH(
      patchRequest({ name: "New", category: "Tech", description: "Updated" }),
      { params: Promise.resolve({ id: "1" }) }
    );

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.competency.name).toBe("New");
  });
});

describe("DELETE /api/competencies/:id", () => {
  it("returns 401/403 when not moderator/admin", async () => {
    (requireRole as jest.Mock).mockResolvedValue({
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const res = await DELETE(new Request("http://test.local"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when not found", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([]),
      }),
    });

    const res = await DELETE(new Request("http://test.local"), { params: Promise.resolve({ id: "x" }) });
    expect(res.status).toBe(404);

    const data = await res.json();
    expect(data.error).toBe("Not found");
  });

  it("deletes and returns ok:true", async () => {
    (requireRole as jest.Mock).mockResolvedValue({ error: null });

    (db.delete as jest.Mock).mockReturnValue({
      where: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([{ id: "1" }]),
      }),
    });

    const res = await DELETE(new Request("http://test.local"), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.ok).toBe(true);
  });
});