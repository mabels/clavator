import resolve from 'rollup-plugin-node-resolve';
import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import less from 'rollup-plugin-less';
import images from 'rollup-plugin-image-files';
import nodeResolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import visualizer from 'rollup-plugin-visualizer';
import globals from 'rollup-plugin-node-globals';
import ejs from 'rollup-plugin-ejs';

// import { uglify } from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'src/ui/client.tsx',
	output: {
		file: 'dist/index.js',
		format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true,
		globals: "crypto",
	},
	plugins: [
		// globals(),
		progress(),
		images(),
		// resolve(), // tells Rollup how to find date-fns in node_modules
		less({
			output: 'dist/app.css',
		}),
		typescript(),
		nodeResolve({
		      browser: true,
		      jsnext: true,
		      main: true
		    }),
		commonjs({
		  include: 'node_modules/**',
		  namedExports: {
		    'node_modules/react/index.js': [
			'forwardRef',
			'cloneElement',
			'Component', 
			'PureComponent', 
			'Fragment', 
			'Children', 
			'createElement'
		    ],
		    "node_modules/react-dom/index.js": [
			  "findDOMNode",
			  "unstable_batchedUpdates",
			  "render"
			],
		    "node_modules/uuid/index.js": [
			  "v4"
			],
		    "node_modules/classnames/index.js": [
			  "classnames"
			]
		  }
		}), // converts date-fns to ES modules
		ejs({
		    include: ['**/*.ejs', '**/*.html'], // optional, '**/*.ejs' by default
		    exclude: ['**/index.html'], // optional, undefined by default
		    compilerOptions: {client: true} // optional, any options supported by ejs compiler
		}),
		visualizer(),
		filesize(),
		// production && uglify() // minify, but only in production
	]
};
