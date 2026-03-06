export function formatUnknownError(err: unknown): string {
  if (err instanceof Error) return err.stack ?? err.message;

  try {
    return typeof err === "string" ? err : JSON.stringify(err);
  } catch {
    return String(err);
  }
}
