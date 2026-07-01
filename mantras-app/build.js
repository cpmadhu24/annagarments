// Compiles js/app.js (JSX) into js/app.compiled.js (plain JS) so the shipped
// app doesn't need to load the Babel runtime (~2.8MB) on every phone.
// Run: node build.js   (after `npm install` in this folder)
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync(path.join(__dirname, "js/app.js"), "utf8");
const out = babel.transformSync(src, {
  presets: [[require.resolve("@babel/preset-react"), { runtime: "classic" }]],
  filename: "app.js"
});
fs.writeFileSync(path.join(__dirname, "js/app.compiled.js"), out.code);
console.log("Compiled js/app.js -> js/app.compiled.js (" + out.code.length + " bytes)");
