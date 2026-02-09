// config.ts
const config = {
    IMG_PATH:import.meta.env.DEV ? `../${import.meta.env.MODE}/` : `./`
};

export default config;