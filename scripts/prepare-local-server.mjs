import { access, copyFile } from "node:fs/promises";
import { constants } from "node:fs";

await access("public/api/config.php", constants.R_OK);
await copyFile("public/api/config.php", "dist/api/config.php");
console.log("Local server configuration copied to dist/api/config.php (ignored by Git).");
