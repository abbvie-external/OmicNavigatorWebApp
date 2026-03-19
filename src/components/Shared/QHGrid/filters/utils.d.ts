import { FilterValue } from '../FilterTypeConfig';
import { MFBaseProps } from '../types';
export declare function getAccessorValue(opt: FilterValue, accessor: MFBaseProps['accessor']): any;
export declare enum Comparisons {
    equals = "=",
    notEquals = "!=",
    greaterOrEqual = ">=",
    greater = ">",
    lessOrEqual = "<=",
    less = "<",
    null = "null",
    notNull = "!null",
    contains = "contains",
    notContains = "!contains",
    starts = "starts",
    ends = "ends",
    empty = "empty",
    notEmpty = "!empty"
}
export declare enum Combinations {
    and = "&&",
    or = "||"
}
export interface AlphanumericOpt {
    comparison: Comparisons;
    combination: Combinations;
    value: string;
}
export interface AlphanumericComparison {
    text: string;
    value: Comparisons;
}
export declare const alphanumericComparisons: AlphanumericComparison[];
export declare const numericComparisons: AlphanumericComparison[];
