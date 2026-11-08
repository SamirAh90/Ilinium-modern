import { access, mkdir, readFile, rm } from "node:fs/promises";
import { constants } from "node:fs";

const required = [
  "dist/index.html",
  "dist/.htaccess",
  "dist/api/index.php",
  "dist/api/install.php",
  "dist/api/schema.sql",
  "dist/api/seed.json",
  "dist/api/config.example.php",
];
await Promise.all(required.map((file) => access(file, constants.R_OK)));

await mkdir("dist/api", { recursive: true });
await rm("dist/api/config.php", { force: true });
const example = await readFile("dist/api/config.example.php", "utf8");
if (!example.includes("db_host")) throw new Error("Invalid STRATO configuration template.");
console.log("Production build ready without credentials. Add api/config.php securely on STRATO.");
