//***************/
// THINGS TO DO //
/****************/
// * Build a basic buffer with a header, metadata, and data.

//////////////////////
// ABOUNT ALLOCATOR //
//////////////////////
// This application is intended to showcase the Buffer utility.
const Allocator = (() => {

  const HEADER_INDICES = {
    headerLength:0,
  }

  const BUFFER_LENGTH = 1000;
  const buffer = new Uint32Array(BUFFER_LENGTH);

  // * Even if a buffer is "self-describing", the application it is loaded into still needs to know how to read it.
  // There will always have to be some hard coded mechanism that allows you to interpret the data in the buffer.
 
  // A header can be used to describe the rest of the application's metadata.
  buffer[HEADER_INDICES.headerLength] = 1;


  return {
    initialize() {
      console.log("allocator initialized");
    }
  }
})()