//////////////////
// ABOUT LAYOUT //
//////////////////
// This utility allows you to easily create typed views into a contiguous block of memory.

const Layout_align = (offset, bytes) => (offset + bytes - 1) & ~(bytes - 1);
const Layout_move = (offset, bytes, length) => offset + (bytes * length);

// The cursor tracks the byte offset of the latest view you create.
// This method exists to help with passing byteOffset to the reserve method.
const Layout_createCursor = (byteOffset) => ({ byteOffset });

// Reserves an aligned byte offset for a view and advances the cursor accordingly.
const Layout_reserve = (cursor, bytes, length) => {
    const byteOffset = Layout_align(cursor.byteOffset, bytes);
    cursor.byteOffset = Layout_move(byteOffset, bytes, length);
    return byteOffset;
};

//////////////////////////////////
// View Creation Helper Methods //
//////////////////////////////////
// Create specific typed views.

const Layout_createF32View = (buffer, cursor, length) => new Float32Array(buffer, Layout_reserve(cursor, 4, length), length);

const Layout_createU32View = (buffer, cursor, length) => new Uint32Array(buffer, Layout_reserve(cursor, 4, length), length);

const Layout_createU8View = (buffer, cursor, length) => new Uint8Array(buffer, Layout_reserve(cursor, 1, length), length);