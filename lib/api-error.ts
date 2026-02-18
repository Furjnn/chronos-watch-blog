type ErrorLike = {
  message?: unknown;
  status?: unknown;
};

export function getErrorMessage(error: unknown, fallback = "Internal server error"): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as ErrorLike).message;
    if (typeof message === "string" && message.trim().length > 0) {
      return message;
    }
  }

  return fallback;
}

export function getErrorStatus(error: unknown, fallback = 500): number {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = Number((error as ErrorLike).status);
    if (Number.isInteger(status) && status >= 100 && status <= 599) {
      return status;
    }
  }

  return fallback;
}
