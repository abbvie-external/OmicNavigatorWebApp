import { ReactNode, Ref, RefObject } from 'react';
import { BaseGrouping, FilterValues, InnerColumnConfig, ObjectLiteral, RowClickHandler, RowLevelPropsCalc, RowLevelStyleCalc, SharedQHGridProps } from './types';
type fetchData = () => void;
export interface QHGridRef<Data extends ObjectLiteral, ATI> {
    /**
     * A reference to the scroll-body div that wraps the table
     */
    bodyRef: Ref<HTMLDivElement>;
    /**
     * The full data set, after sorting and filtering
     *
     * In a network grid, this will be the same as slicedData
     */
    data: Data[];
    /**
     * The current page's data
     */
    slicedData: Data[];
    /**
     * Exports the current data to an excel file with the given name
     * @param name The name of the file
     * @returns
     */
    exportExcel: (name?: string) => Promise<void>;
    /**
     * The props that were passed in to the grid
     */
    props: QHGridProps<Data, ATI>;
    /**
     * Returns sortedData
     * @deprecated
     */
    getSortedData: () => Data[];
}
export interface QHGridProps<Data extends ObjectLiteral, ATI> extends SharedQHGridProps<Data, ATI> {
    /**
     * class name to apply to the root element
     */
    className?: string;
    columns: InnerColumnConfig<Data, ATI>[];
    data: Data[];
    filters: FilterValues;
    /**
     * Called after the data is filtered with the new filteredData
     */
    onFiltered?: (data: Data[]) => void;
    sortBy: string | null;
    sortOrder: 'asc' | 'desc' | null;
    onSort?: (colId: string) => void;
    /**
     * Called after the filtered data is sorted with the new sortedData
     */
    onSorted?: (data: Data[]) => void;
    grouping: BaseGrouping[];
    onGroupChange?: (grouping: BaseGrouping[]) => void;
    generalSearch: string;
    generalSearchDebounceTime?: number;
    onGeneralSearch?: (value: string) => void;
    isPaginated?: boolean;
    totalRows?: number;
    loading?: boolean;
    loadingMessage?: ReactNode;
    additionalTemplateInfo: ATI;
    rowLevelStyleCalc?: RowLevelStyleCalc<Data>;
    /**
     * A function that allows you to take the item and index and return props that should be applied to the row
     */
    rowLevelPropsCalc?: RowLevelPropsCalc<Data>;
    onRowClick?: RowClickHandler<Data>;
    onReloadData?: fetchData;
    getExportData?: () => Promise<Data[]> | Data[];
    emptyMessage?: string | ReactNode;
    extraHeaderItem?: ReactNode;
    columnsConfig: InnerColumnConfig<Data, ATI>[];
    itemsPerPage: number;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    height?: string;
    activePage: number;
    onPageChange: (activePage: number) => void;
    onColumnVisibilityToggle?: (colId: string) => void;
    onColumnReorder?: (curIdx: number, newIdx: number) => void;
    onFilterUpdate?: (field: string, type: any) => (value: any) => void;
    qhGridRef?: RefObject<QHGridRef<Data, ATI> | null>;
}
export declare function QHGrid<Data extends ObjectLiteral, ATI>(allProps: QHGridProps<Data, ATI>): import("react/jsx-runtime").JSX.Element;
export {};
