import { Component } from 'react';
import { CheckboxProps, DropdownProps } from 'semantic-ui-react';
import { QuickView } from 'types';
export interface QuickViewModalProps {
    open: boolean;
    quickViews: QuickView[];
    values?: QuickView;
    header?: Node | string;
    onCreateQuickView?: (name: string, group?: string, icon?: string, color?: string) => void;
    onEditQuickView?: (oldName: string, name: string, group?: string, icon?: string, color?: string, update?: boolean) => void;
    onClose: () => void;
}
interface QuickViewModalState {
    name: string;
    group: string;
    color: string;
    icon: string;
    update: boolean;
    groupOptions: {
        text: string;
        key: string;
        icon?: string;
        value: string;
    }[];
    groupError: boolean;
    nameError: boolean;
    quickViews: QuickView[];
    usedNames: Record<string, boolean>;
    values: QuickView | null;
}
export default class QuickViewModal extends Component<QuickViewModalProps, QuickViewModalState> {
    state: QuickViewModalState;
    handleConfirmClick: () => void;
    handleGroupAddition: (_evt: any, { value }: DropdownProps) => void;
    handleGroupChange: (_evt: any, { value }: DropdownProps) => void;
    handleColorChange: (_evt: any, { value }: DropdownProps) => void;
    handleIconChange: (_evt: any, { value }: DropdownProps) => void;
    static getDerivedStateFromProps(nextProps: QuickViewModalProps, prevState: QuickViewModalState): Partial<QuickViewModalState> | null;
    handleNameChange: (_evt: any, { value }: {
        value: any;
    }) => void;
    handleUpdateChange: (_evt: any, { checked }: CheckboxProps) => void;
    handleSubmit: (evt: any) => void;
    render(): JSX.Element | null;
}
export {};
