import path from "path"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        // Trỏ thẳng ra thư mục ông muốn
        outDir: 'E:/FileBuildNewProd/FE',
        
        // Quan trọng: Vite sẽ xóa sạch folder cũ trước khi chép file mới vào
        emptyOutDir: true, 
        
        sourcemap: false,
    }
})