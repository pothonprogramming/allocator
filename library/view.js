////////////////
// ABOUT VIEW //
////////////////
// This utility allows you to easily create typed views into a contiguous block of memory.

// Reserves an aligned byte offset for a view and advances the cursor accordingly.
const View_reserve = (cursor, bytes, length) => {
    const byteOffset = cursor.byteOffset = (cursor.byteOffset + bytes - 1) & ~(bytes - 1);
    cursor.byteOffset += bytes * length;
    return byteOffset;
};

///////////////////////
// Set Value Methods //
///////////////////////

// Not sure if I should provide helpers to set values in 2d or 3d views

///////////////////////////
// View Creation Methods //
///////////////////////////

// The cursor tracks the byte offset of the latest view you create.
const View_createCursor = (buffer, byteOffset) => ({ buffer, byteOffset });

// Create specific typed views.

const View_createF32 = (cursor, length) => {
    return new Float32Array(cursor.buffer, View_reserve(cursor, 4, length), length);
};

const View_createU32 = (cursor, length) => {
    return new Uint32Array(cursor.buffer, View_reserve(cursor, 4, length), length);
};

const View_createU8 = (cursor, length) => {
    return new Uint32Array(cursor.buffer, View_reserve(cursor, 1, length), length);
};

/*
//////////////////
// ABOUT BUFFER //
//////////////////
// A utility that helps with the creation of typed views into a byte buffer.
// It requires the creation of a "cursor" object that acts as an offset tracker when creating each typed view.
// Typed views will be automatically aligned and the cursor will be automatically moved to prepare for the next view creation.

const Buffer = {
    // Byte stride values for each primitive type:
    // It might be better to just hard code these, but at least there's no guessing what these are for.
    float32ByteStride: 4,
    uint32ByteStride: 4,

    // The cursor object stores a reference to the buffer and the byte offset in the buffer at which to start tracking.
    // Adding the buffer reference keeps each cursor object tied to a specific buffer, so there is no accidental mismatch if multiple buffers are being used.
    createCursor: (buffer, byteOffset) => ({ buffer, byteOffset }),

    // Helper methods to remove some of the tedious construction:
    // * Intentionally specialized by type to allow for quick runtime operation.

    createF32View: (cursor, length) => new Float32Array(cursor.buffer, Buffer.getAlignedMovedByteOffset(cursor, Buffer.float32ByteStride, length), length),
    createU32View: (cursor, length) => new Uint32Array(cursor.buffer, Buffer.getAlignedMovedByteOffset(cursor, Buffer.uint32ByteStride, length), length),

    // Returns the aligned byte offset value, moved to the next address that is aligned with the byteAlignment boundary if necessary.
    getAlignedByteOffset: (byteOffset, byteAlignment) => (byteOffset + byteAlignment - 1) & ~(byteAlignment - 1),
    // Returns the moved byte offset value without ensuring alignment.
    getMovedByteOffset: (byteOffset, byteStride, length) => byteOffset + byteStride * length,

    // A helper method for the helper methods.
    getAlignedMovedByteOffset: (cursor, byteStride, length) => {
        const alignedByteOffset = Buffer.getAlignedByteOffset(cursor.byteOffset, byteStride); // Get the aligned offset of the cursor.
        cursor.byteOffset = Buffer.getMovedByteOffset(alignedByteOffset, byteStride, length); // Move the cursor.
        return alignedByteOffset;
    },

    // Helper methods to set single or multiple values in a typed view:
    // These methods are intentionally specialized (as bulky and boring as they may be) to allow for quick runtime operation.

    setF32: (f32View, index, value) => { f32View[index] = value; },
    setF32_2: (f32View, index, value1, value2) => {
        f32View[index] = value1;
        f32View[index + 1] = value2;
    },
    setU32: (u32View, index, value) => { u32View[index] = value; },
    setU32_2: (u32View, index, value1, value2) => {
        u32View[index] = value1;
        u32View[index + 1] = value2;
    }
};
*/