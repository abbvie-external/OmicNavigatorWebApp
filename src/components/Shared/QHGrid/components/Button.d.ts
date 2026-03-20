import { ButtonHTMLAttributes, CSSProperties, FC, FocusEventHandler, MouseEventHandler } from 'react';
export interface QButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    /**
     * Makes the button have less inline padding
     */
    compact?: boolean;
    /**
     * makes the button have less block padding and smaller text
     */
    size?: 'mini';
    /**
     * @default false
     */
    disabled?: boolean;
    /**
     * What style of button to use
     *
     * - `outlined` - A button with a border - this is meant to be used on inverted backgrounds from the normal coloration
     * - `ghost` - A button with no background or border - This is meant to be used on normal background colors from the normal coloration
     * - `filled` - A button with a background
     * @default 'filled'
     */
    variant?: 'outlined' | 'ghost' | 'filled';
    /**
     * Forces the button to a permanent "hover" look
     * @default false
     */
    active?: boolean;
    className?: string;
    style?: CSSProperties;
    onClick?: MouseEventHandler<HTMLButtonElement>;
    onBlur?: FocusEventHandler<HTMLButtonElement>;
}
/**
 * A button component
 */
export declare const QButton: import("react").ForwardRefExoticComponent<QButtonProps & import("react").RefAttributes<HTMLButtonElement>>;
export declare const __FakeButton: FC<QButtonProps>;
