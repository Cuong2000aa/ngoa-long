import { createReadStream, cpSync, existsSync, statSync } from "node:fs";
import { extname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, type Plugin } from "vite";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

/** Script cũ (BE, UI) nạp bằng <script> thường, giữ nguyên đường dẫn trong bản build. */
const LEGACY_DIRS = ["js", "data", "assets", "css"];
/** Thứ Vite đã tự bundle (src/ import) hoặc không còn dùng. */
const SKIP = [
  /[\\/]js[\\/]vendor([\\/]|$)/,
  /[\\/]js[\\/]city-render\.js$/,
  /[\\/]assets[\\/]city[\\/](walls|buildings3d|birds|people|scape)([\\/]|$)/,
];

function copyLegacy(): Plugin {
  let root = ".";
  let outDir = "dist";
  return {
    name: "nl-copy-legacy",
    apply: "build",
    configResolved(cfg) {
      root = cfg.root;
      outDir = resolve(cfg.root, cfg.build.outDir);
    },
    closeBundle() {
      for (const dir of LEGACY_DIRS) {
        const from = resolve(root, dir);
        if (!existsSync(from)) continue;
        cpSync(from, resolve(outDir, dir), {
          recursive: true,
          filter: (src) => !SKIP.some((re) => re.test(src)),
        });
      }
    },
  };
}

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".glb": "model/gltf-binary",
  ".json": "application/json",
  ".css": "text/css",
  ".js": "text/javascript",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".mp3": "audio/mpeg",
};

/** Dev: phục vụ /assets /css /js /data khi publicDir=false. */
function staticDirs(): Plugin {
  const dirs = ["assets", "css", "js", "data"];
  return {
    name: "nl-static-dirs",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url || "";
        // Để Vite xử lý ?import / ?raw / ?url — middleware static không được trả raw JSON
        if (/[?&](import|raw|url|worker)(=|&|$)/.test(url)) return next();
        const raw = url.split("?")[0];
        if (!dirs.some((d) => raw === `/${d}` || raw.startsWith(`/${d}/`))) return next();
        const file = resolve(server.config.root, decodeURIComponent(raw.slice(1)));
        try {
          const st = statSync(file);
          if (!st.isFile()) return next();
          res.setHeader("Content-Type", MIME[extname(file).toLowerCase()] || "application/octet-stream");
          createReadStream(file).pipe(res);
        } catch {
          next();
        }
      });
    },
  };
}

export default defineConfig({
  base: "./",
  publicDir: false,
  optimizeDeps: {
    entries: ["index.html", "preview-skill-3d.html", "preview-combat.html"],
  },
  server: { port: 5173, open: true },
  build: {
    target: "es2022",
    assetsDir: "_app",
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        previewSkill3d: resolve(rootDir, "preview-skill-3d.html"),
        previewCombat: resolve(rootDir, "preview-combat.html"),
      },
    },
  },
  plugins: [staticDirs(), copyLegacy()],
});
