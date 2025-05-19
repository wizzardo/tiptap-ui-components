import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*'],
      exclude: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: '@use "@/index.scss";',
        api: "modern-compiler",
      },
    },
    modules: {
      localsConvention: 'camelCaseOnly',
    },
  },
  build: {
    minify: false,
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'TiptapUIComponents',
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        '@tiptap/react',
        '@tiptap/extension-highlight',
        '@tiptap/extension-image',
        '@tiptap/extension-link',
        '@tiptap/extension-subscript',
        '@tiptap/extension-superscript',
        '@tiptap/extension-task-item',
        '@tiptap/extension-task-list',
        '@tiptap/extension-text-align',
        '@tiptap/extension-typography',
        '@tiptap/extension-underline',
        '@tiptap/pm',
        '@tiptap/starter-kit',
        'prosemirror-state',
        'prosemirror-view',
        'prosemirror-model',
        'prosemirror-transform',
        'tabbable',
        '@floating-ui/react',
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
          '@tiptap/react': 'TiptapReact',
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
    sourcemap: true,
    emptyOutDir: true,
    cssCodeSplit: false,
  },
})
