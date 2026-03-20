import { MutableRefObject } from 'react';
/**
 * A `React Ref` that keeps track of the passed `value`.
 * https://github.com/reakit/reakit/blob/next/packages/reakit-utils/src/useLiveRef.ts
 */
export declare function useLiveRef<T>(value: T): MutableRefObject<T>;
