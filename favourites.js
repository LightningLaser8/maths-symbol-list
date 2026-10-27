export const favourites = {
  /** @type {Set<string>} */
  all: new Set(),
  isFav(id) {
    return this.all.has(id);
  },
  fav(id) {
    this.all.add(id);
    this.save();
  },
  unfav(id) {
    this.all.delete(id);
    this.save();
  },
  load() {
    const str = localStorage.getItem("favs");
    if (!str) this.all = new Set();
    else this.all = new Set(str.split("|"));
  },
  save() {
    const str = [...this.all].join("|");
    localStorage.setItem("favs", str);
  },
};
favourites.load();
// console.log(favourites.all);
