import { settings } from "./settings.js";

const container = document.getElementById("container"),
  unsavedCount = document.getElementById("changes"),
  saveBar = document.getElementById("save"),
  saveBtn = document.getElementById("save-btn");
let unsaved = new Map();

for (const [id, set] of settings) {
  const sdcon = document.createElement("div");
  sdcon.classList.add("setting-container", "col", "stretch-h");

  const scon = document.createElement("div");
  scon.classList.add("row", "stretch-h");

  const name = document.createElement("span");
  name.classList.add("setting-name", "auto");
  name.textContent = id
    .replaceAll(".", ": ")
    .replaceAll("-", " ")
    .replaceAll(/\b[a-z]/g, t => t.toUpperCase());
  name.title = id;

  const sep = document.createElement("span");
  sep.classList.add("stretch");

  const rs = document.createElement("button");
  rs.classList.add("setting-button");
  rs.textContent = "⟳";
  rs.title = "Reset to Default";
  rs.onclick = () => {
    updateSaveStatus(set, id, set.default);
    updateUnsavedBanner();
    si.value = set.value;
    si.checked = !!set.value;
  };

  scon.append(name, sep, rs);

  const si = document.createElement("input");
  si.classList.add("setting-input");
  si.value = set.value;
  switch (set.type) {
    case "string":
      si.type = "text";
      si.placeholder = "(empty string)"
      si.onchange = () => {
        updateSaveStatus(set, id, si.value);
        updateUnsavedBanner();
      };
      scon.append(si);
      break;
    case "string[]":
      si.type = "text";
      si.placeholder = "(no elements)"
      si.onchange = () => {
        updateSaveStatus(set, id, str2arr(si.value));
        updateUnsavedBanner();
      };
      scon.append(si);
      break;
    case "number":
      si.type = "number";
      si.onchange = () => {
        updateSaveStatus(set, id, +si.value || 0);
        updateUnsavedBanner();
      };
      scon.append(si);
      break;
    case "bigint":
      si.type = "number";
      si.onchange = () => {
        updateSaveStatus(set, id, BigInt(si.value));
        updateUnsavedBanner();
      };
      scon.append(si);
      break;
    case "boolean":
      si.type = "checkbox";
      si.checked = set.value;

      si.classList.remove("setting-input");
      si.onchange = () => {
        updateSaveStatus(set, id, si.checked);
        updateUnsavedBanner();
      };

      const lbl = document.createElement("label");
      lbl.classList.add("switch");
      lbl.classList.add("setting-input");
      const sl = document.createElement("span");
      sl.classList.add("slider", "round");
      lbl.append(si, sl);
      scon.append(lbl);
      break;
    default:
      console.warn(`Unsupported setting type: ${set.type}`);
      const nsup = document.createElement("span");
      nsup.classList.add("setting-name");
      nsup.textContent = "Not supported";
      scon.append(nsup);
      break;
  }

  const desc = document.createElement("div");
  desc.classList.add("row", "stretch-h", "setting-desc-line", "hide");

  const dsep = document.createElement("span");
  dsep.classList.add("stretch");
  const dsep2 = document.createElement("span");
  dsep2.classList.add("stretch");

  const dtxt = document.createElement("span");
  dtxt.classList.add("setting-desc");
  dtxt.textContent = set.desc;

  const dtyp = document.createElement("span");
  dtyp.classList.add("setting-type", "auto");
  dtyp.textContent = set.type;

  desc.append(dtyp, dtxt, dsep2);

  const exp = document.createElement("button");
  exp.classList.add("setting-button");
  exp.textContent = "ⓘ";

  exp.onclick = () => desc.classList.toggle("hide");
  scon.prepend(exp);

  sdcon.append(scon, desc);

  container.append(sdcon);
}

function updateSaveStatus(setting, id, newV) {
  if (!unsaved.has(id) && !eq(newV, setting.value)) unsaved.set(id, setting.value);
  else if (eq(unsaved.get(id), newV)) unsaved.delete(id);
  setting.set(newV);
}

function updateUnsavedBanner() {
  if (unsaved.size > 0) {
    unsavedCount.textContent = unsaved.size + " unsaved change" + (unsaved.size > 1 ? "s" : "");
    saveBar.title = [...unsaved]
      .map(x => {
        const n = settings.get(x[0]);
        return Array.isArray(x[1]) ? `${x[0]}: (${x[1].length})[${x[1]}] -> (${n.length})[${n}]` : `${x[0]}: ${x[1]} -> ${n}`;
      })
      .join("\n");
    saveBar.style.display = "flex";
  } else {
    saveBar.style.display = "none";
  }
}
/** @param {string} str  */
function str2arr(str) {
  if (!str) return [];
  return str.split(",").map(x => x.trim());
}
function eq(a, b) {
  if (Array.isArray(a)) {
    if (Array.isArray(b)) {
      const l = a.length;
      if (l !== b.length) return false;
      for (let i = 0; i < l; i++) {
        if (!eq(a[i], b[i])) return false;
      }
      return true;
    }
    return false;
  }
  return a === b;
}
saveBtn.onclick = () => {
  unsaved.clear();
  settings.save();
  updateUnsavedBanner();
};
