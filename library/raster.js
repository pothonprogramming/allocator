// Handy Rasterization methods:
// Color values are expected to be stored as AABBGGRR.

function Raster8_setValue2D(buffer, offset, stride, x, y, value) {
    buffer[offset + y * stride + x] = value;
};

const Raster = {
    fillCircle(pixels, raster_width, circle_x, circle_y, circle_radius, color) {
        const box_bottom = PureMath.ceiling(circle_y + circle_radius);
        const box_left = PureMath.floor(circle_x - circle_radius);
        const box_right = PureMath.ceiling(circle_x + circle_radius);
        const box_top = PureMath.floor(circle_y - circle_radius);

        const circleRadiusSquared = circle_radius * circle_radius;

        // Set up the first index and row step.
        let index = box_top * raster_width + box_left;
        const indexYStep = raster_width - box_right + box_left;

        // You could also break these loops into different quadrants and draw one quadrant at a time.
        // This would get rid of the pixelEdge branches, but it would also lead to a lot of duplicate code. Not sure which is better.
        for (let y = box_top; y < box_bottom; y++) {
            const pixelEdgeY = y < circle_y ? y + 1 : y; // Test the edge that has the least magnitude along the vector
            const vector_y = pixelEdgeY - circle_y;
            const vectorYSquared = vector_y * vector_y;
            for (let x = box_left; x < box_right; x++) {
                const pixelEdgeX = x < circle_x ? x + 1 : x; // Test the edge that has the least magnitude along the vector
                const vector_x = pixelEdgeX - circle_x;
                if (vector_x * vector_x + vectorYSquared < circleRadiusSquared) pixels[index] = color;
                index++;
            }
            index += indexYStep;
        }
    },
    fillAxisAlignedRectangle(raster_pixels, raster_width, rectangle_left, rectangle_top, rectangle_width, rectangle_height, color) {
        const bottom = PureMath.ceiling(rectangle_top + rectangle_height); // Expand edges to draw all pixels that overlap the rectangle
        const left = PureMath.floor(rectangle_left);
        const right = PureMath.ceiling(rectangle_left + rectangle_width);
        const top = PureMath.floor(rectangle_top);

        let index = top * raster_width + left;
        const indexYStep = raster_width - right + left;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                raster_pixels[index] = color;
                index++;
            }
            index += indexYStep;
        }
    },
    fillTransparentAxisAlignedRectangle(raster_pixels, raster_width, rectangle_left, rectangle_top, rectangle_width, rectangle_height, color) {
        const bottom = PureMath.ceiling(rectangle_top + rectangle_height); // Expand edges to draw all pixels that overlap the rectangle
        const left = PureMath.floor(rectangle_left);
        const right = PureMath.ceiling(rectangle_left + rectangle_width);
        const top = PureMath.floor(rectangle_top);

        let index = top * raster_width + left;
        const indexYStep = raster_width - right + left;

        const alpha = color >>> 24;
        const inverseAlpha = 255 - alpha;

        const colorBR = color & 0x00ff00ff;
        const colorAG = (color >>> 8) & 0x00ff00ff;

        for (let y = top; y < bottom; y++) {
            for (let x = left; x < right; x++) {
                const baseColor = raster_pixels[index];

                const baseColorBR = baseColor & 0x00ff00ff;
                const baseColorAG = (baseColor >> 8) & 0x00ff00ff;

                const br = (colorBR * alpha + baseColorBR * inverseAlpha) >>> 8;
                const ag = (colorAG * alpha + baseColorAG * inverseAlpha) >>> 8;

                raster_pixels[index] = ((ag << 8) & 0xff00ff00) | (br & 0x00ff00ff);

                index++;
            }
            index += indexYStep;
        }
    }
};