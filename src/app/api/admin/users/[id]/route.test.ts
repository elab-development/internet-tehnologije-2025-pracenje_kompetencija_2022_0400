import { GET, PATCH, DELETE } from "./route";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { db } from "@/db";

jest.mock("@/lib/guards", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/db", () => ({
  db: {
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  users: {
    id: "users.id",
    name: "users.name",
    email: "users.email",
    role: "users.role",
    isActive: "users.isActive",
    passHash: "users.passHash",
    updatedAt: "users.updatedAt",
    createdAt: "users.createdAt",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "EQ_CONDITION"),
}));

// Helper funkcija za kreiranje NextRequest-a
function createNextReq(url: string, options: RequestInit = {}) {
  return new NextRequest(new Request(url, options));
}

function patchReq(body: any) {
  return createNextReq("http://test.local/api/admin/users/1", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("Route Handlers: /api/admin/users/:id", () => {
  const params = { params: { id: "1" } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns 401/403 when not admin", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      });

      const res = await GET(createNextReq("http://test.local"), params);
      expect(res.status).toBe(401);
    });

    it("returns 404 when not found", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([]),
        }),
      });

      const res = await GET(createNextReq("http://test.local"), params);
      expect(res.status).toBe(404);
    });

    it("returns 200 and user", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });
      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: jest.fn().mockResolvedValue([
            { id: "1", name: "Admin", email: "a@test.com", role: "admin", isActive: true },
          ]),
        }),
      });

      const res = await GET(createNextReq("http://test.local"), params);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.user.id).toBe("1");
    });
  });

  describe("PATCH", () => {
    it("returns 403 when forbidden", async () => {
      (requireRole as jest.Mock).mockResolvedValue({
        error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      });

      const res = await PATCH(patchReq({ role: "admin" }), params);
      expect(res.status).toBe(403);
    });

    it("updates user and returns 200", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });
      (db.update as jest.Mock).mockReturnValue({
        set: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnValue({
            returning: jest.fn().mockResolvedValue([
              { id: "1", name: "Novo", email: "a@test.com", role: "moderator" },
            ]),
          }),
        }),
      });

      const res = await PATCH(patchReq({ name: "Novo" }), params);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.user.name).toBe("Novo");
    });
  });

  describe("DELETE", () => {
    it("deletes and returns ok:true", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });
      (db.delete as jest.Mock).mockReturnValue({
        where: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([{ id: "1" }]),
        }),
      });

      const res = await DELETE(createNextReq("http://test.local"), params);
      const data = await res.json();
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });
});