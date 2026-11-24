const BASE = "http://127.0.0.1:8000";

export const getToken = () => localStorage.getItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");

export function setSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Expired or invalid token on a normal request: send the user to login
    if (res.status === 401 && token && path !== "/auth/login") {
      clearSession();
      window.location.href = "/login";
    }
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail[0].msg.replace(/^Value error, /, "")
        : "Something went wrong";
    throw new Error(message);
  }
  return data;
}
export async function uploadFile(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(BASE + "/media", {
    method: "POST",
    // No Content-Type here: the browser sets it, including the multipart boundary
    headers: { Authorization: `Bearer ${getToken()}` },
    body: form,
  });
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new Error(typeof data?.detail === "string" ? data.detail : "Upload failed");
  }
  return data; // { url, media_type }
}