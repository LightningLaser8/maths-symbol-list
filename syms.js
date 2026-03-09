export const symbols = /** @type {string} */ (await (await fetch("./symbols.map")).text())
  .split("\n")
  .map((symline) => {
    symline = symline.trim();
    if (!symline) return;

    const ci = symline.indexOf(":");
    if (ci != -1) {
      const name = symline.substring(0, ci).trim(),
        def = symline.substring(ci + 1);

      const ai = def.indexOf("->");
      if (ai != -1) {
        const tags = [
          ...def
            .substring(0, ai)
            .split(",")
            .map((x) => x.trim().toLowerCase()).filter(x => x),
          name.toLowerCase(),
        ];
        const sym = def.substring(ai + 2).trim();
        return { name: name, tags: tags, symbol: sym };
      } else console.warn(`No symbol defined for '${name}': ${def}`);
    } else console.warn(`Symbol malformed: ${symline}`);
  })
  .filter((x) => !!x);