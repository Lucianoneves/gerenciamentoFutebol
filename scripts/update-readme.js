const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const routesPath = path.join(repoRoot, "backend", "src", "routes", "routes.js");
const readmePath = path.join(repoRoot, "README.md");

function extractRoutes(code) {
  const re = /router\.(get|post|put|delete)\s*\(\s*["'`]([^"'`]+)["'`]/g;
  const out = [];
  let m;
  while ((m = re.exec(code))) out.push({ method: m[1].toUpperCase(), path: m[2] });
  return out.sort((a, b) => (a.path === b.path ? a.method.localeCompare(b.method) : a.path.localeCompare(b.path)));
}

function buildBlock(routes) {
  const lines = ["<!-- routes:auto:start -->", "### Rotas (geradas automaticamente)"]; 
  routes.forEach(r => lines.push(`- ${r.method} ${r.path}`));
  lines.push("<!-- routes:auto:end -->");
  return lines.join("\n") + "\n";
}

function updateReadme(block) {
  const readme = fs.readFileSync(readmePath, "utf8");
  const start = readme.indexOf("<!-- routes:auto:start -->");
  const end = readme.indexOf("<!-- routes:auto:end -->");
  if (start !== -1 && end !== -1) {
    const before = readme.slice(0, start);
    const after = readme.slice(end + "<!-- routes:auto:end -->".length);
    fs.writeFileSync(readmePath, before + block + after);
    return;
  }
  const anchor = readme.indexOf("## Endpoints e Exemplos `curl`");
  if (anchor !== -1) {
    const insertPos = readme.indexOf("\n", anchor) + 1;
    const updated = readme.slice(0, insertPos) + block + readme.slice(insertPos);
    fs.writeFileSync(readmePath, updated);
    return;
  }
  fs.appendFileSync(readmePath, "\n" + block);
}

function runOnce() {
  const code = fs.readFileSync(routesPath, "utf8");
  const routes = extractRoutes(code);
  const block = buildBlock(routes);
  updateReadme(block);
}

const watch = process.argv.includes("--watch");
if (watch) {
  runOnce();
  let timer;
  fs.watch(routesPath, { persistent: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(runOnce, 200);
  });
} else {
  runOnce();
}