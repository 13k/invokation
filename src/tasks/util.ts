export function isError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error;
}
