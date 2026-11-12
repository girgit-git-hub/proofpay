const API = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function json<T = any>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";

  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.error
        ? data.error
        : typeof data === "string"
          ? data
          : "Request failed";

    throw new Error(message);
  }

  return data;
}

export async function getTasks() {
  return json(await fetch(`${API}/api/tasks`));
}

export async function verifyTask(id: string) {
  return json(
    await fetch(`${API}/api/tasks/${id}/verify`, {
      method: "POST",
    }),
  );
}

export async function payoutTask(id: string) {
  return json(
    await fetch(`${API}/api/tasks/${id}/payout`, {
      method: "POST",
    }),
  );
}

export async function uploadEvidence(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);

  return json(
    await fetch(`${API}/api/tasks/${id}/evidence`, {
      method: "POST",
      body: form,
    }),
  );
}

export async function agentQuery(query: string) {
  return json(
    await fetch(`${API}/api/agent/query`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    }),
  );
}
