export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to FixApp</h1>
        <p className="text-lg">
          Multi-tenant Root Cause Analysis and Maintenance Management Platform
        </p>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg border border-gray-300 p-4">
            <h2 className="text-xl font-semibold">Frontend</h2>
            <p className="text-gray-600">Next.js 15 with App Router</p>
          </div>
          <div className="rounded-lg border border-gray-300 p-4">
            <h2 className="text-xl font-semibold">Backend</h2>
            <p className="text-gray-600">NestJS API (Coming soon)</p>
          </div>
        </div>
      </div>
    </main>
  );
}
