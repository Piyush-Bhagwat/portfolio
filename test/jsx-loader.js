import { transform } from "esbuild";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export async function resolve(specifier, context, nextResolve) {
  try {
    return await nextResolve(specifier, context);
  } catch (err) {
    if (
      (err.code === "ERR_MODULE_NOT_FOUND" || err.code === "ERR_UNSUPPORTED_DIR_IMPORT") &&
      (specifier.startsWith("./") || specifier.startsWith("../") || specifier.startsWith("/"))
    ) {
      for (const ext of [".jsx", ".js", "/index.jsx", "/index.js"]) {
        try {
          return await nextResolve(specifier + ext, context);
        } catch {
          // continue checking extensions
        }
      }
    }
    throw err;
  }
}

export async function load(url, context, nextLoad) {
  if (url.endsWith(".css")) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default {};",
    };
  }
  if (/\.(png|jpe?g|gif|svg|webp)$/i.test(url)) {
    return {
      format: "module",
      shortCircuit: true,
      source: "export default '';",
    };
  }
  if (url.endsWith(".jsx")) {
    const filePath = fileURLToPath(url);
    const raw = await readFile(filePath, "utf8");
    const { code } = await transform(raw, {
      loader: "jsx",
      jsx: "automatic",
      format: "esm",
      target: "node20",
    });
    return {
      format: "module",
      shortCircuit: true,
      source: code,
    };
  }
  return nextLoad(url, context);
}
