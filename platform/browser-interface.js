/////////////////////////////
// ABOUT BROWSER INTERFACE //
/////////////////////////////
// * All browser specific code should go here.
// This is essentially the "glue" layer that connects the more generic application code to the browser platform.
(() => {
  const OUTPUT = document.createElement("p");
  document.body.append(OUTPUT);

  OUTPUT.innerText = "Hello";

  Allocator.initialize()
})()