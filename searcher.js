import { favourites } from "./favourites.js";
import { symbols } from "./syms.js";

/**@type {HTMLDivElement} */
const list = document.getElementById("results");
/**@type {HTMLInputElement} */
const search = document.getElementById("search-symbols");
/**@type {HTMLButtonElement} */
const searchbtn = document.getElementById("search-btn");

// console.log("symbols: ", symbols);

searchbtn.addEventListener("click", update);
search.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    searchbtn.click();
  }
});
search.click();

function update() {
  const term = search.value.toLowerCase();
  list.innerHTML = "";
  const all = [
    ...symbols
      .entries()
      .map(([id, sym]) => {
        const name = sym.name.toLowerCase();
        if (term === name)
          return [
            id,
            {
              n: sym.name,
              s: sym.symbol,
              // put exact matches at the top
              r: Infinity,
              t: [],
            },
          ];

        const res = sym.tags.map(t => ({ t: t, i: t.indexOf(term) })).filter(t => t.i !== -1),
          nametermidx = name.indexOf(term);
        if (nametermidx === -1 && res.every(r => r.i === -1)) return undefined;
        // console.log(
        //   `'${sym.name}' matching '${term}' : ${res.length}${nametermidx !== -1 ? " + name" : ""} items: ${res.map((t) => t.t)} (at ${res.map((t) => t.i)})`,
        // );
        let rel = Math.ceil(Math.sqrt(res.length));
        if (nametermidx !== -1) rel += 3;
        const avg = res.length === 0 ? 0 : Math.min(res.map(({ i }) => i)), // res.reduce((p, c) => p + c.i, 0) / res.length,
          namesub = nametermidx !== -1 ? nametermidx : 0,
          completeboost = sym.tags.filter(t => t === term).length * 0.5;
        rel = rel - avg - namesub + completeboost;
        // if (rel > 0) console.log(rel, avg, namesub + completeboost, res.map(r => r.i).join(" + "));
        // else console.log("ignore")
        return [
          id,
          {
            n: sym.name,
            s: sym.symbol,
            // relevance is calculated by the number occurrences of the term
            // minus the mean number of characters before it
            // plus 2 if the name has it
            r: rel,
            t: res.map(t => t.t).filter(t => t),
          },
        ];
      })
      .filter(x => x),
  ];
  const mostRelevant = maxFiniteRelevance(all);

  const maxrel = mostRelevant ? mostRelevant[1].r : 0;
  // console.log("max is", mostRelevant, maxrel);

  const minrel = all.length > 10 ? maxrel - 5 : -Infinity;
  // console.log("minimum rel to show is", minrel);

  const norm = [],
    favs = [];
  let more = 0;
  for (const entry of all) {
    // console.log(entry, "has rel", entry?.[1]?.r);

    if (!entry) continue;
    if (entry[1].r < minrel) {
      more++;
      continue;
    }
    if (favourites.isFav(entry[0])) {
      favs.push(entry);
    } else norm.push(entry);
  }
  // sort descending by relevance
  favs.sort(relComparer);
  norm.sort(relComparer);
  for (const entry of favs) {
    createResult(entry[0], entry[1], term, true);
  }
  for (const entry of norm) {
    createResult(entry[0], entry[1], term, false);
  }
  if (more > 0) {
    const p = document.createElement("div");
    p.classList.add("search-item");
    p.textContent = "And " + more + " more...";

    list.append(p);
  }
}
const relComparer = ([, a], [, b]) => b.r - a.r;
function createResult(id, sym, term, fav) {
  const p = document.createElement("div");
  p.classList.add("search-item");

  // expander
  const expander = document.createElement("a");
  expander.classList.add("search-item-expand", "unf");
  expander.textContent = "👁";
  expander.href = "./viewer.html#" + id;
  expander.title = "Open in Large Viewer";

  // copy indicator
  const copier = document.createElement("button");
  copier.classList.add("search-item-copy");
  copier.textContent = "📋";
  copier.title = "Copy to Clipboard";
  p.addEventListener("click", () => {
    copy(sym.s);
    copier.textContent = "✔️";
    copier.title = "Copied to Clipboard";
  });

  // copier.append(cimg);

  // name of the symbol
  const nameplate = document.createElement("span");
  nameplate.classList.add("search-item-name");
  nameplate.textContent = sym.n;

  // symbol itself
  const symdis = document.createElement("span");
  symdis.classList.add("search-item-symbol");
  symdis.textContent = sym.s;

  // create bit that shows you what matched your query
  const resulttag = document.createElement("span");
  resulttag.classList.add("search-item-tags");
  if (sym.t.length > 0) {
    resulttag.append(document.createTextNode("("));

    sym.t.forEach((t, i, a) => {
      const result = document.createElement("span");
      result.classList.add("search-item-tag");
      // // console.log("highlighting tag " + t);
      const divided = t.split(term).flatMap((v, i, a) => (i !== a.length - 1 ? [v, term] : [v]));
      // // console.log("split to ",divided);
      for (const part of divided) {
        // // console.log(`appending '${part}' (${part === term ? "is term" : "is not term"})`);

        const u = document.createElement("span");
        u.classList.add(part === term ? "search-item-tag-term" : "search-item-tag-irrelevant");
        u.textContent = part;

        result.append(u);
      }
      resulttag.append(result);
      if (i !== a.length - 1) resulttag.append(document.createTextNode(", "));
    });
    resulttag.append(document.createTextNode(")"));
  }
  // relevance
  // const relevance = document.createElement("span");
  // relevance.classList.add("search-item-relevance");
  // relevance.textContent = sym.r;
  // p.append(relevance);

  const sep = document.createElement("span");
  sep.classList.add("search-item-sep");

  const csep = document.createElement("span");
  csep.classList.add("search-item-fav-sep");

  p.append(copier, csep, symdis, nameplate, resulttag, sep);

  if (sym.r === Infinity) {
    const star = document.createElement("span");
    star.classList.add("search-item-perfect-match");
    star.textContent = "✔";
    star.title = "Perfect Match";
    p.append(star);
  }

  const fsep = document.createElement("span");
  fsep.classList.add("search-item-fav-sep");

  const fstar = document.createElement("span");
  fstar.classList.add("search-item-favourite");
  if (fav) {
    fstar.textContent = "★";
    fstar.title = "Remove from Favourites";
    fstar.onclick = () => {
      favourites.unfav(id);
      fstar.textContent = "☆";
      update();
    };
  } else {
    fstar.textContent = "☆";
    fstar.title = "Add as Favourite";
    fstar.onclick = () => {
      favourites.fav(id);
      fstar.textContent = "★";
      update();
    };
  }

  p.append(expander, fsep, fstar);

  list.appendChild(p);
}
/**@param {[,{r: number}][]} stuff  */
function maxFiniteRelevance(stuff) {
  let max = -Infinity,
    chosen = null;
  for (const item of stuff) {
    if (!item?.[1]) continue;
    // console.log(item);
    const rel = item[1].r;
    if (rel > max && Number.isFinite(rel)) {
      max = rel;
      chosen = item;
    }
  }
  return chosen;
}
function copy(thing) {
  navigator.clipboard.writeText(thing);
}
