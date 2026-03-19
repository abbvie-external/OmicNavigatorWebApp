import { FormEvent, ReactNode, RefObject } from 'react';
import { DialogProps } from './Dialog';
type RenderProp = (ref: RefObject<HTMLDialogElement | null>) => ReactNode;
export interface ModalProps extends Omit<DialogProps, 'children' | 'modal'> {
    header?: ReactNode | RenderProp;
    footer?: ReactNode | RenderProp;
    children?: ReactNode | RenderProp;
    onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
    formClassName?: string;
    mainClassName?: string;
}
export declare const Modal: ({ className, children, footer, header, onSubmit, formClassName, mainClassName, ...props }: ModalProps) => import("react/jsx-runtime").JSX.Element;
export {};
