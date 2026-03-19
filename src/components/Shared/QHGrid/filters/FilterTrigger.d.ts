import { CSSProperties, MouseEventHandler } from 'react';
export interface FilterTriggerProps {
    active?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: MouseEventHandler<HTMLElement>;
}
export declare const FilterTrigger: import("react").ForwardRefExoticComponent<FilterTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
