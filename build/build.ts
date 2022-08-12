import * as fs from 'fs'
import * as path from 'path'
import * as stream from 'stream'
import { series, src, dest } from "gulp"
//@ts-ignore
import babel from 'gulp-babel'
import tsc from 'gulp-typescript'
// import vueJsx from 'js'

const OUT_DIR = path.resolve(__dirname, "..", "lib")

function buildJSX(inputStream: stream.Readable) {
    return inputStream.pipe(babel({
        // presets: ['@babel/preset-env'],
        plugins: [['@vue/babel-plugin-jsx', { mergeProps: false, enableObjectSlots: false, transformOn: true }]]
    })).pipe(dest(OUT_DIR))
}

function build() {
    const tsFile = src(['../src/**/*.tsx', '../src/**/*.ts']).pipe(tsc({
        declaration: true,
        target: "ESNext",
        module: "ESNext",
        jsx: 'preserve',
        moduleResolution: "node",
        types: [],
    }));
    buildJSX(tsFile.js)
    return tsFile.dts.pipe(dest(OUT_DIR))
}

function clear() {
    return fs.promises.rm(OUT_DIR, { recursive: true }).catch(console.log)
}

export default series(clear, build)