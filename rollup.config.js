import babel from 'rollup-plugin-babel';
import { argv } from 'yargs';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
    entry: 'src/main.js',
    dest: 'dist/vue-form.js',
    format: 'umd',
    moduleName: 'VueForm',
    sourceMap: argv.w,
    plugins: [
        resolve({ jsnext: true, main: true }),
        commonjs(),
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
