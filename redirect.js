const sym = new URLSearchParams(window.location.search).get("symbol");
if (sym) {
  console.log("redirect to viewer");
  window.location.href = `./viewer.html?symbol=${sym.replace("web+sym:", "")}`;
}
