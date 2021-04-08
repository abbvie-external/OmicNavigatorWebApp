import React, { Ref, RefObject } from 'react';
import { BaseGrouping, FilterValues, InnerColumnConfig, RowLevelPropsCalc } from './types';
declare type rowLevelStyleCalc<T> = (item: T, index: number) => React.CSSProperties;
declare type onRowClick<T> = (event: React.MouseEvent, itemData: T, index: number) => void;
declare type fetchData = () => void;
export interface QHGridRef<T> {
    bodyRef: Ref<HTMLDivElement>;
    data: T[];
    sortedData: T[];
    slicedData: T[];
    exportExcel: (name?: string) => Promise<void>;
    props: QHGridProps<T, unknown>;
    /**
     * Returns sortedData
     * @deprecated
     */
    getSortedData: () => T[];
}
export interface QHGridProps<T, ATI> {
    columns: InnerColumnConfig<T, ATI>[];
    data: T[];
    filters: FilterValues;
    /**
     * Called after the data is filtered with the new filteredData
     */
    onFiltered?: (data: T[]) => void;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    onSort?: (colId: string) => void;
    /**
     * Called after the filtered data is sorted with the new sortedData
     */
    onSorted?: (data: T[]) => void;
    grouping: BaseGrouping[];
    onGroupChange?: (grouping: BaseGrouping[]) => void;
    generalSearch: string;
    generalSearchDebounceTime?: number;
    onGeneralSearch?: (value: string) => void;
    isPaginated?: boolean;
    totalRows?: number;
    loading?: boolean;
    loadingMessage?: React.ReactNode;
    additionalTemplateInfo: ATI;
    rowLevelStyleCalc?: rowLevelStyleCalc<T>;
    /**
     * A function that allows you to take the item and index and return props that should be applied to the row
     */
    rowLevelPropsCalc?: RowLevelPropsCalc<T>;
    onRowClick?: onRowClick<T>;
    onReloadData?: fetchData;
    exportBaseName?: string;
    getExportData?: () => Promise<T[]> | T[];
    emptyMessage?: string | React.ReactNode;
    extraHeaderItem?: React.ReactNode;
    columnsConfig: InnerColumnConfig<T, ATI>[];
    itemsPerPage: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    height?: string;
    activePage: number;
    onPageChange?: (activePage: number) => void;
    onColumnVisibilityToggle?: (colId: string) => void;
    onColumnReorder?: (curIdx: number, newIdx: number) => void;
    onFilterUpdate?: (field: string, type: any) => (value: any) => void;
    qhGridRef?: RefObject<QHGridRef<T>>;
}
export interface QHGridHeaderProps<T, ATI> {
    columns: InnerColumnConfig<T, ATI>[];
    onColumnVisibilityToggle?: QHGridProps<T, ATI>['onColumnVisibilityToggle'];
    grouping: BaseGrouping[];
    onGroupChange?: QHGridProps<T, ATI>['onGroupChange'];
    generalSearch: string;
    generalSearchDebounceTime?: number;
    onGeneralSearch?: QHGridProps<T, ATI>['onGeneralSearch'];
    extraHeaderItem?: QHGridProps<T, ATI>['extraHeaderItem'];
    loading?: boolean;
    exportBaseName?: string;
    onExportExcel: () => void;
}
export declare function QHGrid<T, ATI>({ loadingMessage, emptyMessage, height, generalSearchDebounceTime, grouping, ...props }: QHGridProps<T, ATI>): JSX.Element;
export {};
