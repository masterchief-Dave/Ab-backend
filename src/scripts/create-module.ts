import { mkdirSync, writeFileSync, existsSync } from "fs";
import path from "path";

// USAGE:
// bun gen user-auth
// bun gen user-auth ./src/hr-core/modules

const toCamelCase = (s: string) =>
  s.replace(/-([a-z])/g, (_, c) => c.toUpperCase());

const rawModuleName = process.argv[2];
const moduleName = rawModuleName ? toCamelCase(rawModuleName) : undefined;

let targetPath = process.argv[3] || "src/modules";

if (!moduleName) {
  console.error("❌ Please provide a module name, e.g. bun gen user-auth");
  process.exit(1);
}

// Normalize folder path
targetPath = targetPath.replace(/^\.?\/*/, "");

// Ensure target path begins with src/
if (!targetPath.startsWith("src/")) {
  console.error(
    "❌ Target path must start with 'src/'. Example: src/hr-core/modules",
  );
  process.exit(1);
}

// Final folder = target path + module name
const folder = path.join(process.cwd(), targetPath, moduleName);

if (existsSync(folder)) {
  console.error(`⚠️ Module '${moduleName}' already exists at ${targetPath}`);
  process.exit(1);
}

mkdirSync(folder, { recursive: true });

const files = [
  `${moduleName}.controller.ts`,
  `${moduleName}.routes.ts`,
  `${moduleName}.service.ts`,
  `${moduleName}.interface.ts`,
  `${moduleName}.schema.ts`,
  `${moduleName}.repository.ts`,
];

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------- Boilerplate ----------------------

const controller = `class ${cap(moduleName)}Controller {
  public create = async () => {}

  public get = async () => {}

  public update = async () => {}

  public delete = async () => {}
}

export const ${moduleName}Controller = new ${cap(moduleName)}Controller();`;

const routes = `import { Router } from "express";
import { ${moduleName}Controller } from "./${moduleName}.controller";

import { methodNotAllowed } from "../../middleware/method-not-allowed.middleware";

const router = Router();

router
  .route("/")
  .get(${moduleName}Controller.get)
  .post(${moduleName}Controller.create)
  .all(methodNotAllowed);

router
  .route("/:id")
  .get(${moduleName}Controller.get)
  .put(${moduleName}Controller.update)
  .delete(${moduleName}Controller.delete)
  .all(methodNotAllowed);

export default router;`;

const service = `class ${cap(moduleName)}Service {}
export const ${moduleName}Service = new ${cap(moduleName)}Service();`;

const schema = `import { z } from "zod";

class ${cap(moduleName)}Schema {
  create = z.object({});

  update = z.object({});
}

export const ${moduleName}Schema = new ${cap(moduleName)}Schema();`;

const boilerplate: Record<string, string> = {
  controller,
  routes,
  service,
  schema,
};

files.forEach((file) => {
  const type = file.split(".")[1];
  writeFileSync(path.join(folder, file), boilerplate[type as string] || "");
});

console.log(`✅ Module '${moduleName}' created at ${targetPath}`);
