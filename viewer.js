import { groups } from "./groups.js";
import { symbols } from "./syms.js";
const search = new URLSearchParams(window.location.search);
const actualSym = search.get("s");
const symname = search.get("sym");

const symame = document.getElementById("symbol-name");
const bigsym = document.getElementById("large-symbol");
const symholder = document.getElementById("symbol");
const tags = document.getElementById("symbol-tags");
const rels = document.getElementById("related-syms");

/**@param {typeof symbols[0]} sym  */
function view(sym) {
  if (sym) {
    document.title = `Symbol Viewer - ${sym.name}`;
    symame.textContent = sym.name;
    symholder.textContent = sym.symbol;
    bigsym.onclick = () => navigator.clipboard.writeText(sym.symbol);

    if (sym.tags.length > 1) {
      const sname = sym.name.toLowerCase();
      for (const t of sym.tags) {
        if(t === sname) continue
        const container = document.createElement("span");
        container.classList.add("symbol-aka");
        container.textContent = t;

        tags.append(container);
      }
    }

    const relevantgroups = groups.filter((g) => g.has(sym.name));
    if (relevantgroups) {
      for (const group of relevantgroups) {
        const grp = document.createElement("span");
        grp.classList.add("related-syms-group");
        for (const v of group)
          for (const symbol of symbols.filter((x) => x.name === v)) {
            if (symbol.symbol === sym.symbol) continue;

            const container = document.createElement("a");
            container.classList.add("symbol-box");
            container.href = "viewer.html?s=" + encodeURIComponent(symbol.symbol);

            const nameplate = document.createElement("span");
            nameplate.classList.add("symbol-box-name");
            nameplate.textContent = v;

            // symbol itself
            const symdis = document.createElement("span");
            symdis.classList.add("symbol-box-symbol");
            symdis.textContent = symbol.symbol;

            container.append(nameplate, symdis);
            grp.append(container);
          }
        rels.append(grp, document.createElement("hr"));
      }
    }
  } else {
    window.location.href = "./index.html";
  }
}

if (actualSym) {
  const lfor = decodeURIComponent(actualSym);
  const sym = symbols.find((x) => x.symbol === lfor);
  view(sym);
} else if (symname) {
  const lfor = decodeURIComponent(symname).toLowerCase();
  const sym = symbols.find((x) => x.name.toLowerCase() === lfor);
  view(sym);
}
