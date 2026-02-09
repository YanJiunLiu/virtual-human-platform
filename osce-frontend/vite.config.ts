import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path';

//import mkcert from 'vite-plugin-mkcert'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');

    //const isDev = command === 'serve'; 
    const entry = env.VITE_ENTRY || 'user';

    return {
        plugins: [
            //mkcert(),
            react(),
            tailwindcss()
        ],
        server: {
            port: 11119,
            //host:'localhost',
            //https: true
        },
        base: `/${entry}`,
        build: {
            outDir: `dist/${entry}`,
            rollupOptions: {
                input: {
                    [entry]: resolve(__dirname, `index.html`),
                },
                /*
                output: {
                    assetFileNames: (assetInfo) => {
                        // 根據資源類型分
                        if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name || '')) {
                            return 'assets/img/[name]-[hash][extname]'; // ✅ 圖片存放位置
                        }
                        
                        if (/\.css$/.test(assetInfo.name || '')) {
                            return 'assets/css/[name]-[hash][extname]';
                        }
                        return 'assets/[name]-[hash][extname]';
                    },
                }, 
                */
            },
        },
    };
});