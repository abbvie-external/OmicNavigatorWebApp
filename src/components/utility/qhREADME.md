# Installation

For now, install at least these dependencies

```
{
  "dependencies": {
    "reselect": "^4.0.0",
    "re-reselect": "^3.3.0",
    "moment": "^2.24.0",
    "lodash": "^4.17.14",
    "immutability-helper": "^3.0.1",
    "react": "^16.8.6",
    "axios": "^0.18.1",
    "semantic-ui-react": "^0.87.3",
    "semantic-ui-css": "^2.4.1",
    "prop-types": "^15.7.2",
    "airbnb-prop-types": "^2.13.2",
    "xlsx": "^0.14.3",
    "react-virtualized": "^9.21.0"
  }
}
```

Make sure you import 'semantic-ui-css' somewhere in your project.
We'll try and get the package set up to not require these steps at some point.

# Usage - EZ Grid

The EZGrid versions are by far the easiest way of using the grid. As long as your customizations fit within the EZGrid framework.

The only props that are explicitly needed are data and columnsConfig.

## EZGrid Props

data: { [ { } ] } An array of objects containing the information to be displayed in the grid.

columnsConfig: { [ { } ] } An array of objects containing the columns configurations. Details as follow:

```
{
  exportTemplate: {function(value,item,additionalTemplateInfo)}? A function that allows you to customize what the exported values should look like for this column. Should return simple data types that will export properly.
  field: {string|{}} - The entry in the data object that the column uses.
    Object: {
      field: {string}
      accessor: {function|object|other type}
        function: accessor(item,field)=>value
        object: accessor[item[fieldName]] => value
        other type: item[accessor] => value
    }
  filterable: {{}}? Indicates that the column should be filterable
    Object:{
      props: {{}}? Props to pass into the Filter Component - allows for further customization
      type: {string}: The type of filter to use. By default can be one of:
        'multiFilter' - standard filter, lets you select values to show.
            No extra props
            value type: {[]} An array of the values that should be shown
        'remoteMultiFilter' - multiFilter but lets you query a service for the values
            extra props: {
              prefetch: {boolean}? Indicates that the Filter Component should fetch the remote values as soon as it is mounted rather than on first open.
              remoteUrl: {string} The url to use to fetch the filter options.
              remoteParams: {{}}? The parameters to use to fetch the filter options
              accessor: {function|object|other type}? An accessor to use to map what the options look like to the user. To be used to make things human readable.
            }
            value type: {[]} An array of the values that should be shown
        'remoteAndLocalMultiFilter' - multiFilter but lets you query a service for the values and use local values.
            extra props: {
              remoteUrl: {string} The url to use to fetch the filter options.
               accessor: {function|object|other type}? An accessor to use to map what the options look like to the user. To be used to make things human readable.
            }
            value type: {[]} An array of the values that should be shown
        'dateFilter' - A filter type that lets you filter by a date range
            No extra props
            value type: {{}} An object of type
              Object {
                startDate: {string} date in form "2019-08-21"
                endDate: {string} date in form "2019-08-21"
              }
    }
  groupAccessor: {function(item,field)}? An accessor that takes in the item and the string field to return the value to use for the grouping
  headerAttributes: {{}}? props to be passed into each columns <Table.HeaderCell /> tag
  hidden: {boolean}? Option to hide a column by default.
  hideOnExport: {boolean}? Option to hide column when exporting to excel
  ID: {string}? Unique identifier for the column. Optional - uses the field name as the default value.
  sortAccessor: {function(item,field)}? An accessor that takes in the item and the string field to return the value to use to sort by the column
  template: {function(value,item,additionalTemplateInfo)}? A template for the column that returns what should be displayed in the table's cell. Allows for deep/dynamic customization
  title: {string} The name displayed in the column headers.
  type: {string}? The standard type to use as a default for the column. by default can be one of:
      number - sets the sortAccessor and groupAccessor to make it sort and group correctly for numbers
      date - sets the accessor, sortAccessor, groupAccessor, exportTemplate, and template to a good default for dates in 'D/MMM/YYYY' format
      datetime - sets the same as date but in 'D/MMM/YYYY HH:mm:ss' format for times as well.
  unique: {boolean}? Tells the grid that the value made from unqiue columns is unique in the data. It is a possible optimization when the data is going to be re-sorted often. Almost certainly not necessary.
}
```

itemsPerPage: {number}? The number items to display at once. Can be 5,10,15,30,45,60,75,100,250,500,1000

exportBaseName: {string}? The beginning of the name to use when exporting. Will be baseName+date. Setting this enables exporting to excel.

loading: {boolean}? Tells the grid to show the loading dimmer and prevent user interaction before the data is loaded

additionalTemplateInfo: {{}}? An object to use to pass into the template or exportTemplate functions in the columnsConfig. Allows for data/functions to be passed through into the templates for advanced functionality.

rowLevelStyleCalc: {function(item,index)}? A function that returns a react style object for the <Table.Row /> Component.

fetchData: {function(event)}? A function that fetches the data and enables a little refresh data button in the bottom right corner.

quickViews: {{}}? A collection of views that are easily switched between. There are options to make them user-addable as well as remotely stored through a service and database. Setting this enables basic quick views. Quick Views work by changing the current setting of the grid to their view. They don't lock the grid to that view, however.

    Object{
      [quickViewName] {
        view: {{}} view holds all the information that the grid needs to display. If a piece isn't present in this, then that part won't be applied. For instance if there is a grouping already applied to the grid, and they select a quick view without a grouping set, then the grouping will still exist.
          Object {
            grouping: {[{}]}? The groupings. Currently must be present (empty array for no groupings)
              Object {
                col_id: {string} the id of the column that makes up the grouping.
                sortOrder: {string} The order for the grouping. Can be 'asc' or 'desc'
              }
            sortBy: {string}? the id of the column to sort. Null for no sort.
            sortOrder: {string}? the order for the sort. Can be 'ascending' or 'descending' If sortBy is set, this must be set too for the sortBy to take effect.
            generalSearch: {string}? The search that should be associated with the quick view. Should be set to '' (empty string) when no search desired.
            activePage: {number}? sets the page that the grid should change to when the quick view is applied.
            itemsPerPage: {number}? sets the number of items to be displayed in the page when the quick view is applied. Leave this off if you don't want to reset it from what a user might have changed it to.
            filters: {{}}? the filters to apply with the quick view.
              Object {
                [col_id]:{
                  type: {string} the filter type that the column uses.
                  value: {any} the value type associated with the filter type
                }
              }
            columns: {[{}]}? An array of columns to customize what to display. The order of this determines the order of columns. If this is left off, it uses the default columns config.
              Object {
                ID: {string} The column ID
                hidden: {boolean} whether the column should be hidden.
              }
          }
        group: {string}? the quick view group the view is in. (nested menus)
        icon: {string}? The icon to display in the quick view menu. Can be any icon in Semantic UI. There's a more limited group of icons allowed in the Quick View creation menu.
        color: {string}? The color to make the quick view's icon. Can be 'red','orange','yellow','olive','green','teal','blue','violet','purple','pink','brown','grey','black','AbbvieBlue', 'AbbviePurple', and 'AbbvieTeal'
        custom: {boolean}? Indicates that this quick view is not a default view and thus should be editable/removeable. Don't set this in default views.
      }
    }

    Different possibilities:
    *  1 quickViews defined
    *  2 quickViewsId defined
    *  3 quickViewsURL defined
    * !2&3: disable editing.
    * 1&2&3
        -use predefined quick views, enable editing, use the service
    * 1&2&!3
        -use predefined quick views, enable editing, use localstorage
    *  1&!2&!3
        -use predefined quick views, no editing, no storage
    *  !1&2&3
        -No predefined quick views, enable editing, use the service
    *  !1&2&!3
        -No predefined quick views, enable editing, use localstorage
    *  !1&!2&!3
        -No quick views at all.

quickViewsId: {string}? The Id with which to store the quickViews either locally or remotely. Setting this enables custom quick views.

quickViewsURL: {string}? The URL to use to GET quickViews/ PUT the updated quick views

ownerId: {string}? The Id to use to save the quick views to the database using

legend: {Node}? A react Node to render within a popup to show when hovering over a Legend button. Setting this shows the Legend Button in the Header

extraHeaderItem: {Node}? A react Node to render in the Header. Can use Fragments to render many extra things in the Header

generalSearchDebounceTime: {number}? The amount of time to debounce the general search. Defaults to 500ms. 0ms means don't debounce.

disableGeneralSearch: {boolean}? If set to true, removes the general search component from the grid tool bar.

disableGrouping: {boolean}? If set to true, disables the grouping functionality of the grid and removes the column drop zone,

disableSort: {boolean}? If set to true, disables the column sorting functionality

disableColumnVisibilityToggle: {boolean}? If set to true, removes the column toggle button from the tool bar and disables the ability to toggle column disableColumnVisibilityToggle

disableColumnReorder: {boolean}? If set to true, disables the ability to reorder columns by clicking and dragging the column headers

disableFilters: {boolean}? If set to true, disables the ability to filter on all columns

disableQuickViewEditing: {boolean}? If set to true, disables the ability to create and edit quick views

showError: {function(string)}? A function that the grid will call when encountering an error. The function should have a single argument of type string which will be the error message provided by the grid

fetchData: {function} A function called by the EZGrid to fetch all of the data to be displayed by the grid

quickView: {string}? The ID of the quick view to show. Makes the quick view controlled. Prevents non-programtic changing of the quick view (this is useful for cases where you might want some other part of the app to control the current QV).

onQuickViewChange: {function(quickview{string}, data{{}},isDefault{boolean})}? A function to handle quick view changes. Will let you control which quick view is showing if you use the quickView prop.

    function {
      quickView: {string} The name of the quick view.
      data: {{}} the props in the quick view menu item.
        Object {
          view: {quickView.view} The view object from the QV
          name: {string} the QV's name
          data-custom: {boolean} whether the QV is custom
        }
      isDefault: {boolean} whether the QV is default (opposite of data-custom)
    }

onQuickViewShare: {function(quickView{string})}? An optional way to add a share button if you want to generate a link to the quick view. It's only really useful with the quickViewURL and controlled quick-views, as you would be able to generate a link with the ownerId and quickView such that anyone can open it and see their quick views. disableQuickViewEditing is also good for this.

defaultQuickView: {string}? The ID of the default quick view to show upon first displaying the grid

uniqueCacheKey: {string}? A unique key used to store the current state of the grid, so the state of the grid is remembered when navigating away and back to the grid

height: {string}? The height you want the grid to have. Defaults to '70vh'

# Usage EZ Network Grid

This grid is very similar to the EZGrid, but with the purpose of supporting server side pagination.

## EZ Network Grid Props

These are mostly the same as the props in EZGrid, so here are the differences:

fetchData: {function(state {{}},props {{}})} this prop is required, and will be called with the the current view settings so the call to the server can be performed.

    state {} Mostly the same as the quickViews.view object
      {
        generalSearch: {string}
        filters: {Filters} the same filter type object as in the quickViews
        columns: {columnsConfig} Passes in the columnsConfig object
        sortBy: {string}
        sortOrder: {string}
        grouping: {[{}]}
        itemsPerPage: {number}
        activePage: {number}
      }
    props {} the props that were passed into the EZNetworkGrid

fetchReportData {fetchData}? The same signature as the fetchData function, but needs to return all rows that apply. This allows for exporting an excel document from a network grid, otherwise it would only be able to export the current page.

totalRows: {number} This is the total number of rows that exist in the data in the current view settings so that the grid can know where how many pages exist.

# QHGrid Usage

Using the QHGrid by itself is not recommended as you'll have to support all the pieces of the grid through your code.

# QuickViewModal

The modal used to create/edit quick views. Is already included in the EZ Grids

# Extending the default capabilities of the grids

## Custom Filters

If you desire more filter types, import {filterTypes} from the quick-hits-grid folder and add new properties to the filterTypes object.

    The format is:
    {
      [name]:{
        filter: (item,filterField,filterValues)=>boolean
          {
            item: {{}} the item being filtered
            filterField: {string} the string field accessor to get the value in question
            filter_values: {any} based on the type of filter desired
          }
        component: {React Component} The component to render in the grid (not a Node, just the Class/functional component itself)
      }
    }

## Custom Types

If you have many columns in your application that have a very similar type, then you can specify additional types by extending the {typeMap} object from quick-hits-grid. You can also adjust the default ones if desired.

    the format is:
    {
      accessor: {columnsConfig.field.accessor}? an accessor to change what the value looks like. The same type of accessor as in the columnsConfig[].field object.
        function: accessor(item,field)=>value
        object: accessor[item[fieldName]] => value
        other type: item[accessor] => value
      sortAccessor: {field.accessor}? an accessor to change what the value that is sorted looks like
      groupAccessor {field.accessor}? an accessor to change what the value that is grouped looks like
      exportTemplate {columnsConfig.exportTemplate}? A function that allows you to customize what the exported values should look like for this column. Should return simple data types that will export properly.
      template: {columnsConfig.template}? A template for the column that returns what should be displayed in the table's cell. Allows for deep/dynamic customization
    }
