/// <reference types="react" />
export declare const filterTypes: {
    [filterType in string]: {
        filter: (item: any, filterField: string, filterValues: any) => boolean;
        component: React.ElementType;
    };
};
