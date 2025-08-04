#!/usr/bin/env bun

import stylus from "@~8/stylus"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import css2mod from "@3-/css2js/css2mod.js"
import read from "@3-/read"
import { walkRel } from "@3-/walk"
import write from "@3-/write"
import { init, parse } from "es-module-lexer"

await init

const LI = process.argv.slice(2),
	ROOT = dirname(import.meta.dirname),
	DIST = join(ROOT, "dist"),
	HEAD = 'import {Style} from "-/dom/_.js"\n',
	DIR_DOM = join(DIST, "dom"),
	DIR_CSS = join(DIST, "css"),
	modify = async (name) => {
		let is_web_com,
			js = name + ".js"

		const jsfp = join(DIR_DOM, js),
			css = name + ".styl",
			code = read(jsfp)

		for (const i of (await parse(code))[0]) {
			// 如果是用 S 自定义的网页组件，不用导入样式
			if (i.n == "-/dom/_.js") {
				// 静态导入
				if (i.d === -1) {
					const import_li = code
						.substring(i.ss, i.se)
						.split("}")[0]
						?.split("{")[1]
						?.split(",")
					if (import_li) {
						if (import_li.map((i) => i.trim()).includes("S")) {
							is_web_com = true
							js = js.toLowerCase()
						}
					}
				}
			}
		}

		write(join(DIR_CSS, js), css2mod(stylus(read(join(DIR_DOM, css)))))

		if (is_web_com) {
			return
		}
		if (code.startsWith(HEAD)) {
			console.log(css)
		} else {
			console.log(js)
			write(jsfp, HEAD + code + `\nawait Style(${JSON.stringify(name)})`)
		}
	}

if (LI.length) {
	// coffeescript 编译后的回调
	const set = new Set(),
		ext_li = ["js", "styl"]
	for (const i of LI) {
		let n = 1
		for (const ext of ext_li) {
			if (i.endsWith("." + ext)) {
				const fp = i.slice(0, -ext.length - 1),
					name = fp.slice(9)
				if (existsSync(join(ROOT, fp + "." + ext_li[n]))) {
					if (!set.has(name)) {
						await modify(name)
						set.add(name)
					}
				}
			}
			--n
		}
	}
} else {
	await (async () => {
		for await (const i of walkRel(DIR_DOM)) {
			if (i.endsWith(".styl")) {
				const name = i.slice(0, -5)
				if (existsSync(join(DIR_DOM, name + ".js"))) {
					await modify(name)
				}
			}
		}
	})()
}

process.exit()
