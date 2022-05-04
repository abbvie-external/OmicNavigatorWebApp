/// <reference types="react" />
import { QuickViewsConfig, QuickView, View } from 'types';
export interface QuickViewsProps {
    /**
     * A collection of views that are easily switched between. There are options to make them user-addable as well as remotely stored through a service and database. Setting this enables basic quick views. Quick Views work by changing the current setting of the grid to their view. They don't lock the grid to that view, however.
     */
    config?: QuickViewsConfig;
    /**
     * The Id with which to store the quickViews either locally or remotely. Setting this enables custom quick views.
     */
    id?: string;
    /**
     * The URL to use to GET quickViews/ PUT the updated quick views
     */
    url?: string;
    /**
     * The ID of the quick view to show. Makes the quick view controlled.
     * Prevents nonprogramtic changing of the quick view (this is useful for cases where you might want some other part of the app to control the current QV).
     */
    value?: string;
    /**
     * The ID of the default quick view to show upon first displaying the grid
     */
    defaultValue?: string;
    /**
     * The Id to use to save the quick views to the database using
     */
    ownerId?: string;
    /**
     * If set to true, disables the ability to create and edit quick views
     */
    disableChanges?: boolean;
    /**
     * If set to true, hides the menu entirely
     */
    disableMenu?: boolean;
    /**
     * A function to handle quick view changes. Will let you control which quick view is showing if you use the quickView prop.
     */
    onChange?: (quickView: string, config: QuickView) => void;
    onViewChange: (config: QuickView) => void;
    /**
     * An optional way to add a share button if you want to generate a link to the quick view.
     * It's only really useful with the quickViewURL and controlled quickviews, as you would be able to generate a link with the ownerId and quickView such that anyone can open it and see their quick views.
     * disableQuickViewEditing is also good for this.
     */
    onShare?: (quickView: string, config: QuickView) => void;
    /**
     * A function to get the current view settings
     */
    getView?: () => View;
}
export declare function QuickViews(props: QuickViewsProps): JSX.Element | null;
