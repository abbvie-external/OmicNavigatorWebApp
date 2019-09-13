export function formatNumberForDisplay(num) {
  if (num) {
    if (!isNaN(num)) {
      const number = Math.abs(num);
      if (number < 0.001 || number >= 1000) {
        return num.toExponential(2);
        // * If a number is < .001 report this value scientific notation with three significant digits
        // * If a number is >= 1000, switch to scientific notation with three sig digits.

        // } else if (number < 1 && number >= 0.001) {
        //   return num.toPrecision(3);
        // * If a number is < 1 & >= .001, report this value with three decimal places
        // PN - what's left is >=1 and <1000, guess that goes to 3 digits too
      } else {
        return num.toPrecision(3);
      }
    } else return num;
  } else return null;
}

export function splitValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    const numberOfSemicolons = (value.match(/;/g) || []).length;
    return numberOfSemicolons > 0
      ? `${firstValue}...(${numberOfSemicolons})`
      : firstValue;
  }
}
