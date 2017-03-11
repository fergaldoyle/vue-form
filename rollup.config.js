import babel from 'rollup-plugin-babel';
import { argv } from 'yargs';

export default {
    entry: 'src/main.js',
    dest: 'dist/vue-form.js',
    format: 'umd',
    moduleName: 'vueForm',
    sourceMap: argv.w,
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};
