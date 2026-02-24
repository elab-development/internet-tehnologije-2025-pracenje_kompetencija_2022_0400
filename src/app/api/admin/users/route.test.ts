import { GET, POST } from "./route";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/guards";
import { db } from "@/db";

jest.mock("@/lib/guards", () => ({
  requireRole: jest.fn(),
}));

jest.mock("@/db", () => ({
  db: {
    select: jest.fn(),
    insert: jest.fn(),
  },
}));

jest.mock("@/db/schema", () => ({
  users: {
    id: "users.id",
    name: "users.name",
    email: "users.email",
    role: "users.role",
    isActive: "users.isActive",
    createdAt: "users.createdAt",
    updatedAt: "users.updatedAt",
    passHash: "users.passHash",
  },
}));

jest.mock("drizzle-orm", () => ({
  eq: jest.fn(() => "EQ_CONDITION"),
  and: jest.fn((...args) => ({ AND: args })),
  desc: jest.fn(() => "DESC_ORDER"),
  sql: jest.fn((strings, ...values) => "SQL_STMT"),
}));

function createNextReq(url: string, options: RequestInit = {}) {
  return new NextRequest(new Request(url, options));
}

describe("Route Handlers: /api/admin/users", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET", () => {
    it("returns list of users (200)", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const mockOrderBy = jest.fn().mockResolvedValue([
        { id: "1", name: "A", email: "a@test.com" },
      ]);
      const mockWhere = jest.fn().mockReturnValue({ orderBy: mockOrderBy });

      (db.select as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnValue({
          where: mockWhere,
          orderBy: mockOrderBy, // u slučaju da nema where filtera
        }),
      });

      const res = await GET(createNextReq("http://test.local/api/admin/users?q=test"));
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.users).toBeDefined();
    });
  });

  describe("POST", () => {
    it("returns 400 when missing fields", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      const req = createNextReq("http://test.local/api/admin/users", {
        method: "POST",
        body: JSON.stringify({ name: "" }), // Nedostaju email i password
      });

      const res = await POST(req);
      // U tvom kontroleru je NextResponse.json({ error: ... }, { status: 400 })
      expect(res.status).toBe(400); 
    });

    it("creates user and returns 201", async () => {
      (requireRole as jest.Mock).mockResolvedValue({ error: null });

      (db.insert as jest.Mock).mockReturnValue({
        values: jest.fn().mockReturnValue({
          returning: jest.fn().mockResolvedValue([
            { id: "new-1", name: "Novi", email: "novi@test.com" },
          ]),
        }),
      });

      const req = createNextReq("http://test.local/api/admin/users", {
        method: "POST",
        body: JSON.stringify({
          name: "Novi",
          email: "novi@test.com",
          password: "password123",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.user.id).toBe("new-1");
    });
  });
});