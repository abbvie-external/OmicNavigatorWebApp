import { ReactNode } from 'react';
import { IconColorConfig, IconConfig, QuickView } from './types';
export interface QuickViewModalProps {
    open: boolean;
    quickViews: QuickView[];
    values?: QuickView;
    header?: ReactNode | string;
    onEditQuickView?: (oldName: string | undefined, name: string, group?: string, icon?: string, color?: string, update?: boolean) => void;
    onClose: () => void;
    icons: readonly IconConfig[];
    colors: readonly IconColorConfig[];
}
export declare const QuickViewModal: ({ ...props }: QuickViewModalProps) => import("react/jsx-runtime").JSX.Element;
