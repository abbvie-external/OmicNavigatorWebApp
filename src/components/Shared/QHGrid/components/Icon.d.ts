import { CSSProperties } from 'react';
export interface QIconProps {
    /**
     * The icon name to be displayed. This should be a valid icon name from the QH-MSO icon set.
     * Current allowed options are:
     * `add`,`add_box`,`add_circle`,`arrow_downward_alt`,`arrow_upward_alt`,`asterisk`,`auto_fix_high`,`back_hand`,
     * `bolt`,`brightness_empty`,`cake`,`check`,`check_box`,`check_box_outline_blank`,`close`,`coffee`,`cut`,`delete`,
     * `edit`,`file_save`,`filter_alt`,`group`,`hourglass`,`hourglass_bottom`,`hourglass_empty`,`hourglass_top`,`info`,
     * `keyboard_arrow_down`,`keyboard_arrow_right`,`local_bar`,`person`,`pets`,`question_mark`,`refresh`,`remove`,`rocket`,
     * `science`,`search`,`sentiment_dissatisfied`,`sentiment_neutral`,`sentiment_satisfied`,`share`,`sort`,`sports_bar`,
     * `star`,`table_view`,`theater_comedy`,`thumb_down`,`thumb_up`,`warning`
     */
    name: string;
    /**
     * What color should the icon be? (inherits by default)
     */
    color?: string;
    /**
     * What should the font-size of the icon be?
     *
     * @default '1em'
     */
    size?: number | string;
    /**
     * Additional class names to be applied to the icon.
     */
    className?: string;
    style?: CSSProperties;
    /**
     * This icon is in the corner
     *
     * @example
     * ```tsx
     * <i className="qh-icons"><QIcon name="filter_alt"/><QIcon name="add" corner /></i>
     * ```
     */
    corner?: boolean;
}
export declare function QIcon(props: QIconProps): import("react/jsx-runtime").JSX.Element;
