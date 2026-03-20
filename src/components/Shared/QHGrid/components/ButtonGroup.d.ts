import { CSSProperties, ReactNode } from 'react';
export interface QButtonGroupProps {
    /**
     * Forces the button group to take up the full width of the parent as well as use flex instead of inline-flex
     * @default false
     */
    fluid?: boolean;
    children: ReactNode;
    className?: string;
    style?: CSSProperties;
}
/**
 * A convenience wrapper for grouping buttons together with nicer styling.
 * The buttons will have their border-radiuses adjusted to look like a single item with separations.
 * @param param0
 * @returns
 */
export declare function QButtonGroup({ className, fluid, children, style, }: QButtonGroupProps): import("react/jsx-runtime").JSX.Element;
