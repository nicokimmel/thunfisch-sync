import path from "path"

import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import copy from "rollup-plugin-copy"

export default defineConfig({
    plugins: [
        react(),
        copy({
            hook: "writeBundle",
            targets: [
                {
                    src: "dist/index.html",
                    dest: "dist",
                    rename: "index.ejs"
                }
            ]
        })
    ],
    resolve: {
        alias: {
            "@COMPONENTS": path.resolve(__dirname, "./src/js/components"),
            "@SCSS": path.resolve(__dirname, "./src/scss"),
            "@FONT": path.resolve(__dirname, "./src/font"),
        }
    },
    server: {
        proxy: {
            "/socket.io": {
                target: "http://localhost:3000",
                ws: true,
                changeOrigin: true
            }
        },
    }
})
