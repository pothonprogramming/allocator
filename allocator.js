//***************/
// THINGS TO DO //
/****************/
// * Build a basic buffer with a header, metadata, and data.

//////////////////////
// ABOUNT ALLOCATOR //
//////////////////////
// This application is intended to showcase the Buffer utility.
const Allocator = (() => {

  const BYTE_LENGTH = 1000;
  const buffer = new ArrayBuffer(BYTE_LENGTH); // In C I would probably work with a uint32 array to ensure alignment.

  const metadata = new Uint32Array(buffer, 0, 2);
  const float32Data = new Float32Array(buffer, 4*2, 10);

  // * Even if a buffer is "self-describing", the application it is loaded into still needs to know how to read it.
  // There will always have to be some hard coded mechanism that allows you to interpret the data in the buffer.

  // Start with the easiest thing first. Track a range of numbers.

  // metadata = startIndex, endIndex
  // data = 10 numbers

  metadata[0] = 2;
  metadata[1] = 10 - 2;
  float32Data[0] = 1.1;
  float32Data[1] = 2.2;
  float32Data[2] = 3.3;

  // What range and type should my data be in? That's what the metadata should describe.


  return {
    initialize() {
      console.log("allocator initialized");
      console.log(metadata);
      console.log(float32Data);
    }
  }
})()