import React, { useState, useEffect, useRef } from 'react';
function clamp(x, lower = -Infinity, upper = Infinity) {
  return Math.min(upper, Math.max(lower, x));
}
function absClamp(x, lower = 0, upper = Infinity) {
  return (
    Math.sign(x) *
    Math.min(Math.abs(upper), Math.max(Math.abs(lower), Math.abs(x)))
  );
}
export default function Component({
  onChange,
  min,
  max,
  defaultValue,
  value,
  preventNegatives,
  disabled,
}) {
  const [numberProps] = useExponentialInput({
    defaultValue,
    min,
    max,
    onChange,
    value,
    preventNegatives,
  });

  return (
    <input
      className="NumericExponentialInput"
      {...numberProps}
      disabled={disabled}
      spellCheck={false}
    />
  );
}

const useExponentialInput = ({
  onChange,
  min,
  max,
  value: propValue,
  defaultValue,
  preventNegatives,
}) => {
  const [power, setPower] = useState(() => {
    return +(propValue || defaultValue || 0).toExponential(0).split('e')[1];
  });
  const [base, setBase] = useState(() => {
    return +(propValue || defaultValue || 0).toExponential(0).split('e')[0];
  });
  const value = `${base}E${power}`;
  const numberValue = preventNegatives
    ? Math.abs(clamp(+value, min, max))
    : clamp(+value, min, max);
  useEffect(() => {
    if (propValue == null) {
      return;
    }
    const [base, power] = propValue.toExponential(0).split('e');
    setBase(+base);
    setPower(+power);
  }, [propValue]);

  const [fakeValue, setFakeValue] = useState(null);
  const isStepRef = useRef(true);
  const handleChange = evt => {
    isStepRef.current = evt.nativeEvent.data === undefined;
    let val = evt.currentTarget.value;
    if (isStepRef.current) {
      const originalSign = Math.sign(base) * 1;
      // Is a step
      const curVal = numberValue;
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
        Math.abs(newValue) <= Math.abs(max || Infinity) &&
        Math.abs(newValue) >= Math.abs(min || 0)
      ) {
        setPower(newPower);
        setBase(preventNegatives ? Math.abs(newBase) : newBase);
        setFakeValue(null);
        return;
      }
    } else {
      // Is typed manually
      if (!Number.isNaN(+val)) {
        const newVal = absClamp(+val, min, max);
        const [base, power] = newVal.toExponential(0).split('e');
        setBase(+base);
        setPower(+power);
      }
      setFakeValue(val);
    }
  };
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  useEffect(() => {
    if (onChangeRef.current && !Number.isNaN(+fakeValue)) {
      if (isStepRef.current) {
        onChangeRef.current(numberValue);
      } else {
        const newValue = absClamp(+fakeValue, min, max);
        if (preventNegatives) {
          onChangeRef.current(Math.abs(newValue));
        } else {
          onChangeRef.current(newValue);
        }
      }
    }
  }, [numberValue, fakeValue, min, max, preventNegatives]);
  return [
    {
      onChange: handleChange,
      value:
        fakeValue ??
        (Math.abs(numberValue) < 1e-3
          ? numberValue.toExponential(0)
          : numberValue.toPrecision(1)),
      step: Number.MAX_VALUE,
      type: 'number',
    },
    { power, base, numberValue },
  ];
};
