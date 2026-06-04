import { createSystem, defaultConfig, defineConfig } from "@chakra-ui/react";

const config = defineConfig({
    globalCss: {
        "h1, h2, h3": {
            fontFamily: "Stag, 'Lucida Grande', sans-serif",
            fontWeight: "700",
        },
    },
    theme: {
        tokens: {
            fonts: {
                heading: { value: "Stag, 'Lucida Grande', sans-serif" },
            },
        },
    },
});

export const system = createSystem(defaultConfig, config);
