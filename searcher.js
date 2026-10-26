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
  [...symbols.entries()]
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
      return rel > 0 ?
          [
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
          ]
        : undefined;
    })
    .filter(x => x)
    .sort(([, a], [, b]) => b.r - a.r) // sort descending by relevance
    .forEach(([id, sym]) => {
      const p = document.createElement("div");
      p.classList.add("search-item");

      // expander
      const expander = document.createElement("a");
      expander.classList.add("search-item-expand", "unf");
      expander.textContent = "👁";
      expander.href = "viewer.html#" + id;
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
        star.textContent = "★";
        star.title = "Perfect Match";
        p.append(star);
      }

      const fsep = document.createElement("span");
      fsep.classList.add("search-item-fav-sep");

      p.append(expander, fsep, );

      list.appendChild(p);
    });
}
/**@param {*[]} stuff  */
function maxidx(stuff) {
  let m = -Infinity,
    id = -1;
  stuff.forEach((v, i) => {
    if (v > m) {
      m = v;
      id = i;
    }
  });
  return { max: m, index: id };
}
function copy(thing) {
  navigator.clipboard.writeText(thing);
}
