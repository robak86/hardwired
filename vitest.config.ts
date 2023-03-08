import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        include: [
            "./packages/core/**/__test__/*.test.{ts,tsx}",
            "./packages/react/**/__test__/*.test.{ts,tsx}",
            "./packages/hooks/**/__test__/*.test.{ts,tsx}",
        ],
        environment: "happy-dom",
        clearMocks: true,
        globals: true,
    },
})
