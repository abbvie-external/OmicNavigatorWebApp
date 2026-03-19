import { CSSProperties, ReactNode } from 'react';
export interface DimmerProps {
    active?: boolean;
    loader?: boolean;
    children?: ReactNode;
    className?: string;
    style?: CSSProperties;
}
export declare function Dimmer(props: DimmerProps): import("react/jsx-runtime").JSX.Element | null;
