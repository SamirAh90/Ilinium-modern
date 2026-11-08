type ApiError = Error & { status?: number };
type Result<T = unknown> = { data: T; error: ApiError | null };
type Filter = { column: string; value: unknown };
const API = "/api/index.php";
const authListeners = new Set<(event: string) => void>();

async function request<T>(path: string, init?: RequestInit): Promise<Result<T>> {
  try {
    if (import.meta.env.DEV && (!init?.method || init.method === "GET")) {
      const query = new URLSearchParams(path.startsWith("?") ? path.slice(1) : path);
      const resource = query.get("resource");
      const publicTables = new Set([
        "site_settings",
        "treatment_categories",
        "treatments",
        "staff",
        "gallery_images",
        "opening_hours",
        "special_opening_hours",
      ]);
      if (resource && publicTables.has(resource)) {
        const seedResponse = await fetch("/api/seed.json", { cache: "no-store" });
        const seed = (await seedResponse.json()) as Record<string, Record<string, unknown>[]>;
        let rows = [...(seed[resource] ?? [])];
        const filters = JSON.parse(query.get("filters") || "[]") as Filter[];
        rows = rows.filter((row) => filters.every((filter) => row[filter.column] === filter.value));
        const ordering = JSON.parse(query.get("order") || "null") as {
          column: string;
          ascending: boolean;
        } | null;
        if (ordering)
          rows.sort(
            (a, b) =>
              String(a[ordering.column] ?? "").localeCompare(String(b[ordering.column] ?? "")) *
              (ordering.ascending ? 1 : -1),
          );
        const limit = Number(query.get("limit") || rows.length);
        return { data: rows.slice(0, limit) as T, error: null };
      }
    }
    const response = await fetch(`${API}${path}`, {
      credentials: "same-origin",
      ...init,
      headers:
        init?.body instanceof FormData
          ? init.headers
          : { "Content-Type": "application/json", ...init?.headers },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(payload.error || "Serverfel") as ApiError;
      error.status = response.status;
      return { data: null as T, error };
    }
    return { data: (payload.data ?? payload) as T, error: null };
  } catch {
    return { data: null as T, error: new Error("Kunde inte ansluta till servern.") };
  }
}

class QueryBuilder implements PromiseLike<Result<any>> {
  private operation: "select" | "insert" | "update" | "delete" | "upsert" = "select";
  private fields = "*";
  private payload: unknown;
  private filters: Filter[] = [];
  private ordering?: { column: string; ascending: boolean };
  private max?: number;
  private mode: "many" | "single" | "maybeSingle" = "many";
  constructor(private table: string) {}
  select(fields = "*") {
    this.operation = "select";
    this.fields = fields;
    return this;
  }
  insert(payload: unknown) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }
  update(payload: unknown) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }
  upsert(payload: unknown) {
    this.operation = "upsert";
    this.payload = payload;
    return this;
  }
  delete() {
    this.operation = "delete";
    return this;
  }
  eq(column: string, value: unknown) {
    this.filters.push({ column, value });
    return this;
  }
  order(column: string, options?: { ascending?: boolean }) {
    this.ordering = { column, ascending: options?.ascending !== false };
    return this;
  }
  limit(value: number) {
    this.max = value;
    return this;
  }
  single() {
    this.mode = "single";
    return this;
  }
  maybeSingle() {
    this.mode = "maybeSingle";
    return this;
  }
  async execute(): Promise<Result<any>> {
    const params = new URLSearchParams({ resource: this.table, fields: this.fields });
    if (this.filters.length) params.set("filters", JSON.stringify(this.filters));
    if (this.ordering) params.set("order", JSON.stringify(this.ordering));
    if (this.max) params.set("limit", String(this.max));
    if (this.operation !== "select") params.set("action", this.operation);
    const method =
      this.operation === "select"
        ? "GET"
        : this.operation === "delete"
          ? "DELETE"
          : this.operation === "update"
            ? "PATCH"
            : "POST";
    const result = await request<any[]>(`?${params}`, {
      method,
      body: method === "GET" || method === "DELETE" ? undefined : JSON.stringify(this.payload),
    });
    if (result.error) return result;
    if (this.mode === "single") {
      const row = Array.isArray(result.data) ? result.data[0] : result.data;
      return row ? { data: row, error: null } : { data: null, error: new Error("Posten saknas.") };
    }
    if (this.mode === "maybeSingle")
      return {
        data: Array.isArray(result.data) ? (result.data[0] ?? null) : result.data,
        error: null,
      };
    return result;
  }
  then<TResult1 = Result<any>, TResult2 = never>(
    onfulfilled?: ((value: Result<any>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export const backend = {
  from(table: string) {
    return new QueryBuilder(table);
  },
  auth: {
    async signInWithPassword(credentials: { email: string; password: string }) {
      const result = await request<{ user: { id: string; email: string } }>("?action=login", {
        method: "POST",
        body: JSON.stringify(credentials),
      });
      if (!result.error) authListeners.forEach((listener) => listener("SIGNED_IN"));
      return result;
    },
    async getUser() {
      const result = await request<{ user: { id: string; email: string } | null }>("?action=user");
      return result.error
        ? { data: { user: null }, error: result.error }
        : { data: result.data, error: null };
    },
    async signOut() {
      const result = await request("?action=logout", { method: "POST", body: "{}" });
      if (!result.error) authListeners.forEach((listener) => listener("SIGNED_OUT"));
      return result;
    },
    async resetPasswordForEmail(email: string, options?: { redirectTo?: string }) {
      return request("?action=request-password-reset", {
        method: "POST",
        body: JSON.stringify({ email, redirectTo: options?.redirectTo }),
      });
    },
    async updateUser(values: { password: string }) {
      const token = new URLSearchParams(window.location.search).get("token");
      const result = await request("?action=update-password", {
        method: "POST",
        body: JSON.stringify({ ...values, token }),
      });
      if (!result.error) authListeners.forEach((listener) => listener("USER_UPDATED"));
      return result;
    },
    onAuthStateChange(callback: (event: string) => void) {
      authListeners.add(callback);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              authListeners.delete(callback);
            },
          },
        },
      };
    },
  },
  storage: {
    from(_bucket: string) {
      return {
        async upload(
          path: string,
          blob: Blob,
          _options?: { contentType?: string; upsert?: boolean },
        ) {
          const form = new FormData();
          form.append("file", blob, path.split("/").pop() || "image.webp");
          form.append("path", path);
          return request<{ path: string }>("?action=upload", { method: "POST", body: form });
        },
      };
    },
  },
};
