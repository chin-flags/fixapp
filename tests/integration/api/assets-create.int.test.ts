import { NextRequest } from "next/server";

const createAssetRecordMock = vi.fn();
const requireTenantSessionMock = vi.fn();
const handleRouteErrorMock = vi.fn((error: unknown) => {
  if (error instanceof Error) {
    return {
      status: 401,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: "Internal server error",
  };
});

vi.mock("@/lib/server/frontend-assets", () => ({
  createAssetRecord: createAssetRecordMock,
  requireTenantSession: requireTenantSessionMock,
  handleRouteError: handleRouteErrorMock,
}));

describe("POST /api/assets", () => {
  beforeEach(() => {
    createAssetRecordMock.mockReset();
    requireTenantSessionMock.mockReset();
    handleRouteErrorMock.mockClear();
  });

  it("rejects invalid asset payloads before calling the create service", async () => {
    requireTenantSessionMock.mockResolvedValue({
      tenantId: "tenant-1",
    });

    const { POST } = await import("@/app/api/assets/route");
    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({ name: "", type: "invalid" }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "Valid asset name and type are required",
    });
    expect(createAssetRecordMock).not.toHaveBeenCalled();
  });

  it("passes the tenant-scoped asset payload to the service", async () => {
    requireTenantSessionMock.mockResolvedValue({
      tenantId: "tenant-1",
    });
    createAssetRecordMock.mockResolvedValue({
      id: "asset-1",
      tenantId: "tenant-1",
      name: "Boiler 01",
      type: "equipment",
      parentId: "area-1",
      location: "Plant 1",
      companyId: "EQ-001",
      photoUrl: null,
    });

    const { POST } = await import("@/app/api/assets/route");
    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        name: " Boiler 01 ",
        type: "equipment",
        parentId: "area-1",
        location: "Plant 1",
        companyId: "EQ-001",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(
      expect.objectContaining({
        id: "asset-1",
        name: "Boiler 01",
      })
    );
    expect(requireTenantSessionMock).toHaveBeenCalledTimes(1);
    expect(createAssetRecordMock).toHaveBeenCalledWith({
      tenantId: "tenant-1",
      name: "Boiler 01",
      type: "equipment",
      parentId: "area-1",
      location: "Plant 1",
      companyId: "EQ-001",
      photoUrl: undefined,
    });
  });

  it("maps route errors from the auth/service layer", async () => {
    requireTenantSessionMock.mockRejectedValue(new Error("Authentication required"));

    const { POST } = await import("@/app/api/assets/route");
    const request = new NextRequest("http://localhost:3000/api/assets", {
      method: "POST",
      body: JSON.stringify({
        name: "Boiler 01",
        type: "equipment",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(handleRouteErrorMock).toHaveBeenCalled();
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      error: "Authentication required",
    });
  });
});
