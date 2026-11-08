import { access, copyFile, mkdir, readFile } from "node:fs/promises";
import { constants } from "node:fs";

const required = ["dist/index.html", "dist/.htaccess", "dist/api/media.php", "dist/api/config.example.php"];
await Promise.all(required.map((file) => access(file, constants.R_OK)));

await mkdir("dist/api", { recursive: true });
try {
  await access("public/api/config.php", constants.R_OK);
  await copyFile("public/api/config.php", "dist/api/config.php");
  console.log("Included the local server-only media configuration in dist/api/config.php.");
} catch {
  const example = await readFile("dist/api/config.example.php", "utf8");
  if (!example.includes("YOUR-SERVICE-ROLE-JWT")) throw new Error("Invalid media configuration template.");
  console.log("Build ready. Add dist/api/config.php from config.example.php before upload.");
}
