import basicSsl from "@vitejs/plugin-basic-ssl";

export default {
    base: "/ARIndoorNavigation-Threejs/",
    publicDir: "static/",
    server: {
        host: true,
    },
    plugins: [basicSsl()],
};
