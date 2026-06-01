import { NextRequest } from "next/server";

describe("backend proxy route", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("forwards the allowed headers, query string, method, and body to the upstream service", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true }), {
          status: 202,
          headers: {
            "content-type": "application/json",
            "cache-control": "no-store",
          },
        })
      );

    const { POST } = await import("@/app/api/backend/[...path]/route");
    const request = new NextRequest(
      "http://localhost:3000/api/backend/rcas?status=open",
      {
        method: "POST",
        body: JSON.stringify({ title: "RCA 1" }),
        headers: {
          authorization: "Bearer test-token",
          "content-type": "application/json",
          accept: "application/json",
          "x-tenant-subdomain": "tenant-a",
          cookie: "should-not-forward=true",
        },
      }
    );

    const response = await POST(request, {
      params: Promise.resolve({ path: ["rcas"] }),
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [targetUrl, init] = fetchMock.mock.calls[0] as [URL, RequestInit];

    expect(String(targetUrl)).toBe("http://localhost:3001/rcas?status=open");
    expect(init.method).toBe("POST");
    expect(init.redirect).toBe("manual");
    expect(init.headers).toBeInstanceOf(Headers);
    expect((init.headers as Headers).get("authorization")).toBe("Bearer test-token");
    expect((init.headers as Headers).get("x-tenant-subdomain")).toBe("tenant-a");
    expect((init.headers as Headers).get("cookie")).toBeNull();
    expect(init.body).toBeInstanceOf(ArrayBuffer);

    expect(response.status).toBe(202);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({ ok: true });
  });

  it("returns a 503 fallback when the upstream service is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("connect failed"));

    const { GET } = await import("@/app/api/backend/[...path]/route");
    const request = new NextRequest("http://localhost:3000/api/backend/rcas");

    const response = await GET(request, {
      params: Promise.resolve({ path: ["rcas"] }),
    });

    expect(response.status).toBe(503);
    expect(await response.json()).toEqual({
      error:
        "This route still depends on the removed backend service. That frontend path has not been migrated yet.",
    });
  });
});
