/** @type {Map<string,{name:string,tags:string[],symbol:string>}} */
export const symbols = new Map(
  /** @type {string} */ (await (await fetch("./symbols.map")).text())
    .split("\n")
    .map(symline => {
      symline = symline.trim();
      if (!symline) return;
      const parts = symline.split("|", 4).map(x => x.trim());
      // registry | display | tags | symbol
      if (parts.length === 4) {
        const [id, name, tags, symbol] = parts;
        return [
          id,
          {
            name,
            tags: tags
              .split(",")
              .map(x => x.trim())
              .filter(x => x),
            symbol,
          },
        ];
      }
      console.warn(`Symbol malformed: '${symline}' expected 'id | name | tags | symbol'`);
      return undefined;
    })
    .filter(x => !!x),
);
export const randSym = () =>
  symbols
    .entries()
    .drop(Math.floor(Math.random() * symbols.size))
    .next().value;
// console.log(symbols);
