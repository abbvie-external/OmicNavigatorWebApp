import { Paths } from 'type-fest';
import { FilterValue } from './FilterTypeConfig';
import { Combinations, Comparisons } from './filters/utils';
import { FetchAsyncFunc, MFBaseProps, ObjectLiteral, RMFBaseProps } from './types';
export interface MFProps<Data extends ObjectLiteral> extends MFBaseProps {
    selectedOpts?: FilterValue[];
    data: Data[];
    field: Paths<Data>;
    onChange: (opts?: FilterValue[]) => void;
    accessor: any;
    columnName?: string;
    columnId?: string;
}
export declare function MultiFilterDropdown<Data extends ObjectLiteral>({ selectedOpts, data, field, onChange, accessor, ...props }: MFProps<Data>): import("react/jsx-runtime").JSX.Element;
export interface RMFProps<Data extends ObjectLiteral> extends RMFBaseProps {
    selectedOpts?: FilterValue[];
    data: Data[];
    field: Paths<Data>;
    onChange: (opts?: FilterValue[]) => void;
    fetchAsync?: FetchAsyncFunc;
    columnName?: string;
    columnId?: string;
}
export declare function RemoteMultiFilterDropdown<Data extends ObjectLiteral>({ selectedOpts, data, field, onChange, accessor, useLocal, remotePreRequest, processData: configProcessData, ...props }: RMFProps<Data>): import("react/jsx-runtime").JSX.Element;
export interface DateFilterOpts {
    startDate: string;
    endDate: string;
}
export interface DateFilterProps {
    onChange: (opts?: DateFilterOpts) => void;
    selectedOpts?: DateFilterOpts;
    columnName?: string;
    columnId?: string;
}
export declare function DateFilterDropdown(props: DateFilterProps): import("react/jsx-runtime").JSX.Element;
export interface AlphanumericOpt {
    comparison: Comparisons;
    combination: Combinations;
    value: string;
}
export interface AlphanumericFilterProps {
    onChange: (opts?: AlphanumericOpt[]) => void;
    selectedOpts: AlphanumericOpt[];
    filterSubType: 'numeric' | 'alphanumeric';
    columnName?: string;
    columnId?: string;
}
export declare function AlphanumericFilterPopup({ onChange, filterSubType, ...props }: AlphanumericFilterProps): import("react/jsx-runtime").JSX.Element;
