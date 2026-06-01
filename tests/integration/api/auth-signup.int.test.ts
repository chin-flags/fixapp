import { NextRequest } from "next/server";

const signupTenantMock = vi.fn();
const handleRouteErrorMock = vi.fn((error: unknown) => {
  if (error instanceof Error) {
    return {
      status: 400,
      message: error.message,
    };
  }

  return {
    status: 500,
    message: "Internal server error",
  };
});

vi.mock("@/lib/server/frontend-account", () => ({
  signupTenant: signupTenantMock,
  handleRouteError: handleRouteErrorMock,
}));

describe("POST /api/auth/signup", () => {
  beforeEach(() => {
    signupTenantMock.mockReset();
    handleRouteErrorMock.mockClear();
  });

  it("rejects requests with missing required fields", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");
    const request = new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@example.com",
        password: "secret123",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "All fields are required" });
    expect(signupTenantMock).not.toHaveBeenCalled();
  });

  it("rejects invalid email, password, and subdomain formats before calling the service", async () => {
    const { POST } = await import("@/app/api/auth/signup/route");

    const invalidEmailRequest = new NextRequest(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: "bad-email",
          password: "secret123",
          name: "Admin",
          tenantName: "FixApp",
          subdomain: "tenant-a",
        }),
        headers: { "content-type": "application/json" },
      }
    );

    const invalidEmailResponse = await POST(invalidEmailRequest);
    expect(invalidEmailResponse.status).toBe(400);
    expect(await invalidEmailResponse.json()).toEqual({
      error: "Invalid email format",
    });

    const weakPasswordRequest = new NextRequest(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "123",
          name: "Admin",
          tenantName: "FixApp",
          subdomain: "tenant-a",
        }),
        headers: { "content-type": "application/json" },
      }
    );

    const weakPasswordResponse = await POST(weakPasswordRequest);
    expect(weakPasswordResponse.status).toBe(400);
    expect(await weakPasswordResponse.json()).toEqual({
      error: "Password must be at least 6 characters",
    });

    const invalidSubdomainRequest = new NextRequest(
      "http://localhost:3000/api/auth/signup",
      {
        method: "POST",
        body: JSON.stringify({
          email: "admin@example.com",
          password: "secret123",
          name: "Admin",
          tenantName: "FixApp",
          subdomain: "Bad Subdomain",
        }),
        headers: { "content-type": "application/json" },
      }
    );

    const invalidSubdomainResponse = await POST(invalidSubdomainRequest);
    expect(invalidSubdomainResponse.status).toBe(400);
    expect(await invalidSubdomainResponse.json()).toEqual({
      error:
        "Subdomain must be 3-63 characters, lowercase letters, numbers, and hyphens only",
    });

    expect(signupTenantMock).not.toHaveBeenCalled();
  });

  it("returns created status when the signup service succeeds", async () => {
    signupTenantMock.mockResolvedValue({
      message: "Account created successfully",
    });

    const { POST } = await import("@/app/api/auth/signup/route");
    const request = new NextRequest("http://localhost:3000/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email: "admin@example.com",
        password: "secret123",
        name: "Admin",
        tenantName: "FixApp",
        subdomain: "tenant-a",
      }),
      headers: { "content-type": "application/json" },
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({
      message: "Account created successfully",
    });
    expect(signupTenantMock).toHaveBeenCalledWith({
      email: "admin@example.com",
      password: "secret123",
      name: "Admin",
      tenantName: "FixApp",
      subdomain: "tenant-a",
    });
  });
});
