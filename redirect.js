const sym = new URLSearchParams(window.location.search).get("sym");
if (sym) {
  console.log("redirect to viewer");
  window.location.href = `./viewer.html?sym=${sym.replace("web+sym:", "")}`;
}
