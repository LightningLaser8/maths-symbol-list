// IMPORTANT: All values must be serialisable to JSON.
const defaults = [
  // search opts
  ["search.exclusions", "Comma-separated symbol IDs to be excluded from searches.", [], "string[]"],
  ["search.excluded-groups", "Comma-separated group IDs to have their content excluded from searches.", [], "string[]"],
  ["search.relevance-range", "Maximum relevance lower than the highest relevance present in the results to still show. Basically, bigger number means more results. Set to -1 to disable this limit.", 5],
  ["search.max-results", "Maximum number of results to show. Set to -1 to disable this limit.", -1],
  // match stuff
  ["match.exact-name", "Shows symbols whose name exactly matches your search at the top.", true], //
  ["match.exact-tags", "Shows symbols which have a tag exactly matching your search at the top.", true],
  ["match.exact-id", "Shows symbols whose internal ID exactly matches your search at the top.", false],
  // feature toggles
  [
    "feature.favourites",
    "Enable favourites - the ability to select symbols to show above all others in search results, regardless of relevance. Adds a toggle for favourite status to each search result.",
    true,
  ],
  [
    "feature.viewer",
    "Enable the Symbol Viewer - a page with a zoomed-in view of one symbol, with lists of related symbols below it. Adds links to this page to each search result.",
    true,
  ],
  // favourites
  ["favourites.hide-others", "Only show favourites in search results, even if none match.", false],
];

class Setting {
  /** @type {string} */
  #name;
  /** @type {string} */
  #desc;
  #default;
  #current;
  /** @type {string} */
  #type;
  [Symbol.toStringTag]() {
    return "Setting";
  }
  /** Current value. @readonly */
  get value() {
    return this.#current;
  }
  /** Default value. @readonly */
  get default() {
    return this.#default;
  }
  /** Description of the setting. @readonly */
  get desc() {
    return this.#desc;
  }
  /** Whether or not the current value is the default value. @readonly */
  get changed() {
    return this.#current !== this.#default;
  }
  /** Returns a string value representing the type of this setting. @readonly @type {string}*/
  get type() {
    return this.#type;
  }
  /** Returns a string value representing the type of each element of this setting. Only effective for array settings. @readonly @type {string}*/
  get elementType() {
    return this.#type.replace(/\[\]$/, "");
  }
  /** Returns a string value representing the type of `v`. Respects object types, and single-type arrays. @readonly @param {string} [hint="*"] Default type for zero-length arrays. */
  static typeof(v, hint = "*") {
    return (
      typeof v === "object" ?
        Array.isArray(v) ?
          this.#arraytype(v, hint) + "[]"
        : v.constructor.name
      : typeof v
    );
  }
  static #arraytype(a, hint = "*") {
    if (a.length === 0) return hint;
    const itype = this.typeof(a[0]);
    if (a.every(v => this.typeof(v) === itype)) return itype;
    return "*";
  }
  constructor(name, desc, def, type) {
    this.#name = name;
    this.#desc = desc;
    this.#default = this.#current = def;
    this.#type = type ?? Setting.typeof(this.#default);
  }
  /** Returns true if this setting supports having `v` assigned to it. */
  supports(v) {
    return Setting.typeof(v, this.elementType) === this.#type;
  }
  set(v) {
    if (this.supports(v)) this.#current = v;
    else console.warn(`Incompatible types for '${this.#name}': ${Setting.typeof(v, this.elementType)} (wanted ${this.#type})`);
  }
  reset() {
    this.#current = this.#default;
  }
  toString() {
    return JSON.stringify(this.#current);
  }
}
/** @type {Map<string, Setting>} */
const sets = new Map(
  defaults.map(x => {
    x[1] = new Setting(x[0], x[1], x[2], x[3]);
    delete x[2];
    delete x[3];
    return x;
  }),
);
export const settings = {
  get(s) {
    const setting = sets.get(s);
    if (setting) {
      return setting.value;
    } else {
      console.warn(`Setting '${s}' not recognised.`);
      return null;
    }
  },
  set(s, value) {
    const setting = sets.get(s);
    if (setting) {
      setting.set(value);
      this.save();
    } else console.warn(`Setting '${s}' not recognised.`);
  },
  reset(s) {
    if (s !== undefined) {
      const setting = sets.get(s);
      if (setting) {
        setting.reset();
        this.save();
      } else console.warn(`Setting '${s}' not recognised.`);
    } else {
      sets.forEach(v => v.reset());
      this.save();
    }
  },
  load() {
    const str = localStorage.getItem("msls");
    if (str) {
      for (const entry of str.split("|")) {
        const [set, value] = entry.split("=", 2);
        this.set(set, JSON.parse(value));
      }
      this.save();
    }
  },
  save() {
    const str = [
      ...sets
        .entries()
        .map(sv => (sv[1].changed ? sv.join("=") : undefined))
        .filter(x => x),
    ].join("|");
    localStorage.setItem("msls", str);
  },
  *[Symbol.iterator]() {
    yield* sets;
  },
};
settings.load();
// console.log(favourites.all);

globalThis.s = settings;
globalThis.st = sets;
