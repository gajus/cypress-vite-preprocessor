import {
  type EventEmitter,
} from 'node:events';
import path from 'node:path';
import {
  type RollupWatcher,
} from 'rollup';
import {
  build,
  type InlineConfig,
} from 'vite';

type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };

type FileObject = EventEmitter & {
  filePath: string,
  outputPath: string,
  shouldWatch: boolean,
};

const {
  NODE_ENV,
  // eslint-disable-next-line node/no-process-env
} = process.env;

export const createVitePreprocessor = () => {
  const cache: Record<string, string> = {};

  return async (file: FileObject) => {
    const {
      filePath,
      outputPath,
      shouldWatch,
    } = file;

    if (cache[filePath]) {
      return cache[filePath];
    }

    const filename = path.basename(outputPath);

    const filenameWithoutExtension = path.basename(
      outputPath,
      path.extname(outputPath),
    );

    const viteConfig: WithRequired<InlineConfig, 'build'> = {
      build: {
        emptyOutDir: false,
        minify: false,
        outDir: path.dirname(outputPath),
        sourcemap: true,
        ssr: false,
        write: true,
      },
      configFile: false,
      define: {
        'process.env': {
          NODE_ENV,
        },
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src/'),
        },
      },
      ssr: {
        format: 'cjs',
      },
    };

    if (filename.endsWith('.html')) {
      viteConfig.build.rollupOptions = {
        input: {
          [filenameWithoutExtension]: filePath,
        },
      };
    } else {
      viteConfig.build.lib = {
        entry: filePath,
        fileName: () => {
          return filename;
        },
        formats: [
          'umd',
        ],
        name: filenameWithoutExtension,
      };
    }

    if (shouldWatch) {
      viteConfig.build.watch = {};
    }

    const watcher = await build(viteConfig) as RollupWatcher;

    if (shouldWatch) {
      watcher.on('event', (event) => {
        if (event.code === 'END') {
          file.emit('rerun');
        }
      });
      file.on('close', () => {
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete cache[filePath];

        void watcher.close();
      });
    }

    // eslint-disable-next-line require-atomic-updates
    cache[filePath] = outputPath;

    return outputPath;
  };
};
