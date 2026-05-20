///////////////////////
// ABOUT SimpleModel //
///////////////////////
// * This is the most basic way (that I could think of) to store state in a contiguous buffer.
// It is tightly coupled with application logic, inflexible, yet efficient.

const SimpleModel = (() => {
    ///////////////
    // Variables //
    ///////////////

    const BACKGROUND_COLOR = 0x00000000;

    const DISPLAY_WIDTH = 256;
    const DISPLAY_HEIGHT = 256;
    const DISPLAY_PIXEL_COUNT = DISPLAY_WIDTH * DISPLAY_HEIGHT;
    const DISPLAY_PIXELS = new Uint32Array(DISPLAY_PIXEL_COUNT);

    // Buffers
    const STATE_BUFFER = new ArrayBuffer(20004);

    // Cursors used to build views
    const STATE_CURSOR = Layout_createCursor(0); // Cursor used to build views

    const PARTICLE_LIMIT = 1000;
    const PARTICLE_COUNT = Layout_createU32View(STATE_BUFFER, STATE_CURSOR, 1);
    const PARTICLE_POSITIONS = Layout_createF32View(STATE_BUFFER, STATE_CURSOR, 2 * PARTICLE_LIMIT);
    const PARTICLE_VECTORS = Layout_createF32View(STATE_BUFFER, STATE_CURSOR, 2 * PARTICLE_LIMIT);
    const PARTICLE_COLORS = Layout_createU32View(STATE_BUFFER, STATE_CURSOR, PARTICLE_LIMIT);

    const mouse = Mouse.create(0, 0);

    let randomSeed = 0;
    let randomIndex = 0;
    const gravity = 0.005;
    const friction = 0.999;

    let circleColor = 0x000000;
    let circleRadiusSquared = 5 * 5;
    let circleX = PureMath.floor(DISPLAY_WIDTH * 0.5);
    let circleY = PureMath.floor(DISPLAY_HEIGHT * 0.75);

    ////////////////////////
    // Internal Functions //
    ////////////////////////

    function Particles_collideInnerRectangle(positions, vectors, count, rectangle_left, rectangle_top, rectangle_right, rectangle_bottom) {
        const length2 = count * 2;
        for (let xIndex = 0, yIndex = 1; xIndex < length2; xIndex += 2, yIndex += 2) {
            if (positions[xIndex] < rectangle_left) {
                positions[xIndex] = rectangle_left;
                vectors[xIndex] *= -1;
            } else if (positions[xIndex] >= rectangle_right) {
                positions[xIndex] = rectangle_right - 1;
                vectors[xIndex] *= -1;
            }
            if (positions[yIndex] < rectangle_top) {
                positions[yIndex] = rectangle_top;
                vectors[yIndex] *= -1;
            } else if (positions[yIndex] >= rectangle_bottom) {
                positions[yIndex] = rectangle_bottom - 1;
                vectors[yIndex] *= -1;
            }
        }
    };

    function Particles_force(positions, vectors, count, x, y) {
        for (let yIndex = count * 2 - 1, xIndex = yIndex - 1; xIndex > 0; xIndex -= 2, yIndex -= 2) {
            const distanceX = positions[xIndex] - x;
            const distanceY = positions[yIndex] - y;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            const forceX = (distanceX * 0.25) / distanceSquared;
            const forceY = (distanceY * 0.25) / distanceSquared;
            vectors[xIndex] += forceX;
            vectors[yIndex] += forceY
        }
    };

    const Particles_move = (positions, vectors, count, gravity, friction) => {
        const length2 = count * 2;
        for (let index = 0; index < length2; index += 2) {

            const x = index;
            const y = x + 1;

            positions[x] += vectors[x];
            positions[y] += vectors[y];
            vectors[x] *= friction;
            vectors[y] = vectors[y] * friction + gravity;
        }
    };

    function consume() {
        circleColor = 0x000000;
        const length2 = PARTICLE_COUNT[0] * 2;
        for (let index2 = 0; index2 < length2; index2 += 2) {
            const distanceX = circleX - PARTICLE_POSITIONS[index2];
            const distanceY = circleY - PARTICLE_POSITIONS[index2 + 1];
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            if (distanceSquared < circleRadiusSquared) {
                //console.log(circleRadiusSquared);
                const index1 = index2 * 0.5;
                circleColor = PARTICLE_COLORS[index1];
                circleRadiusSquared += 1 / PureMath_Pi;
                Particles_remove(PARTICLE_POSITIONS, PARTICLE_VECTORS, PARTICLE_COLORS, PARTICLE_COUNT, index1);
            }
        }
    }

    // A deterministic, stateless random function. Pass in the seed and index to get the same "random" value every time.
    // Generate the seed from system time at startup. Reuse it and track index for stateful random results or recalculate it for stateless results.
    function randomU32(seed, index) {
        let x = seed ^ index;
        x ^= x >>> 16;
        x = PureMath.integer32Multiply(x, 0x7feb352d);
        x ^= x >>> 15;
        x = PureMath.integer32Multiply(x, 0x846ca68b);
        x ^= x >>> 16;
        return x >>> 0;
    }

    function randomRangeU32(seed, index, lowValue, highValue) {
        const range = (highValue - lowValue + 1) >>> 0;
        return lowValue + ((randomU32(seed, index) * range) * PureMath_inverseU32 | 0);
    }

    function randomRangeF32(seed, index, lowValue, highValue) {
        return lowValue + randomU32(seed, index) * PureMath_inverseU32 * (highValue - lowValue);
    }

    function randomColor(seed, index, lowBlue, highBlue, lowGreen, highGreen, lowRed, highRed) {
        const b = randomRangeU32(seed, index, lowBlue, highBlue) & 0xff;
        const g = randomRangeU32(seed, index + 1, lowGreen, highGreen) & 0xff;
        const r = randomRangeU32(seed, index + 2, lowRed, highRed) & 0xff;

        return (0xff << 24) | (b << 16) | (g << 8) | r;
    }

    /////////////////////
    // Exposed Methods //
    /////////////////////

    return {
        getDisplayHeight: () => DISPLAY_HEIGHT,
        getDisplayWidth: () => DISPLAY_WIDTH,
        getDisplayPixelCount: () => DISPLAY_PIXEL_COUNT,
        getDisplayPixels: () => DISPLAY_PIXELS,

        initialize(seed) {
            randomSeed = seed;
            for (var i = 0; i < PARTICLE_LIMIT; i++) {
                const px = randomRangeU32(randomSeed, randomIndex++, 0, DISPLAY_WIDTH);
                const py = randomRangeU32(randomSeed, randomIndex++, 0, DISPLAY_HEIGHT);
                const vx = randomRangeF32(randomSeed, randomIndex++, 0, 1) - 0.5;
                const vy = randomRangeF32(randomSeed, randomIndex++, 0, 1) - 0.5;
                const color = randomColor(randomSeed, randomIndex++, 128, 192, 128, 192, 128, 192);
                Particles_add(PARTICLE_POSITIONS, PARTICLE_VECTORS, PARTICLE_COLORS, PARTICLE_COUNT, PARTICLE_LIMIT, px, py, vx, vy, color);
            }
            console.log("particle count: " + PARTICLE_COUNT[0]);
        },

        render() {
            if (circleColor) {
                const circleRadius = PureMath.approximateSquareRoot(circleRadiusSquared);
                // Testing to see how far off the approximate version is. It's not too bad!
                //console.log("diff: " + (circleRadius - Math.sqrt(circleRadiusSquared)));
                Raster.fillCircle(DISPLAY_PIXELS, DISPLAY_WIDTH, circleX, circleY, circleRadius, circleColor);
            }
            Raster.fillTransparentAxisAlignedRectangle(DISPLAY_PIXELS, DISPLAY_WIDTH, 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, BACKGROUND_COLOR);

            for (let index1 = 0, index2 = 0; index1 < PARTICLE_COUNT[0]; index1++, index2 += 2) {
                Raster.fillAxisAlignedRectangle(DISPLAY_PIXELS, DISPLAY_WIDTH, PureMath.floor(PARTICLE_POSITIONS[index2]), PureMath.floor(PARTICLE_POSITIONS[index2 + 1]), 1, 1, PARTICLE_COLORS[index1]);
            }

            return true;
        },

        update(platformTimeStamp) {
            Particles_force(PARTICLE_POSITIONS, PARTICLE_VECTORS, PARTICLE_COUNT[0], mouse.x, mouse.y);
            Particles_move(PARTICLE_POSITIONS, PARTICLE_VECTORS, PARTICLE_COUNT[0], gravity, friction);
            Particles_collideInnerRectangle(PARTICLE_POSITIONS, PARTICLE_VECTORS, PARTICLE_COUNT[0], 0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT);
            consume();
            return true;
        },

        // Mouse Input

        setMousePosition(x, y) {
            Mouse.setPosition(mouse, x, y);
        },
        setMouseLeft(isDown) {
            Mouse.setLeft(mouse, isDown);
        },
        setMouseRight(isDown) {
            Mouse.setRight(mouse, isDown);
        }

    };

})();