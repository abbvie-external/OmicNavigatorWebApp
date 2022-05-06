import React, { ReactNode } from 'react';
import { MFBaseProps, RMFBaseProps } from 'types';
export declare function getAccessorValue(opt: string, accessor: MFBaseProps['accessor']): any;
export interface MFProps<T> extends MFBaseProps {
    selectedOpts?: string[];
    data: T[];
    field: string;
    onChange: (opts?: string[]) => void;
    accessor: any;
    trigger: ReactNode;
}
export declare function MultiFilterDropdown<T>({ selectedOpts, data, field, onChange, accessor, trigger, ...props }: MFProps<T>): JSX.Element;
export interface RMFProps<T> extends RMFBaseProps {
    selectedOpts?: string[];
    data: T[];
    field: string;
    onChange: (opts?: string[]) => void;
    trigger: ReactNode;
}
export declare function RemoteMultiFilterDropdown<T>({ selectedOpts, data, field, onChange, accessor, trigger, useLocal, ...props }: RMFProps<T>): JSX.Element;
export interface DateFilterOpts {
    startDate: string;
    endDate: string;
}
export interface DateFilterProps {
    onChange: (opts?: DateFilterOpts) => void;
    selectedOpts?: DateFilterOpts;
    trigger?: Node;
}
export declare const DateFilterDropdown: React.FunctionComponent<DateFilterProps>;
declare enum Comparisons {
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
declare enum Combinations {
    and = "&&",
    or = "||"
}
export interface AlphanumericOpt {
    comparison: Comparisons;
    combination: Combinations;
    value: string;
}
export interface AlphanumericFilterProps {
    onChange: (opts?: AlphanumericOpt[]) => void;
    selectedOpts: AlphanumericOpt[];
    trigger: Node;
}
export declare const NumericFilterPopup: React.NamedExoticComponent<AlphanumericFilterProps>;
export declare const AlphanumericFilterPopup: React.FC<AlphanumericFilterProps>;
export {};
