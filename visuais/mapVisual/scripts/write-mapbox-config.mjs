// Gera src/mapboxConfig.generated.ts a partir de variáveis de ambiente
// ou de um arquivo .env.local (nenhum dos dois é versionado).
//
// Ordem de precedência: variável de ambiente > .env.local > padrão.
// Roda automaticamente antes de `npm run start`, `npm run package` e
// `npm run typecheck` (scripts "pre*" do package.json).

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const envFile = join(root, ".env.local");
const output = join(root, "src", "mapboxConfig.generated.ts");

const defaults = {
    MAPBOX_ACCESS_TOKEN: "",
    MAPBOX_USERNAME: "kevenaraujo",
    MAPBOX_STYLE_ID: "cmqz9pcw7000401s12tom7zb1",
};

function readEnvFile(path) {
    if (!existsSync(path)) {
        return {};
    }

    const values = {};

    for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);

        if (match && !line.trimStart().startsWith("#")) {
            values[match[1]] = match[2].replace(/^["']|["']$/g, "");
        }
    }

    return values;
}

const fromFile = readEnvFile(envFile);
const config = {};

for (const key of Object.keys(defaults)) {
    config[key] = process.env[key] || fromFile[key] || defaults[key];
}

const content = [
    "// ARQUIVO GERADO por scripts/write-mapbox-config.mjs.",
    "// Não edite e não versione: ele está no .gitignore.",
    "",
    ...Object.entries(config).map(
        ([key, value]) => `export const ${key}: string = ${JSON.stringify(value)};`
    ),
    "",
].join("\n");

writeFileSync(output, content, "utf8");

if (config.MAPBOX_ACCESS_TOKEN) {
    console.log("[mapbox] Token configurado para este build.");
} else {
    console.warn(
        "[mapbox] AVISO: MAPBOX_ACCESS_TOKEN não definido. O pacote vai compilar, " +
        "mas o mapa exibirá a mensagem de token ausente."
    );
}
