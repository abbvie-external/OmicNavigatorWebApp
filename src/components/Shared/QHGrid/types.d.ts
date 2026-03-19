import { CSSProperties, DetailedHTMLProps, HTMLAttributes, MouseEvent, ReactNode } from 'react';
import { Get, Paths } from 'type-fest';
import type { FilterValue } from './FilterTypeConfig';
export type ObjectLiteral = {
    [key: string]: any;
};
export interface MFBaseProps {
    /**
     * When true, makes the Select All and Clear buttons clear the search
     */
    clearSearchOnSelectOrClearAll?: boolean;
    /**
     * This allows you to map the data to show as something that you want to display
     */
    accessor?: string | number | object | ((option: FilterValue) => ReactNode);
}
export interface RMFBaseProps {
    /**
     * If true, Makes the filter call the api when it's rendered.
     * Otherwise will wait until the filter is opened the first time
     */
    prefetch?: boolean;
    /**
     * The url that the filter will make a GET request to to get an array of strings
     * for the options
     */
    remoteUrl: string;
    /**
     * Parameters to send as part of the GET request (sent as query params)
     */
    remoteParams?: Record<string, string>;
    /**
     * Allows you to modify the request as desired on a one-off basis for convenience before it is sent out
     * either via the grid or via the `fetchAsync` function
     */
    remotePreRequest?: (request: Request) => Request;
    /**
     * Allows you to modify the response from the server to what it needs to be for the filter.
     * This is useful if the server returns a different format than what the filter expects
     * or if you want to do some extra processing on the data before it is used.
     */
    processData?: (remoteData: unknown) => Set<FilterValue>;
    /**
     * If true, makes the local data factor into the filter (rather than solely remote)
     */
    useLocal?: boolean;
    /**
     * When true, makes the Select All and Clear buttons clear the search
     */
    clearSearchOnSelectOrClearAll?: boolean;
    /**
     * This allows you to map the data to show as something that you want to display
     */
    accessor?: string | number | object | ((option: FilterValue) => ReactNode);
}
/** standard filter, lets you select values to show. (could be looked at as an autocomplete) */
type multiFilter = {
    type: 'multiFilter';
    props?: MFBaseProps;
};
type MultiFilterValue = string[];
/**  multiFilter but lets you query a service for the values */
type remoteMultiFilter = {
    props: RMFBaseProps;
    type: 'remoteMultiFilter';
};
/** A filter type that lets you filter by a date range */
type dateFilter = {
    type: 'dateFilter';
    props?: Record<string, unknown>;
};
type DateFilterValue = {
    startDate: string;
    endDate: string;
};
/** A filter type that lets you filter numbers easily. */
type numericFilter = {
    type: 'numericFilter';
    props?: Record<string, unknown>;
};
type NumericFilterValue = {
    combination: '&&' | '||';
    comparison: '=' | '!=' | '>=' | '>' | '<=' | '<' | 'null' | '!null';
    value: number;
}[];
/** A filter type that lets you filter strings easily. Uses comparisons rather than exact values*/
type alphanumericFilter = {
    type: 'alphanumericFilter';
    props?: Record<string, unknown>;
};
type AlphanumericFilterValue = {
    combination: '&&' | '||';
    comparison: '=' | '!=' | 'contains' | '!contains' | 'starts' | 'ends' | 'null' | '!null' | 'empty' | '!empty';
    value: string;
}[];
export type Accessor<Data extends ObjectLiteral, Path extends Paths<Data>> = (item: Data, field: Path) => any;
export type SortAccessor<Data extends ObjectLiteral, Path extends Paths<Data>> = (item: Data, field: Path) => number | string;
export type GroupAccessor<Data extends ObjectLiteral, Path extends Paths<Data>> = (item: Data, field: Path) => number | string;
export type ExportTemplate<Data extends ObjectLiteral, ATI, Path extends Paths<Data> = Paths<Data>> = (value: Get<Data, Path extends string ? Path : never>, item: Data, additionalTemplateInfo: ATI) => string | number;
export type Template<Data extends ObjectLiteral, ATI, Path extends Paths<Data> = Paths<Data>> = (value: Get<Data, Path extends string ? Path : never>, item: Data, additionalTemplateInfo: ATI) => ReactNode;
/**
 * Custom font icon config. Used to add custom icons to the quick view menu.
 * @see https://fonts.google.com/icons for a list of valid icons
 */
export interface IconConfig {
    /**
     * The icon to display. Render as a QIcon to render a QIcon, otherwise render whatever you need. If a string, it will be rendered as-is for things like emojis.
     *
     * It can also be a custom icon by using JSX. You will have to constrain the icon to fit 1em x 1em and make sure that it uses `currentColor` for the color.
     */
    iconName: ReactNode;
    /**
     * What to display in the list of icons. This must be unique as it is used to identify the icon.
     */
    label: string;
    /**
     * The previous labels (or icon-Names) of the icon. Used to help with backwards compatibility if you are removing/changing out icons, you can set them here
     * and this will check for those names for identifying which icon to use.
     *
     * If you want to switch an icon out, then you can set this to the old name and it will show the new icon.
     */
    previousValues?: string[];
}
export interface IconColorConfig {
    label: string;
    /**
     * A css value that will be used to color the icon.
     * If it starts with -- then it will be treated as a css variable.
     * Otherwise it'll be passed into style.color directly.
     */
    value: string;
    /**
     * The previous value of the color. Used to help with backwards compatibility.
     *
     * If you want to switch a color out, then you can set this to the old value and it will show the new color.
     */
    previousValues?: string[];
}
export interface BaseColumnConfig {
    /** Attributes to be passed into the `th` element for the column */
    headerAttributes?: HTMLAttributes<HTMLTableCellElement>;
    /** Styles to be passed into each columns <col /> tag within the colgroups. Allows for basic customization by column */
    columnStyle?: CSSProperties;
    /** Attributes to be passed into each `td` element in the column */
    cellAttributes?: HTMLAttributes<HTMLTableCellElement>;
    /** Unique identifier for the column. Optional - uses the field name as the default value. */
    id?: string;
    /** The title for use in the export. Useful if you use JSX in the main title field or need a different title in the excel */
    exportTitle?: string;
    /** Forces a column to be exported if X column is visible at the moment. Allows for exports to ensure that all relevant data is shown */
    exportIfVisible?: string;
    /** Option to hide column when exporting to excel */
    hideOnExport?: boolean;
    /** The name displayed in the column headers. */
    title: string;
    /** Option to hide a column by default */
    hidden?: boolean;
    /** Prevents the column from being sorted. Useful when the it makes no sense to sort by the column (i.e. an action column) */
    sortDisabled?: boolean;
    /** The standard type to use as a default for the column. by default can be one of:
        
    number - sets the sortAccessor and groupAccessor to make it sort and group correctly for numbers
    
    date - sets the accessor, sortAccessor, groupAccessor, exportTemplate, and template to a good default for dates in 'D/MMM/YYYY' format
    
    datetime - sets the same as date but in 'D/MMM/YYYY HH:mm:ss' format for times as well.
    */
    type?: 'number' | 'date' | 'datetime' | string;
    /** Tells the grid that the value made from unqiue columns is unique in the data. It is a possible optimization when the data is going to be re-sorted often. Almost certainly not necessary. */
    unique?: boolean;
}
export interface ColumnConfig<Data extends ObjectLiteral, ATI = unknown> extends BaseColumnConfig {
    /**
     * A function that allows you to customize what the exported values should look like for this column. Should return simple data types that will export properly.
     */
    exportTemplate?: (value: any, item: Data, additionalTemplateinfo: ATI) => any;
    /**
     * The entry in the data object that the column uses. Can be the key, or an object for better customization
     */
    field: {
        /** The key of the data object that the column uses */
        field: Paths<Data>;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this goes straight to the template functions (or the grid if there isn't a template function)
         */
        accessor?: Paths<Data> | object | Accessor<Data, Paths<Data>>;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this tells the grid how the sorting should work for the column
         */
        sortAccessor?: Paths<Data> | object | SortAccessor<Data, Paths<Data>>;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this tells the grid how the grouping should work for the column
         */
        groupAccessor?: Paths<Data> | object | GroupAccessor<Data, Paths<Data>>;
    } | Paths<Data>;
    /** Indicates that the column should be filterable */
    filterable?: multiFilter | remoteMultiFilter | dateFilter | numericFilter | alphanumericFilter;
    /** A template for the column that returns what should be displayed in the table's cell. Allows for deep/dynamic customization */
    template?: (value: any, item: Data, additionalTemplateinfo: ATI) => ReactNode;
}
export type InnerColumnConfig<Data extends ObjectLiteral, ATI> = ColumnConfig<Data, ATI> & {
    id: string;
    hidden: boolean;
};
export type SortOrder = 'asc' | 'desc';
export interface View {
    /**
     * The groupings. Currently must be present (empty array for no groupings)
     */
    grouping: BaseGrouping[];
    /**
     * the id of the column to sort. Null for no sort.
     */
    sortBy: string | null;
    /**
     * the order for the sort. If sortBy is set, this must be set too for the sortBy to take effect.
     */
    sortOrder: SortOrder | null;
    /**
     * The search that should be associated with the quick view. Should be set to '' (empty string) when no search desired.
     */
    generalSearch: string;
    /**
     * sets the page that the grid should change to when the quick view is applied.
     */
    activePage: number;
    /**
     * sets the number of items to be displayed in the page when the quick view is applied. Leave this off if you don't want to reset it from what a user might have changed it to.
     */
    itemsPerPage: number;
    /**
     * the filters to apply with the quick view.
     */
    filters: FilterValues;
    /**
     * An array of columns to customize what to display. The order of this determines the order of columns. If this is left off, it uses the default columns config.
     */
    columns?: {
        /** The column ID */ id: string;
        /** whether the column should be hidden.*/ hidden: boolean;
    }[];
}
export interface ViewState<Data extends ObjectLiteral, ATI> extends View {
    columns: InnerColumnConfig<Data, ATI>[];
}
export interface QuickViewConfig {
    /**
     * view holds all the information that the grid needs to display. If a piece isn't present in this, then that part won't be applied. For instance if there is a grouping already applied to the grid, and they select a quick view without a grouping set, then the grouping will still exist.
     */
    view: Partial<View>;
    /**
     * the quick view group the view is in. (nested menus)
     */
    group?: string;
    /**
     * The icon to display in the quick view menu. Can be Can be one of a few icons from material symbols outlined. There's a more limited group of icons allowed in the Quick View creation menu.
     */
    icon?: string;
    /**
     * The color to make the quick view's icon. Can be 'red','orange','yellow','olive','green','teal','blue','violet','purple','pink','brown','grey','black'
     */
    color?: string;
    /**
     * Indicates that this quick view is not a default view and thus should be editable/removeable. Don't set this in default views.
     */
    custom?: boolean;
}
export type QuickViewsConfig = Record<string, QuickViewConfig>;
export interface QuickView extends QuickViewConfig {
    name: string;
}
export interface FilterValues {
    [columnId: string]: {
        type: 'multiFilter' | 'remoteMultiFilter';
        value: MultiFilterValue;
    } | {
        type: 'dateFilter';
        value: DateFilterValue;
    } | {
        type: 'numericFilter';
        value: NumericFilterValue;
    } | {
        type: 'alphanumericFilter';
        value: AlphanumericFilterValue;
    };
}
export interface BaseGrouping {
    /**
     * the id of the column that makes up the grouping.
     */
    colId: string;
    /**
     * The sort direction for the grouping.
     */
    sortOrder: 'asc' | 'desc';
}
export interface Grouping<Data extends ObjectLiteral, ATI> extends BaseGrouping {
    field: ColumnConfig<Data, ATI>['field'];
    title: string;
    type?: BaseColumnConfig['type'];
}
export type RowLevelPropsCalc<Data extends ObjectLiteral> = (item: Data, index: number) => Partial<DetailedHTMLProps<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>>;
/**
 * @deprecated
 */
export type RowLevelStyleCalc<Data extends ObjectLiteral> = (item: Data, index: number) => CSSProperties;
export type RowClickHandler<Data extends ObjectLiteral> = (event: MouseEvent, itemData: Data, index: number) => void;
export interface SharedEZGridDataProps<Data extends ObjectLiteral, ATI> {
    /**
     * An array of objects containing the information to be displayed in the grid.
     * Informs the types of most of the Grid
     */
    data: Data[];
    /**
     * An object to use to pass into the template or exportTemplate functions in the columnsConfig.
     * Allows for data/functions to be passed through into the templates for advanced functionality.
     */
    additionalTemplateInfo: ATI;
}
export interface SharedEZGridProps {
    /**
     * The icons to allow for custom Quick Views
     *
     * defaults are exported as `baseIcons`
     */
    qvIcons?: IconConfig[];
    /**
     * The colors to allow for custom Quick Views
     *
     * defaults are exported as `baseIconColors`
     */
    qvIconColors?: IconColorConfig[];
}
export type FetchQuickViews = (type: 'quickViews', request: Request) => Promise<QuickViewsConfig>;
export type FetchVocab = (type: 'vocab', request: Request) => Promise<FilterValue[]>;
export type FetchAsyncFunc = (type: 'quickViews' | 'vocab', request: Request) => Promise<unknown>;
export type ExcelExportCB<Data extends ObjectLiteral, ATI> = (xlsxData: {
    /**
     * A guess of the widths of the columns in the aoaData, mainly just makes sure that Date columns are long enough to display properly.
     *
     * This goes into `worksheet['!cols']` in the xlsx library
     *
     * To turn on autofilter for the columns, you can set
     * ```js
     *  worksheet['!autofilter'] = { ref: `A1:${XLSX.utils.encode_col(wsCols.length-1)}1`};
     * ```
     */
    toWsCols(aoaData: any[][]): {
        width: number;
    }[];
    /**
     * The columns that are currently visible or should be exported
     */
    visibleColumns: InnerColumnConfig<Data, ATI>[];
    /**
     * Unprocessed Data for manually setting up the export data
     */
    data: Data[];
    /**
     * Array of Array data that can be put into XLSX.utils.aoa_to_sheet. This should use the `{ cellDates: true }` option
     *
     * The first row is the headers, and the rest are the data.
     *
     * This is a convenience method to parse the data to avoid having to do it manually.
     */
    toArrayOfArrays(): any[][];
}) => void | Promise<void>;
export interface SharedQHGridProps<Data extends ObjectLiteral, ATI> {
    /**
     * This is called when the user clicks on the excel download button. It's called with the relevant data
     * and some helpers to make it easier to convert the data to an excel file.
     *
     * The button only exists if this is set.
     */
    onExcelExport?: ExcelExportCB<Data, ATI>;
    /**
     * This allows you to take control of the data calls to the server for the data calls that the QHGrid makes directly -
     * which are `get`/`put` QuickViews, and `get` vocab for the Remote Multi-Filter filter-type.
     * This is primarily just an inversion for extra control and the ability to set headers or use custom axios/ky instances as needed.
     * For Remote-Multi-Filters, data manipulation shouldn't be done here but in the `processData` function of the filter props.
     * There is also a `remotePreRequest` hook that can be set per-column for RMFs to make it easier to customize the initial request object on a column-by-column basis.
     *
     * You can use this to add Auth headers, use `axios` or `ky` to perform the data call
     *
     * This gives you the request type and the `Request` object which can be put directly into `fetch`
     * or can be put piecemeal into an `axios` call to perform API request. The request object can be mutated in this function without issue as it is created solely for this.
     *
     *
     *
     * @example
     * ```ts
     * // Using fetch api directly
     * const fetchAsync = useCallback<FetchAsyncFunc>(async (type,request)=>{
     *    request.headers.append('Authorization',`Bearer ${token}`);
     *    const response = await fetch(request,{headers:{'Authorization':`Bearer ${token}`}});
     *    if(!response.ok) throw new Error('Failed to fetch data');
     *    const data = await response.json();
     *    return data;
     * }),[])
     * // Using ky
     * const fetchAsync = useCallback<FetchAsyncFunc>(async (type,request)=>{
     *    const data = await ky(request,{headers:{'Authorization':`Bearer ${token}`}}).json();
     *    return data;
     * }),[])
     * // Using axios
     * const fetchAsync = useCallback<FetchAsyncFunc>(async (type,request)=>{
     *    const {data} = await axios({
     *      url: request.url,
     *      method: request.method,
     *     headers: request.headers,
     *     data: request.body,
     *     withCredentials: request.credentials,
     *    });
     *    return data;
     * }),[])
     * ```
     *
     */
    fetchAsync?: FetchAsyncFunc;
}
export {};
