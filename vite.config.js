import basicSsl from "@vitejs/plugin-basic-ssl";

export default {
    base: "/ARIndoorNavigation-Threejs/",
    server: {
        host: true,
    },
    plugins: [basicSsl()],
};
