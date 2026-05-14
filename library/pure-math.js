// Some basic Math methods

const PureMath_inverseU32 = 0.00000000023283064365386962890625; // 1 / 4294967296 // This probably is too long
const PureMath_Pi = 3.14159265358979323846;

const PureMath = {

    approximateSquareRoot(value) {

        if (value <= 0) return 0;

        // Best initial guess: Math.pow(2, Math.floor(Math.log2(value)) * 0.5);
        // Not using this approach because pow and log2 are going to be slower than while scaling if I write them.
        // Also, it would be nice if these methods were self contained.

        let scaleFactor = 1;
        let scaledValue = value;

        // Scale value into [0.5, 2)
        while (scaledValue > 2) {
            scaledValue *= 0.25;
            scaleFactor *= 2;
        }
        while (scaledValue < 0.5) {
            scaledValue *= 4;
            scaleFactor *= 0.5;
        }

        // Newton refinement
        let x = scaledValue;
        x = 0.5 * (x + scaledValue / x);
        x = 0.5 * (x + scaledValue / x);
        x = 0.5 * (x + scaledValue / x);
        x = 0.5 * (x + scaledValue / x);

        return scaleFactor * x;

    },

    ceiling(value) {
        const integer = value | 0;
        return value > integer ? integer + 1 : integer;
    },
    floor(value) {
        const integer = value | 0;
        return value < integer ? integer - 1 : integer;
    },
    integer32Multiply(a, b) {
        const aHigh = (a >>> 16) & 0xffff;
        const aLow = a & 0xffff;
        const bHigh = (b >>> 16) & 0xffff;
        const bLow = b & 0xffff;
        return (aLow * bLow + (((aHigh * bLow + aLow * bHigh) & 0xffff) << 16)) | 0;
    }
};