import { ReactNode } from 'react';
export interface DialogProps {
    /**
     * Note: due to HTML limitations, this is not a *true* controlled component!
     * You can set the `open` prop to `false` to close the dialog, but you cannot
     * ignore the close event fired to close it, as it will *close* the dialog regardless.
     */
    open?: boolean;
    /**
     * If true, the dialog will be modal, meaning it will trap focus and prevent
     * the user from interacting with the rest of the page until it is closed.
     *
     * Changing this will not change whether the dialog is a modal if it is already open.
     */
    modal?: boolean;
    children?: ReactNode;
    className?: string;
    onClose?: () => void;
}
export declare const Dialog: import("react").ForwardRefExoticComponent<DialogProps & import("react").RefAttributes<HTMLDialogElement>>;
