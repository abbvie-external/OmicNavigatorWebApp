import { ReactNode } from 'react';
export interface QMessageProps {
    /**
     * If a string, it will be used as the ligature icon name using the icons that are part of the QHGrid package.
     */
    icon?: ReactNode;
    header?: ReactNode;
    content?: ReactNode;
}
/**
 * A message component that can be used to display information to the user.
 * It can be used to display a message with an icon, a header and a body.
 * @param props
 * @returns
 */
export declare function QMessage(props: QMessageProps): import("react/jsx-runtime").JSX.Element;
