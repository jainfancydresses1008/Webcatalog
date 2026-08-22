import fs from "node:fs";
import path from "node:path";

export function loadProjectEnv() {
  for (const filename of [".env", ".env.local"]) {
    const filePath = path.join(process.cwd(), filename);
    if (!fs.existsSync(filePath)) continue;

    const content = fs.readFileSync(filePath, "utf8");
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (process.env[key] !== undefined) continue;
      let value = rawValue.trim();
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      process.env[key] = value;
    }
  }
}

export function requireEnv(...keys: string[]) {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(", ")}`);
  }
}
