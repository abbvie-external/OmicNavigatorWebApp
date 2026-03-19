import { QHGridProps } from '../QHGrid';
import { BaseGrouping, FilterValues, InnerColumnConfig, ObjectLiteral } from '../types';
export interface CaptionProps<Data extends ObjectLiteral, ATI> {
    columns: InnerColumnConfig<Data, ATI>[];
    onColumnVisibilityToggle?: QHGridProps<Data, ATI>['onColumnVisibilityToggle'];
    grouping: BaseGrouping[];
    onGroupChange?: QHGridProps<Data, ATI>['onGroupChange'];
    generalSearch: string;
    generalSearchDebounceTime?: number;
    onGeneralSearch?: QHGridProps<Data, ATI>['onGeneralSearch'];
    extraHeaderItem?: QHGridProps<Data, ATI>['extraHeaderItem'];
    loading?: boolean;
    onExportExcel?: () => void;
    filters: FilterValues;
}
export declare function Caption<Data extends ObjectLiteral, ATI>(props: CaptionProps<Data, ATI>): import("react/jsx-runtime").JSX.Element | null;
