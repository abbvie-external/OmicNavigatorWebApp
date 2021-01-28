/// <reference types="react" />
import { ColumnConfig } from 'types';
export declare function getTemplate(column: any): any;
export declare function getExportTemplate<T, ATI>(column: ColumnConfig<T, ATI>): ColumnConfig<T, ATI>['exportTemplate'] | undefined;
export declare function getFieldValue<T, ATI>(item: T, field: ColumnConfig<T, ATI>['field'], type?: ColumnConfig<T, ATI>['type']): T[keyof T] | any;
export declare function getField<T, ATI>(field: ColumnConfig<T, ATI>['field']): keyof T;
export declare const typeMap: Record<string, {
    accessor?: (item: any, field: keyof typeof item) => any;
    sortAccessor?: (item: any, field: keyof typeof item) => any;
    groupAccessor?: (item: any, field: keyof typeof item) => any;
    exportTemplate?: (value: any) => string | number;
    template?: (value: any) => React.ReactNode;
}>;
export declare function getFieldGroupValueFunction<T>(field: ColumnConfig<T, never>['field'], type: ColumnConfig<T, never>['type']): (item: T) => string;
export declare function getFieldSortValueFunction<T>(field: ColumnConfig<T, never>['field'], type: ColumnConfig<T, never>['type']): (item: T) => number | string;
