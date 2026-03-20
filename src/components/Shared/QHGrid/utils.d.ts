import type { FetchAsyncFunc } from './types';
export declare const sortCollator: Intl.Collator;
export declare function nullsSortLast(a: string | number | null | undefined, b: string | number | null | undefined): number;
type DebouncedFunc<T extends Function> = T & {
    clear: () => void;
};
export declare function debounce<T extends Function>(func: T, time?: number): DebouncedFunc<T>;
export declare function toCSSVariable(value: string): string;
export declare function isCancel(error: unknown): boolean;
export declare const fetchBasic: FetchAsyncFunc;
declare const _ignoreValue: unique symbol;
type IgnoreValue = typeof _ignoreValue;
/**
 * A sentinel value to indicate that a result should be excluded from the final result.
 *
 * This works on {@link groupToMap}, {@link keyByMap}, {@link setBy}, {@link filterMap}, and {@link iteratorFilterMap} to indicate that the value should be ignored
 */
export declare const zIgnore: IgnoreValue;
type FunctionOrProperty<T> = keyof T | ((value: T) => unknown);
type ReturnOrPropertyType<V, T> = V extends (value: T) => unknown ? Exclude<ReturnType<V>, IgnoreValue> : V extends keyof T ? T[V] : never;
/**
 * Turn an iterable into a Map, grouping by the iteratee, with the value based on valueIteratee
 * the Map's values will be an array of all values that have the same key
 * If the key or value is {@link zIgnore}, it will be filtered out
 * @param list any iterable
 * @param iteratee A property or function to use to get the key for the Map
 * @param valueIteratee A property of function to use to get the value that will be stored in the Map
 * @returns A Map with the keys and value arrays based on the iteratee and valueIteratee
 * @example
 * ```ts
 * import { groupToMap, zIgnore } from 'zDash';
 * const array = [
 *  { id: 1, value: 'hi' },
 * { id: 2, value: 'meow' },
 * { id: 3, value: 'hi' },
 * { id: 4, value: 'grr' },
 * ];
 * const map = groupToMap(array, 'id'); //=> Map<number, { id: number, value: string }[]>
 * //=> Map(4) { 1 => [ { id: 1, value: 'hi' } ], 2 => [ { id: 2, value: 'meow' } ], 3 => [ { id: 3, value: 'hi' } ], 4 => [ { id: 4, value: 'grr' } ] }
 * const map2 = groupToMap(array, 'value', 'id'); //=> Map<string, number[]>
 * //=> Map(3) { 'hi' => [ 1, 3 ], 'meow' => [ 2 ], 'grr' => [ 4 ] }
 * const map3 = groupToMap(array, (v) => v.value, (v) => `${v.id}:${v.value}`); //=> Map<string, string[]>
 * //=> Map(3) { 'hi' => [ '1:hi', '3:hi' ], 'meow' => [ '2:meow' ], 'grr' => [ '4:grr' ] }
 * const map = groupToMap(array, ({id})=> id > 2 ? id : zIgnore, 'value'); //=> Map<number, string[]>
 * //=> Map(2) { 3 => [ 'hi' ], 4 => [ 'grr' ] }
 * ```
 */
export declare function groupToMap<T, K extends FunctionOrProperty<T>, V extends FunctionOrProperty<T> = (value: T) => T>(list: Iterable<T> | undefined | null, iteratee: K, valueIteratee?: V): Map<ReturnOrPropertyType<K, T>, ReturnOrPropertyType<V, T>[]>;
/**
 * Turn an iterable into a Map, grouping by the iteratee, with the value based on valueIteratee
 * The Map's values will be the last value that had the same key
 * If the key or value is {@link zIgnore}, it will be filtered out
 * @param list any iterable
 * @param iteratee A property or function to use to get the key for the Map
 * @param valueIteratee A property of function to use to get the value that will be stored in the Map
 * @returns A Map with the keys and values based on the iteratee and valueIteratee
 * @example
 * ```ts
 *  import { keyByMap, zIgnore } from 'zDash';
 *  const array = [
 *    { id: 1, value: 'hi' },
 *    { id: 2, value: 'meow' },
 *    { id: 3, value: 'hi' },
 *    { id: 4, value: 'grr' },
 *  ];
 * const map = keyByMap(array, 'id'); //=> Map<number, { id: number, value: string }>
 * //=> Map(4) { 1 => { id: 1, value: 'hi' }, 2 => { id: 2, value: 'meow' }, 3 => { id: 3, value: 'hi' }, 4 => { id: 4, value: 'grr' } }
 * const map2 = keyByMap(array, 'value', 'id'); //=> Map<string, number>
 * //=> Map(3) { 'hi' => 3, 'meow' => 2, 'grr' => 4 }
 * const map3 = keyByMap(array, (v) => v.value, (v) => `${v.id}:${v.value}`); //=> Map<string, string>
 * //=> Map(3) { 'hi' => '3:hi', 'meow' => '2:meow', 'grr' => '4:grr' }
 * const map = keyByMap(array, ({id})=> id > 2 ? id : zIgnore, 'value'); //=> Map<number, string>
 * //=> Map(2) { 3 => 'hi', 4 => 'grr' }
 * ```
 */
export declare function keyByMap<T, K extends FunctionOrProperty<T>, V extends FunctionOrProperty<T> = (value: T) => T>(list: Iterable<T> | undefined | null, iteratee: K, valueIteratee?: V): Map<ReturnOrPropertyType<K, T>, ReturnOrPropertyType<V, T>>;
export {};
