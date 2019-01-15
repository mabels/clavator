import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import filesize from 'rollup-plugin-filesize';
import less from 'rollup-plugin-less';
import image from 'rollup-plugin-image';
import nodeResolve from 'rollup-plugin-node-resolve';
import progress from 'rollup-plugin-progress';
import visualizer from 'rollup-plugin-visualizer';

// import { uglify } from 'rollup-plugin-uglify';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default {
	input: 'dist/src/ui/client.js',
	output: {
		// file: 'dist/src/ui/index.js',
		// format: 'iife', // immediately-invoked function expression — suitable for <script> tags
		sourcemap: true
	},
	plugins: [
		progress(),
		// resolve(), // tells Rollup how to find date-fns in node_modules
		nodeResolve({
		      browser: true,
		      jsnext: true,
		      main: true
		    }),
		less(),
		image(),
		commonjs({
		  include: 'node_modules/**',
		  namedExports: {
		    'node_modules/react/index.js': [
			'Component', 
			'PureComponent', 
			'Fragment', 
			'Children', 
			'createElement'
		    ]
		  }
		}), // converts date-fns to ES modules
		visualizer(),
		filesize(),
		// production && uglify() // minify, but only in production
	]
};
