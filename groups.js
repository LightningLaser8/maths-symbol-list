export const groups = /** @type {string} */ (await (await fetch("./symbols.grp")).text())
  .split("\n")
  .map((symline) => {
    symline = symline.trim();
    if (!symline) return;

    return new Set(symline
      .split(",")
      .map((x) => x.trim())
      .filter((x) => !!x));
  })
  .filter((x) => !!x);
