/// <reference types="react" />
import { TableRowProps } from 'semantic-ui-react';
export interface MFBaseProps {
    /**
     * When true, makes the Select All and Clear buttons clear the search
     */
    clearSearchOnSelectOrClearAll?: boolean;
    /**
     * This allows you to map the data to show as something that you want to display
     */
    accessor?: string | number | object | ((option: string) => any);
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
    remoteParams?: any;
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
    accessor?: string | number | object | ((option: string) => any);
}
/** standard filter, lets you select values to show. (could be looked at as an autocomplete) */
declare type multiFilter = {
    type: 'multiFilter';
    props?: MFBaseProps;
};
declare type MultiFilterValue = string[];
/**  multiFilter but lets you query a service for the values */
declare type remoteMultiFilter = {
    props: RMFBaseProps;
    type: 'remoteMultiFilter';
};
/** A filter type that lets you filter by a date range */
declare type dateFilter = {
    type: 'dateFilter';
    props?: {};
};
declare type DateFilterValue = {
    startDate: string;
    endDate: string;
};
/** A filter type that lets you filter numbers easily. */
declare type numericFilter = {
    type: 'numericFilter';
    props?: {};
};
declare type NumericFilterValue = {
    combination: '&&' | '||';
    comparison: '=' | '!=' | '>=' | '>' | '<=' | '<' | 'null' | '!null';
    value: number;
}[];
/** A filter type that lets you filter strings easily. Uses comparisons rather than exact values*/
declare type alphanumericFilter = {
    type: 'alphanumericFilter';
    props?: {};
};
declare type AlphanumericFilterValue = {
    combination: '&&' | '||';
    comparison: '=' | '!=' | 'contains' | '!contains' | 'starts' | 'ends' | 'null' | '!null' | 'empty' | '!empty';
    value: string;
}[];
export declare type Accessor<T> = (item: T, field: keyof T) => any;
export declare type SortAccessor<T> = (item: T, field: keyof T) => number | string;
export declare type GroupAccessor<T> = (item: T, field: keyof T) => number | string;
export declare type ExportTemplate<T, ATI> = (value: any, item: T, additionalTemplateInfo: ATI) => string | number;
export declare type Template<T, ATI> = (value: any, item: T, additionalTemplateInfo: ATI) => React.ReactNode;
export interface BaseColumnConfig {
    /** Props to be passed into each columns <Table.HeaderCell /> tag */
    headerAttributes?: React.HTMLAttributes<HTMLTableHeaderCellElement>;
    /** Styles to be passed into each columns <col /> tag within the colgroups. Allows for basic customization by column */
    columnStyle?: React.CSSProperties;
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
export interface ColumnConfig<T, ATI = any> extends BaseColumnConfig {
    /**
     * A function that allows you to customize what the exported values should look like for this column. Should return simple data types that will export properly.
     */
    exportTemplate?: (value: any, item: T, additionalTemplateinfo: ATI) => any;
    /**
     * The entry in the data object that the column uses. Can be the key, or an object for better customization
     */
    field: keyof T | {
        /** The key of the data object that the column uses */
        field: keyof T;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this goes straight to the template functions (or the grid if there isn't a template function)
         */
        accessor?: keyof T | number | object | Accessor<T>;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this tells the grid how the sorting should work for the column
         */
        sortAccessor?: keyof T | number | object | SortAccessor<T>;
        /** A way to take the data and return it in a way that's more useful.
         * The return value of this tells the grid how the grouping should work for the column
         */
        groupAccessor?: keyof T | number | object | GroupAccessor<T>;
    };
    /** Indicates that the column should be filterable */
    filterable?: multiFilter | remoteMultiFilter | dateFilter | numericFilter | alphanumericFilter;
    /** A template for the column that returns what should be displayed in the table's cell. Allows for deep/dynamic customization */
    template?: (value: any, item: T, additionalTemplateinfo: ATI) => React.ReactNode;
}
export declare type InnerColumnConfig<T, ATI> = ColumnConfig<T, ATI> & {
    id: string;
    hidden: boolean;
};
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
    sortOrder: 'asc' | 'desc' | null;
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
export interface ViewState<T, ATI> extends View {
    columns: InnerColumnConfig<T, ATI>[];
}
export interface QuickViewConfig {
    /**
     * view holds all the information that the grid needs to display. If a piece isn't present in this, then that part won't be applied. For instance if there is a grouping already applied to the grid, and they select a quick view without a grouping set, then the grouping will still exist.
     */
    view: View;
    /**
     * the quick view group the view is in. (nested menus)
     */
    group?: string;
    /**
     * The icon to display in the quick view menu. Can be any icon in Semantic UI. There's a more limited group of icons allowed in the Quick View creation menu.
     */
    icon?: string;
    /**
     * The color to make the quick view's icon. Can be 'red','orange','yellow','olive','green','teal','blue','violet','purple','pink','brown','grey','black','AbbvieBlue', 'AbbviePurple', and 'AbbvieTeal'
     */
    color?: string;
    /**
     * Indicates that this quick view is not a default view and thus should be editable/removeable. Don't set this in default views.
     */
    custom?: boolean;
}
export declare type QuickViewsConfig = Record<string, QuickViewConfig>;
export interface QuickView extends QuickViewConfig {
    name: string;
}
export interface FilterValues {
    [columnId: string]: {
        type: 'multiFilter' | 'remoteMultiFilter' | 'remoteAndLocalMultiFilter';
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
export interface Grouping<T, ATI> extends BaseGrouping {
    field: ColumnConfig<T, ATI>['field'];
    title: string;
    type?: BaseColumnConfig['type'];
}
export declare type RowLevelPropsCalc<T> = (item: T, index: number) => Partial<TableRowProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>>;
export {};
