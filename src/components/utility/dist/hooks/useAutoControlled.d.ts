import { Dispatch, SetStateAction } from 'react';
declare type UseAutoControlledOptions<Value> = {
    defaultValue: Value | undefined;
    value: Value | undefined;
    initialValue?: Value;
};
/**
 * Returns a stateful value, and a function to update it. Mimics the `useState()` React Hook
 * signature.
 * https://github.com/microsoft/fluentui/blob/master/packages/fluentui/react-bindings/src/hooks/useAutoControlled.ts
 */
export declare const useAutoControlled: <Value>(options: UseAutoControlledOptions<Value>) => [Value, Dispatch<SetStateAction<Value>>];
export {};
