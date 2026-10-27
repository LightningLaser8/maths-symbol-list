/** @type {Map<string, {name:string, values:Set<string>}>} */
export const groups = new Map(
  /** @type {string} */ (await (await fetch("./symbols.grp")).text())
    .split("\n")
    .map(symline => {
      symline = symline.trim();
      if (!symline) return;
      const parts = symline.split("|", 3).map(x => x.trim());
      // console.log(parts)
      if (parts.length !== 3) return;
      const [id, name, values] = parts;
      return [
        id,
        {
          name,
          values: new Set(
            values
              .split(",")
              .map(x => x.trim())
              .filter(x => !!x),
          ),
        },
      ];
    })
    .filter(x => !!x),
);

// console.log(groups);