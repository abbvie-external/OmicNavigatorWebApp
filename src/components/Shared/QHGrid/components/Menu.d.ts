import { ButtonHTMLAttributes, HTMLProps, ReactNode, MouseEventHandler, RefCallback } from 'react';
export interface QMenuProps {
    label: string;
    prependLabel?: ReactNode;
    appendLabel?: ReactNode;
    nested?: boolean;
    children?: ReactNode;
}
export declare const MenuComponent: import("react").ForwardRefExoticComponent<Omit<QMenuProps & HTMLProps<HTMLButtonElement>, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
export interface QMenuItemProps {
    label: string;
    prependLabel?: ReactNode;
    appendLabel?: ReactNode;
    disabled?: boolean;
    /**
     * Replace the default rendering of the button.
     * @param props
     * @returns
     */
    render?: (props: ButtonHTMLAttributes<HTMLButtonElement> & {
        ref: RefCallback<HTMLElement> | null;
    }) => ReactNode;
    onClick?: MouseEventHandler<HTMLButtonElement>;
}
/**
 * QMenuItem is a component that renders a menu item.
 *
 * This should be rendered within a QMenu component.
 */
export declare const QMenuItem: import("react").ForwardRefExoticComponent<QMenuItemProps & ButtonHTMLAttributes<HTMLButtonElement> & import("react").RefAttributes<HTMLButtonElement>>;
/**
 * QMenu is a component that renders a menu with items.
 *
 * You can nest it within another QMenu to create a submenu.
 * The QMenu doesn't support an `onClick` being added to it.
 * Instead add the `onClick`s to the individual menu items.
 *
 * @example
 * ```tsx
 * <QMenu label="File">
 *  <QMenuItem label="New" onClick={handleNew} />
 *  <QMenuItem label="Open" onClick={handleOpen} />
 *  <QMenuItem label="Save" onClick={handleSave} />
 * </QMenu>
 * ```
 */
export declare const QMenu: import("react").ForwardRefExoticComponent<Omit<QMenuProps & HTMLProps<HTMLButtonElement>, "ref"> & import("react").RefAttributes<HTMLButtonElement>>;
