/**
 * Hardened fetch for the Eurostat upstream APIs.
 *
 * On Vercel all outbound traffic shares a small pool of data-centre egress
 * IPs, and a page load fires dozens of proxy requests at once. Eurostat
 * intermittently drops such bursts (connection resets), which a bare
 * `fetch` turns into an instant failure. This wrapper adds what a browser
 * environment gives for free locally:
 *
 * - an identifying User-Agent (anonymous data-centre traffic is what WAFs cut)
 * - a per-attempt timeout instead of hanging until the gateway kills us
 * - retries with backoff for network errors and 429/5xx responses
 * - a per-instance cap on concurrent upstream connections to smooth bursts
 */

const USER_AGENT =
  "eurostat-insights/0.1 (+https://eurostat-insights.vercel.app)";

const MAX_CONCURRENT = 8;

let active = 0;
const waiters: Array<() => void> = [];

async function acquireSlot(): Promise<void> {
  if (active < MAX_CONCURRENT) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
}

function releaseSlot(): void {
  active -= 1;
  waiters.shift()?.();
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

export interface UpstreamOptions {
  /** Seconds for Next's data cache; omit to fetch with `cache: "no-store"`. */
  revalidate?: number;
  /** Per-attempt timeout in milliseconds. */
  timeoutMs?: number;
  /** Total attempts including the first. */
  attempts?: number;
  accept?: string;
}

/**
 * Fetch with retries. Resolves with the last upstream Response (ok or not);
 * throws only when every attempt failed at the network level. The final
 * error has `name: "TimeoutError"` when the last attempt timed out.
 */
export async function fetchUpstream(
  url: string,
  { revalidate, timeoutMs = 10_000, attempts = 3, accept }: UpstreamOptions = {},
): Promise<Response> {
  const init: RequestInit & { next?: { revalidate: number } } = {
    headers: {
      "User-Agent": USER_AGENT,
      ...(accept ? { Accept: accept } : {}),
    },
    ...(revalidate != null
      ? { next: { revalidate } }
      : { cache: "no-store" as const }),
  };

  await acquireSlot();
  try {
    let lastError: unknown;
    let lastResponse: Response | undefined;

    for (let attempt = 0; attempt < attempts; attempt++) {
      if (attempt > 0) {
        // 300ms, 900ms, … plus jitter so a burst does not retry in lockstep.
        await sleep(300 * 3 ** (attempt - 1) + Math.random() * 250);
      }
      try {
        const res = await fetch(url, {
          ...init,
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (!isRetryableStatus(res.status)) return res;
        lastResponse = res;
        lastError = undefined;
      } catch (err) {
        lastError = err;
      }
    }

    if (lastResponse) return lastResponse;
    throw lastError;
  } finally {
    releaseSlot();
  }
}

export function isTimeoutError(err: unknown): boolean {
  return err instanceof Error && err.name === "TimeoutError";
}

export function describeError(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const cause =
    err.cause instanceof Error ? ` (cause: ${err.cause.message})` : "";
  return `${err.name}: ${err.message}${cause}`;
}
