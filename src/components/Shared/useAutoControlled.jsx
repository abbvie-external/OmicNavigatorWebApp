import { useEffect, useState, useRef, useCallback } from 'react';
/* eslint-disable no-unused-expressions */
/**
 * @template Value
 * @typedef {(newState: Value)=>void} ChangeHandler
 */

/**
 * @template Value
 * @typedef UseAutoControlledOptions
 * @property {Value | undefined} value
 * Controlled value as passed down from the props!
 * @property {Value | undefined} defaultValue
 * the defaultValue prop passed from the parent - Only used when uncontrolled
 * @property {Value | undefined} initialValue
 * The value if a default value was not passed from the parent! - Only used when uncontrolled and defaultValue is undefined
 * @property {ChangeHandler<Value>} onChange
 * props.onChange passed in from parent (allows useAutoControlled to update the parent state as well)
 */

// useAutoControlled<string>({value: value},  onChange(newVal: string) => {Combobox.setInputValue(newVal)}} )

/**
 * @template Value
 * Returns a stateful value, and a function to update it. Mimics the `useState()` React Hook
 * signature.
 * @param {UseAutoControlledOptions<Value>} options - Set up the state from parent/inital
 * @param {undefined | ChangeHandler<Value>} onValueChange - onChange handler for when value changes
 * @returns {[Value, ChangeHandler<Value>]}
 */
export function useAutoControlled(options, onValueChange) {
  const [stateValue, setStateValue] = useState(
    options.defaultValue === undefined
      ? options.initialValue
      : options.defaultValue,
  );

  const hasValue = options.value !== undefined;
  const value = options.value === undefined ? stateValue : options.value;
  // Used to avoid dependencies in "setValue"
  const valueRef = useRef(value);
  const parentOnChangeRef = useRef(options.onChange);
  useEffect(() => {
    parentOnChangeRef.current = options.onChange;
  }, [options.onChange]);

  const onValueChangeRef = useRef(onValueChange);
  useEffect(() => {
    onValueChangeRef.current = onValueChange;
  }, [onValueChange]);

  useEffect(() => {
    if (options.value !== undefined) {
      onValueChangeRef.current?.(options.value);
    }
  }, [options.value]);

  const setValue = useCallback(
    /**
     * @type {ChangeHandler<Value>}
     */
    newState => {
      parentOnChangeRef.current?.(newState);
      if (!hasValue) {
        valueRef.current = newState;
        setStateValue(valueRef.current);
      }
      onValueChangeRef.current?.(newState);
    },
    [hasValue],
  );

  return [value, setValue];
}
