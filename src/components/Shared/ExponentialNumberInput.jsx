import React, { useEffect, useState } from 'react';
import { useAutoControlled } from './useAutoControlled';

/**
 *
 * @param {number} x
 */
function absClamp(x, lower = 0, upper = Infinity) {
  return (
    Math.sign(x) *
    Math.min(Math.abs(upper), Math.max(Math.abs(lower), Math.abs(x)))
  );
}
/**
 *
 * @param {number} number
 */
const toFormattedNumber = number =>
  Math.abs(number) < 1e-3 ? number.toExponential(0) : number.toPrecision(1);

/**
 *
 * @typedef UseExponentialInputOptions
 * @property {(newState: number)=> void} onChange
 * A handler that's called with the new number
 * @property {number| undefined} min
 * The absolute value of the min allowed (default 0)
 * @property {number| undefined} max
 * The absolute value of the max allowed (default Infinity)
 * @property {number} value
 * The value if you use it as a controlled hook
 * @property {number} defaultValue
 * The default value in case you don't want to set the state yourself.
 * @property {boolean} preventNegatives
 * Prevent the user from manually changing the sign to a negative number
 * @property {boolean} coerceNumber
 * Should manual input get coerced to the correct format?
 * - i.e. 2.353 -> 2, 0.345 -> 0.3
 */

/**
 *
 * @param {UseExponentialInputOptions} param0
 *
 * @returns {[React.HTMLAttributes<HTMLInputElement>,number,(newState: number)=>void]}
 */
export const useExponentialInput = ({
  onChange,
  min = 0,
  max = Infinity,
  value: propValue,
  defaultValue,
  preventNegatives,
  coerceNumber,
}) => {
  const [value, setValue] = useAutoControlled({
    value: propValue,
    defaultValue: defaultValue,
    onChange,
    initialValue: 0,
  });
  const [inputValue, setInputValue] = useState(`${value}`);
  useEffect(() => {
    if (coerceNumber) {
      return setInputValue(toFormattedNumber(value));
    }
    if (value === +value.toExponential(0)) {
      return setInputValue(toFormattedNumber(value));
    }
    return setInputValue(value);
  }, [value, coerceNumber, min, max]);

  const handleChange = evt => {
    const isStep = evt.nativeEvent.data === undefined;
    let val = evt.currentTarget.value;
    if (isStep) {
      const [base, power] = value
        .toExponential(0)
        .split('e')
        .map(Number);
      const originalSign = Math.sign(base) * 1;
      // Is a step
      const curVal = value;
      let sign = val > curVal ? 1 : -1;
      let newBase = base + sign;
      let newPower = power;
      if (
        (originalSign === 1 && newBase <= 0) ||
        (originalSign === -1 && newBase >= 0)
      ) {
        newBase = originalSign * 9;
        newPower = power - 1;
      } else if (
        (originalSign === 1 && newBase >= 10) ||
        (originalSign === -1 && newBase <= -10)
      ) {
        newBase = originalSign * 1;
        newPower = power + 1;
      }
      const newValue = +`${newBase}E${newPower}`;
      if (
        Math.abs(newValue) <= Math.abs(max) &&
        Math.abs(newValue) >= Math.abs(min)
      ) {
        setValue(newValue);
        return;
      }
    } else {
      // Is typed manually
      setInputValue(val);
    }
  };
  const updateValueFromInput = () => {
    const newValue = +inputValue;
    if (!Number.isNaN(newValue)) {
      const clamped = absClamp(
        preventNegatives ? Math.abs(newValue) : newValue,
        min,
        max,
      );
      if (newValue !== clamped || coerceNumber) {
        setInputValue(`${toFormattedNumber(clamped)}`);
      }
      if (coerceNumber) {
        setValue(+clamped.toExponential(0));
      } else {
        setValue(clamped);
      }
    }
  };
  /**
   *
   * @param {React.KeyboardEvent<HTMLInputElement>} event
   */
  const onKeyDown = event => {
    if (
      // Enter so it'll happen before a form is submitted
      event.key === 'Enter' ||
      // Up/Down so it'll happen before the change event is called!
      event.key === 'ArrowDown' ||
      event.key === 'ArrowUp'
    ) {
      updateValueFromInput();
    }
  };
  return [
    {
      onChange: handleChange,
      onBlur: updateValueFromInput,
      onKeyDown,
      value: inputValue,
      step: Number.MAX_VALUE,
      type: 'number',
    },
    value,
    setValue,
  ];
};

/**
 * Just a basic component using the hook for convenience's sake
 * @param {UseExponentialInputOptions & Omit<React.HTMLAttributes<HTMLInputElement>, keyof UseExponentialInputOptions>} param0
 */
export function ExponentialNumberInput({
  onChange,
  min,
  max,
  defaultValue,
  value,
  preventNegatives,
  coerceNumber,
  ...props
}) {
  const [inputProps] = useExponentialInput({
    defaultValue,
    min,
    max,
    onChange,
    value,
    preventNegatives,
    coerceNumber,
  });

  return <input {...props} {...inputProps} />;
}
