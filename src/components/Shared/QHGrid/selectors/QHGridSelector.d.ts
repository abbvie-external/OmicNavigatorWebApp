import { ReactNode } from 'react';
import { Get, IfAny, Paths } from 'type-fest';
import { ColumnConfig, ObjectLiteral } from '../types';
export declare function getTemplate(column: any): any;
export declare function getExportTemplate<Data extends ObjectLiteral, ATI>(column: ColumnConfig<Data, ATI>): ColumnConfig<Data, ATI>['exportTemplate'] | undefined;
export declare function getValueFromPath<Data extends ObjectLiteral, Path extends Paths<Data>>(item: Data, path: Path): Path extends string ? Get<Data, Path> : Data[Path];
export declare const looseGetValueFromPath: (data: any, field: any) => any;
export declare function getFieldValue<Data extends ObjectLiteral, ATI>(item: Data, field: ColumnConfig<Data, ATI>['field'], type?: ColumnConfig<Data, ATI>['type']): Data[keyof Data] | any;
export declare function getField<Data extends ObjectLiteral, ATI>(field: ColumnConfig<Data, ATI>['field']): import("type-fest/source/paths")._Paths<Data, {
    maxRecursionDepth: 10;
    bracketNotation: false;
    leavesOnly: false;
    depth: number;
}>;
export declare const typeMap: Record<string, {
    accessor?: (item: any, field: keyof typeof item) => any;
    sortAccessor?: (item: any, field: keyof typeof item) => any;
    groupAccessor?: (item: any, field: keyof typeof item) => any;
    exportTemplate?: (value: any) => string | number;
    template?: (value: any) => ReactNode;
}>;
export declare function getFieldGroupValueFunction<Data extends ObjectLiteral>(field: ColumnConfig<Data, never>['field'], type: ColumnConfig<Data, never>['type']): (item: Data) => string;
export declare function getFieldSortValueFunction<Data extends ObjectLiteral>(field: ColumnConfig<Data, never>['field'], type: ColumnConfig<Data, never>['type']): (item: Data) => number | string;
export declare function ensureArray<T>(value: T): IfAny<T, T[], [
    T
] extends [null] | [undefined] ? never[] : T extends null | undefined ? never : T extends unknown[] | readonly unknown[] ? T : NonNullable<T>[]>;
