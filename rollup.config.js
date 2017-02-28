import babel from 'rollup-plugin-babel';

export default {
    entry: 'src/main.js',
    dest: 'dist/vue-form.js',
    format: 'umd',
    moduleName: 'vueForm',
    plugins: [
        babel({
            exclude: 'node_modules/**'
        })
    ]
};