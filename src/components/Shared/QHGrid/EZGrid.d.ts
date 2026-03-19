import { CSSProperties, Component, MouseEvent, ReactNode, RefObject } from 'react';
import { QHGridProps, QHGridRef } from './QHGrid';
import type { ColumnConfig, FilterValues, InnerColumnConfig, ObjectLiteral, QuickView, QuickViewsConfig, RowLevelPropsCalc, SharedEZGridDataProps, SharedEZGridProps, SharedQHGridProps, View, ViewState } from './types';
export interface EZGridProps<Data extends ObjectLiteral = ObjectLiteral, ATI = unknown> extends SharedEZGridProps, SharedEZGridDataProps<Data, ATI>, SharedQHGridProps<Data, ATI> {
    /**
     * class name to apply to the root element of the Grid
     */
    className?: string;
    /**
     * The configuration for the columns. Uses render prop functions to render custom content
     * Each Column requires a field (and possibly id). You can also choose which type of filtering are needed here
     */
    columnsConfig: ColumnConfig<Data, ATI>[];
    /**
     * The number items to display at once.
     * Can be 5,10,15,30,45,60,75,100,250,500,1000
     */
    itemsPerPage?: 5 | 10 | 15 | 30 | 45 | 60 | 75 | 100 | 250 | 500 | 1000;
    /**
     * Called whenever the itemsPerPage changes
     */
    onItemsPerPageChange?: (itemsPerPage: number) => void;
    /**
     * Called after the data is filtered with the new filteredData
     */
    onFiltered?: QHGridProps<Data, ATI>['onFiltered'];
    /**
     * Called after the filtered data is sorted with the new sortedData
     */
    onSorted?: QHGridProps<Data, ATI>['onSorted'];
    /**
     * Tells the grid to show the loading dimmer and prevent user interaction before the data is loaded
     * @default false
     */
    loading?: boolean;
    /**
     * The message to display when the component is loading
     */
    loadingMessage?: ReactNode;
    /**
     * A function that allows you to take the item and index and return styles that should be applied to each row.
     * It uses React Styles (object)
     * @deprecated Use `rowLevelPropsCalc` instead
     */
    rowLevelStyleCalc?: (item: Data, index: number) => CSSProperties;
    /**
     * A function that allows you to take the item and index and return props that should be applied to the row
     */
    rowLevelPropsCalc?: RowLevelPropsCalc<Data>;
    /**
     * This is called whenever a row is clicked on. Allows you to perform operations like selecting rows
     */
    onRowClick?: (event: MouseEvent, itemData: Data, index: number) => void;
    /**
     * A function that fetches the data and enables a refresh data button in the bottom right corner.
     */
    fetchData?: () => void;
    /**
     * A collection of views that are easily switched between. There are options to make them user-addable as well as remotely stored through a service and database. Setting this enables basic quick views. Quick Views work by changing the current setting of the grid to their view. They don't lock the grid to that view, however.
     */
    quickViews?: QuickViewsConfig;
    /**
     * The Id with which to store the quickViews either locally or remotely. Setting this enables custom quick views.
     */
    quickViewsId?: string;
    /**
     * The URL to use to GET quickViews/ PUT the updated quick views
     */
    quickViewsURL?: string;
    /**
     * The Id to use to save the quick views to the database using
     */
    ownerId?: string;
    /**
     * A react Node to render within a popup to show when hovering over a Legend button. Setting this shows the Legend Button in the Header
     * @deprecated Use {@link extraHeaderItem} instead
     */
    legend?: ReactNode;
    /**
     * A react Node to render in the Header. Can use Fragments to render many extra things in the Header
     */
    extraHeaderItem?: ReactNode;
    /**
     * The message to display when the data is empty and the component isn't loading
     */
    emptyMessage?: string | ReactNode;
    /**
     * The amount of time to debounce the general search. Defaults to 500ms. 0ms means don't debounce.
     */
    generalSearchDebounceTime?: number;
    /**
     * If set to true, removes the general search component from the grid tool bar.
     */
    disableGeneralSearch?: boolean;
    /**
     * If set to true, disables the grouping functionality of the grid and removes the column drop zone.
     */
    disableGrouping?: boolean;
    /**
     * If set to true, disables the column sorting functionality
     */
    disableSort?: boolean;
    /**
     * If set to true, removes the column toggle button from the tool bar and disables the ability to toggle column disableColumnVisibilityToggle
     */
    disableColumnVisibilityToggle?: boolean;
    /**
     * If set to true, disables the ability to reorder columns by clicking and dragging the column headers
     */
    disableColumnReorder?: boolean;
    /**
     * If set to true, disables the ability to filter on all columns
     */
    disableFilters?: boolean;
    /**
     * If set to true, disables the ability to create and edit quick views
     */
    disableQuickViewEditing?: boolean;
    /**
     * If set to true, hides the quick view menu from sight preventing users from interacting with it
     */
    disableQuickViewMenu?: boolean;
    /**
     * A function that the grid will call when encountering an error.
     * The function should have a single argument of type string which will be the error message provided by the grid
     */
    showError?: (message: string) => void;
    /**
     * The ID of the quick view to show. Makes the quick view controlled.
     * Prevents nonprogramtic changing of the quick view (this is useful for cases where you might want some other part of the app to control the current QV).
     */
    quickView?: string;
    /**
     * The ID of the default quick view to show upon first displaying the grid
     */
    defaultQuickView?: string;
    /**
     * A function to handle quick view changes. Will let you control which quick view is showing if you use the quickView prop.
     */
    onQuickViewChange?: (quickView: string, config: QuickView) => void;
    /**
     * An optional way to add a share button if you want to generate a link to the quick view.
     * It's only really useful with the quickViewURL and controlled quickviews, as you would be able to generate a link with the ownerId and quickView such that anyone can open it and see their quick views.
     * disableQuickViewEditing is also good for this.
     */
    onQuickViewShare?: (quickView: string, config: QuickView) => void;
    /**
     * A unique key used to store the current state of the grid, so the state of the grid is remembered when navigating away and back to the grid (in memory rather than session storage)
     */
    uniqueCacheKey?: string;
    /**
     * The height you want the grid to have. Defaults to '70vh'
     */
    height?: string;
}
export interface EZGridState<Data extends ObjectLiteral, ATI> extends ViewState<Data, ATI> {
    columnsConfig: InnerColumnConfig<Data, ATI>[];
}
export default class EZGrid<Data extends ObjectLiteral, ATI = unknown> extends Component<EZGridProps<Data, ATI>, EZGridState<Data, ATI>> {
    state: EZGridState<Data, ATI>;
    qhGridRef: RefObject<QHGridRef<Data, ATI> | null>;
    static defaultProps: {
        showError: () => void;
        itemsPerPage: number;
    };
    componentDidMount: () => void;
    componentDidUpdate: (prevProps: EZGridProps<Data, ATI>, prevState: EZGridState<Data, ATI>) => void;
    setFilters: (newFilters: FilterValues) => void;
    setSort: (sortBy: string, sortOrder: "asc" | "desc") => void;
    handleGeneralSearch: QHGridProps<Data, ATI>['onGeneralSearch'];
    handleGroupChange: QHGridProps<Data, ATI>['onGroupChange'];
    handleSort: (field: string) => void;
    handleColumnVisibilityToggle: (colId: string) => void;
    handleColumnReorder: (curIdx: number, newIdx: number) => void;
    handleFilterUpdate: QHGridProps<Data, ATI>['onFilterUpdate'];
    handleItemsPerPageChange: QHGridProps<Data, ATI>['onItemsPerPageChange'];
    handlePageChange: QHGridProps<Data, ATI>['onPageChange'];
    getView: () => View;
    handleQuickViewChange: (quickView: QuickView) => void;
    render(): import("react/jsx-runtime").JSX.Element;
}
