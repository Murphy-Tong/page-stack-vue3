import * as fs from 'fs'
import * as path from 'path'
import * as stream from 'stream'
import { series, src, dest } from "gulp"
//@ts-ignore
import babel from 'gulp-babel'
import tsc from 'gulp-typescript'
// import vueJsx from 'js'
import gulpEsbuild from 'gulp-esbuild'

const OUT_DIR = path.resolve(__dirname, "..", "lib")

function buildJS(inputStream: stream.Readable) {
    return inputStream
        .pipe(gulpEsbuild({
            bundle: false,
            target: 'es2016'
        }))
        .pipe(babel({
            plugins: [['@vue/babel-plugin-jsx', { mergeProps: false, enableObjectSlots: false, transformOn: true }]]
        }))
        .pipe(dest(OUT_DIR))
}

function build() {
    src(['../src/**/*.css']).pipe(dest(OUT_DIR))
    const tsFile = src(['../src/**/*.tsx', '../src/**/*.ts']).pipe(tsc({
        declaration: true,
        target: "es2020",
        module: "es2020",
        jsx: 'preserve',
        moduleResolution: "node",
        types: [],
    }));
    buildJS(tsFile.js)
    return tsFile.dts.pipe(dest(OUT_DIR))
}

function clear() {
    return fs.promises.rm(OUT_DIR, { recursive: true }).catch(console.log)
}

export default series(clear, build)