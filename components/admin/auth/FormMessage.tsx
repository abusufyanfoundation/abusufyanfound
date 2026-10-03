export function FormMessage({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  if (error) {
    return (
      <p
        role="alert"
        className="border-l-2 border-red-700 bg-red-50 px-3.5 py-3 text-sm text-red-800"
      >
        {error}
      </p>
    );
  }
  if (message) {
    return (
      <p
        role="status"
        className="border-l-2 border-gold bg-gold-soft px-3.5 py-3 text-sm text-ink"
      >
        {message}
      </p>
    );
  }
  return null;
}
