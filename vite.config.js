import fs from 'node:fs';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Some React Native packages ship CJS files (module.exports = { ... }) that other packages
// import as ESM (import { foo } from '...'). Vite serves them as native ESM, so named exports
// are missing in the browser unless we rewrite the export at load time.
const REACT_NATIVE_CJS_INTEROP = [
  /[/\\]react-native-svg[/\\]lib[/\\]module[/\\]lib[/\\]extract[/\\]transform(ToRn)?\.js$/,
  /[/\\]@react-native[/\\]assets-registry[/\\]registry\.js$/,
];

function cjsModuleExportsToEsm(code) {
  return code.replace(
    /module\.exports\s*=\s*\{([\s\S]*?)\};?\s*(?:\/\/# sourceMappingURL=[^\r\n]*)?/,
    (match, exports) => {
      const sourcemap = match.includes('//# sourceMappingURL=')
        ? match.slice(match.indexOf('//# sourceMappingURL='))
        : '';
      const pairs = exports
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
        .map((part) => {
          const colon = part.indexOf(':');
          if (colon === -1) {
            return { name: part, value: part };
          }
          return {
            name: part.slice(0, colon).trim(),
            value: part.slice(colon + 1).trim(),
          };
        });

      const shorthand = pairs.filter(({ name, value }) => name === value);
      const explicit = pairs.filter(({ name, value }) => name !== value);
      const namedExports = [
        shorthand.length > 0
          ? `export { ${shorthand.map(({ name }) => name).join(', ')} };`
          : '',
        ...explicit.map(({ name, value }) => `export const ${name} = ${value};`),
      ]
        .filter(Boolean)
        .join('\n');
      const defaultExport = pairs
        .map(({ name, value }) =>
          name === value ? name : `${name}: ${value}`,
        )
        .join(', ');

      return `${namedExports}\nexport default { ${defaultExport} };${sourcemap}`;
    },
  );
}

function reactNativeCjsInterop() {
  return {
    name: 'react-native-cjs-interop',
    enforce: 'pre',
    load(id) {
      const normalizedId = id.split('?')[0];
      if (!REACT_NATIVE_CJS_INTEROP.some((pattern) => pattern.test(normalizedId))) {
        return null;
      }

      const code = fs.readFileSync(normalizedId, 'utf-8');
      if (!code.includes('module.exports')) {
        return null;
      }

      return cjsModuleExportsToEsm(code);
    },
  };
}

export default defineConfig({
  plugins: [reactNativeCjsInterop(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
      'react-native-safe-area-context': 'react-native-safe-area-context',
      'react-native-svg': 'react-native-svg/lib/module/ReactNativeSVG',
      // Guarantee a proper default export for warn-once (used by react-native-screens ScreenStackItem etc.)
      // Prevents "does not provide an export named 'default'" on Vite + pnpm + RNW.
      'warn-once': '/src/web-shims/warn-once.js',
      '@react-native/assets-registry/registry': '/src/web-shims/assets-registry.js',
    },
    extensions: ['.web.js', '.web.tsx', '.js', '.jsx', '.ts', '.tsx'],
  },
  define: {
    global: 'globalThis',
    __DEV__: 'true',
    process: { env: {} },
  },
  optimizeDeps: {
    include: [
      'react-native-web',
      '@react-navigation/native',
      '@react-navigation/bottom-tabs',
      '@react-navigation/elements',
    ],
    exclude: [
      'react-native-svg',
      'react-native-vision-camera',
      'react-native-safe-area-context',
      'react-native-screens',
      'warn-once',
    ],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
