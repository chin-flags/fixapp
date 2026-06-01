describe("backend endpoint helpers", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
    delete process.env.NEXTAUTH_URL;
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.VERCEL_URL;
    delete process.env.NEXT_PUBLIC_BACKEND_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("uses NEXTAUTH_URL for server-side proxy URLs when available", async () => {
    process.env.NEXTAUTH_URL = "https://fixapp.example.com";

    const { getBackendProxyBaseUrl, buildBackendProxyUrl } = await import(
      "@/lib/backend-endpoints"
    );

    expect(getBackendProxyBaseUrl()).toBe("https://fixapp.example.com/api/backend");
    expect(buildBackendProxyUrl("rcas")).toBe(
      "https://fixapp.example.com/api/backend/rcas"
    );
  });

  it("falls back to localhost when no app URL environment variables are set", async () => {
    const { getBackendProxyBaseUrl, buildExternalBackendUrl } = await import(
      "@/lib/backend-endpoints"
    );

    expect(getBackendProxyBaseUrl()).toBe("http://localhost:3000/api/backend");
    expect(buildExternalBackendUrl("/auth/login")).toBe(
      "http://localhost:3001/auth/login"
    );
  });
});
