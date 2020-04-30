/**
 * Giving a number i.e. 22342 returns 22.342 string.
 * @param number Number to be transformed.
 */
function numberToDecimalAsString(number) {
    let result = '';
    let count = 0;

    for (var i = number.length; i > 0; i--) {
        result = number[i - 1] + result;
        count++;

        if (count === 3 && i > 1) {
            result = '.' + result;
            count = 0;
        }
    }

    return result;
}

/**
 * Giving a fraction and a total number, it will return its percentage.
 */
function calculatePercentage(fraction, total) {
    return ((fraction / total) * 100).toFixed(2).replace('.', ',')
}

/**
 * Giving a thousand number, it will format to 1k format.
 * @param number 
 */
function kFormatter(number) {
    return Math.abs(number) > 999 ? Math.sign(number) * ((Math.abs(number) / 1000).toFixed(1)) + 'k' : Math.sign(number) * Math.abs(number)
}