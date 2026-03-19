import { Grouping, ObjectLiteral, RowClickHandler, RowLevelPropsCalc, RowLevelStyleCalc } from '../types';
import { QHGridColumnConfig } from './types';
interface QHGridBodyProps<Data extends ObjectLiteral, ATI> {
    visibleColumns: QHGridColumnConfig<Data, ATI>[];
    grouping: Grouping<Data, ATI>[];
    slicedData: Data[];
    rowLevelStyleCalc?: RowLevelStyleCalc<Data>;
    rowLevelPropsCalc?: RowLevelPropsCalc<Data>;
    onRowClick?: RowClickHandler<Data>;
    additionalTemplateInfo: ATI;
    startIndex: number;
    itemKeyMap: (item: Data) => string | undefined;
}
export declare function QHGridBody<Data extends ObjectLiteral, ATI>(props: QHGridBodyProps<Data, ATI>): import("react/jsx-runtime").JSX.Element;
export {};
