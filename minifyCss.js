#!/usr/bin/env bun

import mincss from "@~8/mincss"
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import css2mod from "@3-/css2js/css2mod.js"
import read from "@3-/read"
import { walkRel } from "@3-/walk"
import postcss from "postcss"
import atImport from "postcss-import"

const ROOT = dirname(import.meta.dirname),
	DIST = join(ROOT, "dist"),
	DIR_DOM = join(DIST, "dom"),
	DIR_DIST_CSS = join(DIST, "css"),
	DIR_CSS = join(ROOT, "css")

process.chdir(DIR_CSS)

const write = (fname, css, to, wrap) => {
	css = mincss(css, fname, true).code.toString()
	if (wrap) {
		css = wrap(css)
	}
	writeFileSync(to, css)
}

for await (const i of walkRel(DIR_DOM)) {
	if (i.endsWith(".styl")) {
		const fname = i.slice(0, -4) + "js",
			fp = join(DIR_DIST_CSS, fname)
		write(fname, (await import(fp)).default, fp, css2mod)
	}
}

const THEME = "_.css",
	THEME_CSS =
		"@layer {" +
		(
			await postcss()
				.use(atImport())
				.process(read(THEME).replace(/\s*layer\s*;/g, ";"), {
					from: THEME,
				})
		).css +
		"}"

// for await (const i of walkRel(DIR_CSS, (i) => i.startsWith("."))) {
// 	if (i.endsWith(".css")) {
// 		const fp = join(DIR_CSS, i)
// 		if (i == THEME || i.startsWith("theme/")) {
// 			continue
// 		}
// 		console.log(i)
// 		const css = read(fp)
// 		merge.push(css)
// 		write(i, css, join(DIST, i))
// 	}
// }
//
// const MERGE_CSS = merge.join("\n")

Object.entries({
	_: THEME_CSS,
}).forEach(([name, css]) => {
	name = name + ".css"
	write(name, css, join(DIST, name))
})

process.exit()
