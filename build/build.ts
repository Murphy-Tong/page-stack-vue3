import * as fs from "fs";
import * as path from "path";
import * as stream from "stream";
import { series, src, dest, parallel } from "gulp";
//@ts-ignore
import babel from "gulp-babel";
import tsc from "gulp-typescript";

const OUT_DIR = path.resolve(__dirname, "..", "es");
const OUT_DIR_CJS = path.resolve(__dirname, "..", "lib");

function buildJSX(inputStream: stream.Readable) {
  return inputStream.pipe(
    babel({
      plugins: [
        [
          "@vue/babel-plugin-jsx",
          { mergeProps: false, enableObjectSlots: false, transformOn: true },
        ],
      ],
    })
  );
}

function build() {
  src(["../src/**/*.css"]).pipe(dest(OUT_DIR));
  const tsFile = src(["../src/**/*.tsx", "../src/**/*.ts"]).pipe(
    tsc({
      declaration: true,
      target: "ES2017",
      module: "es2020",
      jsx: "preserve",
      moduleResolution: "node",
      types: [],
    })
  );
  buildJSX(tsFile.js).pipe(dest(OUT_DIR));
  return tsFile.dts.pipe(dest(OUT_DIR));
}

function buildCJS() {
  src(["../src/**/*.css"]).pipe(dest(OUT_DIR_CJS));
  const tsFile = src(["../src/**/*.tsx", "../src/**/*.ts"]).pipe(
    tsc({
      declaration: true,
      target: "ES2017",
      module: "commonjs",
      jsx: "preserve",
      moduleResolution: "node",
      types: [],
    })
  );
  buildJSX(tsFile.js).pipe(dest(OUT_DIR_CJS));
  return tsFile.dts.pipe(dest(OUT_DIR_CJS));
}

function clear() {
  return fs.promises.rm(OUT_DIR, { recursive: true }).catch(console.log);
}

export default series(clear, parallel([build, buildCJS]));
