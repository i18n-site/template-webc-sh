#!/usr/bin/env bun

import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import minifyJs from "@3-/minifyjs"
import read from "@3-/read"
import { walkRel } from "@3-/walk"

const ROOT = dirname(import.meta.dirname),
	DIST = join(ROOT, "dist")

const minify = async (fp) => {
	fp = join(DIST, fp)
	try {
		const { code, map } = await minifyJs(read(fp), fp)
		writeFileSync(fp, code)
		writeFileSync(fp + ".map", map)
	} catch (e) {
		console.error(fp)
		throw e
	}
}

for (const fname of walkRel(
	DIST,
	(name) => ["css", "node_modules"].includes(name) || name.startsWith("."),
)) {
	if (fname.endsWith(".js")) {
		await minify(fname)
	}
}

process.exit()
