///////////////
// PARTICLES //
///////////////
// Utility methods for managing Particles, which are composed of several component pools.

// Particle Methods

function Particles_add(positions, vectors, colors, countView, limit, px, py, vx, vy, color) {
    const index = countView[0];
    if (index >= limit) return;

    const indexX = index * 2;
    const indexY = indexX + 1;

    positions[indexX] = px;
    positions[indexY] = py;
    vectors[indexX] = vx;
    vectors[indexY] = vy;
    colors[index] = color;

    countView[0]++;
};
function Particles_remove(positions, vectors, colors, countView, index) {
    const lastIndex = countView[0] - 1;
    if (index > lastIndex) return;
    if (index !== lastIndex) {
        const indexX = index * 2;
        const indexY = indexX + 1;
        const lastIndexX = lastIndex * 2;
        const lastIndexY = lastIndexX + 1;

        positions[indexX] = positions[lastIndexX];
        positions[indexY] = positions[lastIndexY];
        vectors[indexX] = vectors[lastIndexX];
        vectors[indexY] = vectors[lastIndexY];
        colors[index] = colors[lastIndex];
    }
    // If index === lastIndex, then decrement count
    countView[0]--;
};