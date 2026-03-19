import { ElementType } from 'react';
export type FilterValue = string | number | null | undefined;
export declare const filterTypes: {
    [filterType in string]: {
        filter: (item: any, filterField: string, filterValues: any) => boolean;
        component: ElementType;
        props?: Record<string, any>;
    };
};
