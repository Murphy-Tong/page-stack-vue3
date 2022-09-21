"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs"));
const path = tslib_1.__importStar(require("path"));
const gulp_1 = require("gulp");
//@ts-ignore
const gulp_babel_1 = tslib_1.__importDefault(require("gulp-babel"));
const gulp_typescript_1 = tslib_1.__importDefault(require("gulp-typescript"));
// import vueJsx from 'js'
const gulp_esbuild_1 = tslib_1.__importDefault(require("gulp-esbuild"));
const OUT_DIR = path.resolve(__dirname, "..", "lib");
function buildJS(inputStream) {
    return inputStream
        .pipe((0, gulp_esbuild_1.default)({
        bundle: false,
        target: 'es2016'
    }))
        .pipe((0, gulp_babel_1.default)({
        plugins: [['@vue/babel-plugin-jsx', { mergeProps: false, enableObjectSlots: false, transformOn: true }]]
    }))
        .pipe((0, gulp_1.dest)(OUT_DIR));
}
function build() {
    const tsFile = (0, gulp_1.src)(['../src/**/*.tsx', '../src/**/*.ts']).pipe((0, gulp_typescript_1.default)({
        declaration: true,
        target: "es2020",
        module: "es2020",
        jsx: 'preserve',
        moduleResolution: "node",
        types: [],
    }));
    buildJS(tsFile.js);
    return tsFile.dts.pipe((0, gulp_1.dest)(OUT_DIR));
}
function clear() {
    return fs.promises.rm(OUT_DIR, { recursive: true }).catch(console.log);
}
exports.default = (0, gulp_1.series)(clear, build);
