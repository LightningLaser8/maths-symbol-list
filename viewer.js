import { groups } from "./groups.js";
import { symbols } from "./syms.js";
const symame = document.getElementById("symbol-name");
const bigsym = document.getElementById("large-symbol");
const symholder = document.getElementById("symbol");
const tags = document.getElementById("symbol-tags");
const rels = document.getElementById("related-syms");

/**@param {typeof symbols extends Map<*, infer T> ? T : never} sym @param {string} id  */
function view(id, sym) {
  if (sym) {
    document.title = `Symbol Viewer - ${sym.name}`;
    symame.textContent = sym.name;
    symholder.textContent = sym.symbol;
    bigsym.onclick = () => navigator.clipboard.writeText(sym.symbol);

    if (sym.tags.length > 1) {
      const sname = sym.name.toLowerCase();
      for (const t of sym.tags) {
        if (t === sname) continue;
        const container = document.createElement("span");
        container.classList.add("symbol-aka");
        container.textContent = t;

        tags.append(container);
      }
    }

    for (const [gid, { name, values }] of groups) {
      console.log(id, "in?", gid, name, values);
      if (!values.has(id)) continue;
      console.log("has symbol");
      const grp = document.createElement("div");
      grp.classList.add("related-syms-group");

      const grname = document.createElement("div");
      grname.classList.add("group-name");
      grname.textContent = name;
      grp.append(grname);

      for (const vid of values) {
        const symbol = symbols.get(vid);
        const name = symbol?.name ?? vid,
          sym = symbol?.symbol ?? "�";

        const container = document.createElement("a");
        container.classList.add("symbol-box");
        container.href = "viewer.html#" + vid;
        container.onclick = () => setTimeout(refreshFromURL, 5);

        const nameplate = document.createElement("span");
        nameplate.classList.add("symbol-box-name");
        nameplate.textContent = name;

        // symbol itself
        const symdis = document.createElement("span");
        symdis.classList.add("symbol-box-symbol");
        symdis.textContent = sym;

        container.append(nameplate, symdis);
        grp.append(container);
      }
      rels.append(grp, document.createElement("hr"));
    }
  }
}

function refreshFromURL() {
  const search = new URLSearchParams(window.location.search);
  const actualSym = search.get("s");
  const symname = search.get("sym");
  const symid = window.location.hash;

  rels.replaceChildren([]);
  tags.replaceChildren([]);
  if (symid) {
    const id = symid.substring(1);
    const sym = symbols.get(id);
    view(id, sym);
  } else if (actualSym) {
    const lfor = decodeURIComponent(actualSym);
    const [id, sym] = symbols.entries().find(([, x]) => x.symbol === lfor);
    view(id, sym);
  } else if (symname) {
    const lfor = decodeURIComponent(symname).toLowerCase();
    const [id, sym] = symbols.find(([, x]) => x.name.toLowerCase() === lfor);
    view(id, sym);
  }
}
refreshFromURL();
