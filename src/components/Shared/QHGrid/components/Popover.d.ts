import { Placement } from '@floating-ui/react';
import { ButtonHTMLAttributes, Dispatch, HTMLProps, ReactNode, SetStateAction } from 'react';
import { QButtonProps } from './Button';
export interface QPopoverOptions {
    initialOpen?: boolean;
    placement?: Placement;
    modal?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /**
     * Acts as a tooltip - it will work on hover/focus and light dismissals instead of requiring clicks.
     * This is useful for tooltips that are not meant to be interactive.
     * @default false
     */
    tooltip?: boolean;
    /**
     * If true, the popover will not close when clicking outside of it or pressing escape.
     * This is useful for modals or other interactive content that should not be dismissed easily.
     * @default false
     */
    persistent?: boolean;
}
export declare function usePopover({ initialOpen, placement, modal, open: controlledOpen, onOpenChange: setControlledOpen, tooltip, persistent, }?: QPopoverOptions): {
    modal: boolean | undefined;
    labelId: string | undefined;
    descriptionId: string | undefined;
    setLabelId: Dispatch<SetStateAction<string | undefined>>;
    setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    availableHeight: number | undefined;
    tooltip: boolean;
    placement: Placement;
    strategy: import("@floating-ui/utils").Strategy;
    middlewareData: import("@floating-ui/core").MiddlewareData;
    x: number;
    y: number;
    isPositioned: boolean;
    update: () => void;
    floatingStyles: React.CSSProperties;
    refs: {
        reference: import("react").MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
        floating: React.MutableRefObject<HTMLElement | null>;
        setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
    elements: {
        reference: import("@floating-ui/react-dom").ReferenceType | null;
        floating: HTMLElement | null;
    } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    context: {
        placement: Placement;
        strategy: import("@floating-ui/utils").Strategy;
        x: number;
        y: number;
        middlewareData: import("@floating-ui/core").MiddlewareData;
        isPositioned: boolean;
        update: () => void;
        floatingStyles: React.CSSProperties;
        open: boolean;
        onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
        events: import("@floating-ui/react").FloatingEvents;
        dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
        nodeId: string | undefined;
        floatingId: string | undefined;
        refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
        elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    };
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
        active?: boolean;
        selected?: boolean;
    }) => Record<string, unknown>;
    open: boolean;
    setOpen: (open: boolean) => void;
};
export declare const usePopoverContext: () => {
    modal: boolean | undefined;
    labelId: string | undefined;
    descriptionId: string | undefined;
    setLabelId: Dispatch<SetStateAction<string | undefined>>;
    setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    availableHeight: number | undefined;
    tooltip: boolean;
    placement: Placement;
    strategy: import("@floating-ui/utils").Strategy;
    middlewareData: import("@floating-ui/core").MiddlewareData;
    x: number;
    y: number;
    isPositioned: boolean;
    update: () => void;
    floatingStyles: React.CSSProperties;
    refs: {
        reference: import("react").MutableRefObject<import("@floating-ui/react-dom").ReferenceType | null>;
        floating: React.MutableRefObject<HTMLElement | null>;
        setReference: (node: import("@floating-ui/react-dom").ReferenceType | null) => void;
        setFloating: (node: HTMLElement | null) => void;
    } & import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
    elements: {
        reference: import("@floating-ui/react-dom").ReferenceType | null;
        floating: HTMLElement | null;
    } & import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    context: {
        placement: Placement;
        strategy: import("@floating-ui/utils").Strategy;
        x: number;
        y: number;
        middlewareData: import("@floating-ui/core").MiddlewareData;
        isPositioned: boolean;
        update: () => void;
        floatingStyles: React.CSSProperties;
        open: boolean;
        onOpenChange: (open: boolean, event?: Event, reason?: import("@floating-ui/react").OpenChangeReason) => void;
        events: import("@floating-ui/react").FloatingEvents;
        dataRef: React.MutableRefObject<import("@floating-ui/react").ContextData>;
        nodeId: string | undefined;
        floatingId: string | undefined;
        refs: import("@floating-ui/react").ExtendedRefs<import("@floating-ui/react").ReferenceType>;
        elements: import("@floating-ui/react").ExtendedElements<import("@floating-ui/react").ReferenceType>;
    };
    getReferenceProps: (userProps?: React.HTMLProps<Element>) => Record<string, unknown>;
    getFloatingProps: (userProps?: React.HTMLProps<HTMLElement>) => Record<string, unknown>;
    getItemProps: (userProps?: Omit<React.HTMLProps<HTMLElement>, "selected" | "active"> & {
        active?: boolean;
        selected?: boolean;
    }) => Record<string, unknown>;
    open: boolean;
    setOpen: (open: boolean) => void;
} & {
    setLabelId: Dispatch<SetStateAction<string | undefined>>;
    setDescriptionId: Dispatch<SetStateAction<string | undefined>>;
    availableHeight?: number;
};
export interface QPopoverProps extends QPopoverOptions {
    children: ReactNode;
}
/**
 * A Popover is a floating element that can be used to display content either interactively or as a tooltip.
 *
 * @example
 * ```tsx
 * <QPopover>
 *  <QPopoverTrigger>Open Popover</QPopoverTrigger>
 *  <QPopoverContent>
 *    <QPopoverHeading>Popover Heading</QPopoverHeading>
 *   <QPopoverDescription>Popover Description</QPopoverDescription>
 *   <QPopoverClose />
 *   <p>Popover Content</p>
 *  </QPopoverContent>
 * </QPopover>
 * ```
 */
export declare function QPopover({ children, modal, ...restOptions }: QPopoverProps): import("react/jsx-runtime").JSX.Element;
export interface QPopoverTriggerProps {
    children: ReactNode;
    /**
     * If true, this will render the trigger as the children without a wrapper element.
     * This is useful for when you want to use a custom element as the trigger.
     */
    asChild?: boolean;
}
/**
 * The trigger for a Popover. This is the element that will be used to
 * open the popover.
 *
 * If the Popover is controlled, then this will need an `onClick` handler to toggle the popover.
 * as the trigger won't toggle by itself for controlled popovers.
 */
export declare const QPopoverTrigger: import("react").ForwardRefExoticComponent<QButtonProps & QPopoverTriggerProps & import("react").RefAttributes<HTMLElement>>;
/**
 * The content for a Popover. This renders the popover itself.
 */
export declare const QPopoverContent: import("react").ForwardRefExoticComponent<Omit<HTMLProps<HTMLDivElement>, "ref"> & import("react").RefAttributes<HTMLDivElement>>;
/**
 * Sets the `aria-labelledby` attribute on the Popover root element to this.
 */
export declare const QPopoverHeading: import("react").ForwardRefExoticComponent<Omit<HTMLProps<HTMLHeadingElement>, "ref"> & import("react").RefAttributes<HTMLHeadingElement>>;
/**
 * Sets the `aria-describedby` attribute on the Popover root element to this.
 */
export declare const QPopoverDescription: import("react").ForwardRefExoticComponent<Omit<HTMLProps<HTMLParagraphElement>, "ref"> & import("react").RefAttributes<HTMLParagraphElement>>;
/**
 * Renders a close button for the popover that closes on click.
 */
export declare const QPopoverClose: import("react").ForwardRefExoticComponent<ButtonHTMLAttributes<HTMLButtonElement> & import("react").RefAttributes<HTMLButtonElement>>;
