export function SetupNotice() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
        <h2 className="font-semibold">Almost there 🌱</h2>
        <p className="mt-2 text-sm leading-relaxed">
          This app needs a Supabase project to store your household&apos;s data. Copy{" "}
          <code className="rounded bg-amber-100 px-1">.env.example</code> to{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code>, fill in your Supabase
          project URL and anon key, then run the migration in{" "}
          <code className="rounded bg-amber-100 px-1">supabase/migrations/0001_init.sql</code>{" "}
          against that project. Restart the dev server afterwards.
        </p>
      </div>
    </div>
  );
}
