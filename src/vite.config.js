import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      // This is the entry we wrote above
      entry: 'src/index.js',
      // This name becomes the global variable in IIFE build: window.MyWidget
      name: 'MyWidget',
      fileName: (format) => `my_widget.${format}.js`,
      formats: ['iife', 'es'], // iife for <script>, es for bundlers
    },
    // If you use external deps, set rollupOptions.external here
  },
});
