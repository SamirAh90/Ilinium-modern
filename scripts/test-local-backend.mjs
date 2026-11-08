import { readFile } from "node:fs/promises";

const base = "http://127.0.0.1:8080";
const config = await readFile("public/api/config.php", "utf8");
const value = (key) => config.match(new RegExp(`'${key}'\\s*=>\\s*'([^']+)'`))?.[1];
const email = value("admin_email");
const password = value("admin_password");
if (!email || !password) throw new Error("Local admin credentials are not configured");

const check = (condition, message) => {
  if (!condition) throw new Error(message);
};
const json = async (url, options = {}) => {
  const response = await fetch(`${base}${url}`, options);
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
};

const home = await fetch(`${base}/`);
check(home.ok && (await home.text()).includes("Salong Ilinium"), "Frontend failed");
const publicRows = await json(
  "/api/index.php?resource=treatments&fields=*&order=%7B%22column%22%3A%22sort_order%22%2C%22ascending%22%3Atrue%7D",
);
check(publicRows.response.ok && publicRows.payload.data.length > 0, "Public content failed");

const wrong = await json("/api/index.php?action=login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password: "definitely-wrong" }),
});
check(wrong.response.status === 401, "Invalid login was not rejected");
const login = await json("/api/index.php?action=login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
check(login.response.ok, "Valid login failed");
const cookie = login.response.headers.get("set-cookie")?.split(";")[0];
check(cookie, "Session cookie missing");
const authHeaders = { Cookie: cookie, "Content-Type": "application/json" };
const user = await json("/api/index.php?action=user", { headers: { Cookie: cookie } });
check(user.payload.data.user?.email === email, "Authenticated session failed");

const row = {
  date: "2099-12-31",
  label: "Automatiskt test",
  closed: true,
  opens: null,
  closes: null,
};
const inserted = await json("/api/index.php?resource=special_opening_hours&action=insert", {
  method: "POST",
  headers: authHeaders,
  body: JSON.stringify(row),
});
check(inserted.response.ok && inserted.payload.data[0]?.id, "CMS insert failed");
const id = inserted.payload.data[0].id;
const filters = encodeURIComponent(JSON.stringify([{ column: "id", value: id }]));
const updated = await json(
  `/api/index.php?resource=special_opening_hours&action=update&filters=${filters}`,
  { method: "PATCH", headers: authHeaders, body: JSON.stringify({ label: "Uppdaterat test" }) },
);
check(updated.response.ok, "CMS update failed");
const removed = await json(`/api/index.php?resource=special_opening_hours&filters=${filters}`, {
  method: "DELETE",
  headers: { Cookie: cookie },
});
check(removed.response.ok, "CMS delete failed");

const image = await readFile("public/images/klippning.jpg");
const form = new FormData();
form.append("path", "tests/upload.jpg");
form.append("file", new Blob([image], { type: "image/jpeg" }), "upload.jpg");
const upload = await json("/api/index.php?action=upload", {
  method: "POST",
  headers: { Cookie: cookie },
  body: form,
});
check(
  upload.response.ok && upload.payload.data.path.startsWith("/uploads/tests/"),
  "Image upload failed",
);
const uploadedImage = await fetch(`${base}${upload.payload.data.path}`);
check(
  uploadedImage.ok && uploadedImage.headers.get("content-type")?.startsWith("image/"),
  "Uploaded image is not publicly readable",
);

const logout = await json("/api/index.php?action=logout", {
  method: "POST",
  headers: { Cookie: cookie, "Content-Type": "application/json" },
  body: "{}",
});
check(logout.response.ok, "Logout failed");
console.log(
  JSON.stringify(
    {
      frontend: true,
      publicContent: publicRows.payload.data.length,
      invalidLoginRejected: true,
      login: true,
      session: true,
      cmsCrud: true,
      imageUpload: true,
      logout: true,
    },
    null,
    2,
  ),
);
