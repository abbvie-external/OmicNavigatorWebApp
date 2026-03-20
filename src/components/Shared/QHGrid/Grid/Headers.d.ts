import { QHGridProps } from '../QHGrid';
import { ObjectLiteral } from '../types';
interface HeadersProps<Data extends ObjectLiteral, ATI> {
    columns: QHGridProps<Data, ATI>['columns'];
    onColumnReorder?: QHGridProps<Data, ATI>['onColumnReorder'];
    sortBy: QHGridProps<Data, ATI>['sortBy'];
    sortOrder: QHGridProps<Data, ATI>['sortOrder'];
    onSort?: QHGridProps<Data, ATI>['onSort'];
    filters: QHGridProps<Data, ATI>['filters'];
    onFilterUpdate?: QHGridProps<Data, ATI>['onFilterUpdate'];
    rawData?: QHGridProps<Data, ATI>['data'];
    enableDrag?: boolean;
    fetchAsync?: QHGridProps<Data, ATI>['fetchAsync'];
}
export declare function Headers<Data extends ObjectLiteral, ATI>(props: HeadersProps<Data, ATI>): import("react/jsx-runtime").JSX.Element;
export {};
