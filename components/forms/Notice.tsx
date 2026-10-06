export function Notice({ error }: { error?: string }) {
  if (!error) return null;
  return (
    <p
      role="alert"
      className="border-l-2 border-red-700 bg-red-50 px-3.5 py-3 text-sm text-red-800"
    >
      {error}
    </p>
  );
}
