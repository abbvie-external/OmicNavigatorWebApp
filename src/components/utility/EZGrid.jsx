import React, { PureComponent } from 'react';
import _ from 'lodash';
import update from 'immutability-helper';
import Axios from 'axios';
import QHGrid from './QHGrid';
import { filterTypes } from './FilterTypeConfig';
import { getField, getFieldValue } from './selectors/QHGridSelector';
import {
  stripNonCustomViews,
  ezQuickViewSelector
} from './selectors/quickViewSelector';
import QuickViewModal from './QuickViewModal';

const cache = {};

/**
 * @callback rowLevelStyleCalc
 * @param {{}} item
 * @param {number} index
 */
/**
 * @callback fetchData
 * @param event
 */
/**
 * @callback onQuickViewChange
 * @param {string} quickView
 * @param {{quickView:string}} props
 * @param {boolean} isDefault
 */
/**
 * @callback onQuickViewShare
 * @param {string} quickView
 * @param {{quickView:string}} props
 */
// defaultQuickView selection somehow?
/**
 * @augments {PureComponent<
             {data: [{}],
             columnsConfig: [{}],
             itemsPerPage: number,
             exportBaseName: string,
             loading: boolean,
             additionalTemplateInfo: {},
             rowLevelStyleCalc: rowLevelStyleCalc,
             fetchData: fetchData,
             quickViews: {},
             quickViewsId: string,
             quickViewsURL: string,
             dashboardId: string,
             ownerId: string,
             legend: Node,
             extraHeaderItem: Node,
             generalSearchDebounceTime: number,
             disableGeneralSearch: boolean,
             disableGrouping: boolean,
             disableSort: boolean,
             disableColumnVisibilityToggle: boolean,
             disableColumnReorder: boolean,
             disableFilters: boolean,
             disableQuickViewEditing: boolean,
             showError: function,
             fetchData: function,
             quickView: string,
             onQuickViewChange: onQuickViewChange,
             onQuickViewShare: onQuickViewShare,
             defaultQuickView: string,
             uniqueCacheKey: string
             }>}
 */
export default class EZGrid extends PureComponent {
  state = {
    generalSearch: '',
    filters: {},
    columns: [],
    sortBy: null,
    sortOrder: null,
    grouping: [],
    filteredData: [],
    itemsPerPage: 15,
    activePage: 1
  };
  static defaultProps = {
    showError: () => {},
    itemsPerPage: 15
  };
  componentDidMount = () => {
    if (
      this.props.uniqueCacheKey &&
      !(this.props.quickView || this.props.defaultQuickView) &&
      cache[this.props.uniqueCacheKey]
    ) {
      this.setState(cache[this.props.uniqueCacheKey]);
    } else {
      let columnsConfig = mapColumnsConfig(this.props.columnsConfig);
      this.setState({
        columns: columnsConfig,
        columnsConfig,
        itemsPerPage: this.props.itemsPerPage
      });
      this.getQuickViews(true);
      this.filterData();
    }
  };

  componentDidUpdate = (prevProps, prevState) => {
    // let state={};
    if (this.props.columnsConfig !== prevProps.columnsConfig) {
      let columnsConfig = mapColumnsConfig(this.props.columnsConfig);
      this.setState({ columns: columnsConfig, columnsConfig });
    }
    if (
      this.props.itemsPerPage !== prevProps.itemsPerPage &&
      this.props.itemsPerPage !== undefined
    ) {
      this.setState({ itemsPerPage: this.props.itemsPerPage, activePage: 1 });
    }
    // if (this.props.itemsPerPage !== prevProps.itemsPerPage) {
    //   this.setState({ itemsPerPage: this.props.itemsPerPage });
    // }
    if (
      this.props.data !== prevProps.data ||
      this.state.generalSearch !== prevState.generalSearch ||
      this.state.filters !== prevState.filters
    ) {
      this.filterData();
    }
    if (
      this.state.columnsConfig !== prevState.columnsConfig ||
      this.props.quickViewsId !== prevProps.quickViewsId ||
      this.props.quickViewsURL !== prevProps.quickViewsURL ||
      this.props.quickViews !== prevProps.quickViews
    ) {
      this.getQuickViews();
    }
    if (this.state.quickViewsConfig !== prevState.quickViewsConfig) {
      this.setState(prev => ({
        quickViews: ezQuickViewSelector(
          prev.quickViewsConfig,
          prev,
          this.props.quickViewsId
        )
      }));
    }
    if (this.props.quickView && this.props.quickView !== prevProps.quickView) {
      this.setState(prev => {
        let { view } =
          prev.quickViews.find(view => view.name === this.props.quickView) ||
          {};
        if (view) return { ...view };
      });
    }
    if (this.props.uniqueCacheKey && this.state !== prevState) {
      cache[this.props.uniqueCacheKey] = this.state;
    }
  };
  setFilters = newFilters => {
    this.setState({ filters: newFilters });
  };
  /**
   * Different possibilities:
   *  1 quickViews defined
   *  2 quickViewsId defined
   *  3 quickViewsURL defined
   * !2&3: disable editing.
   * 1&2&3
   *    -use predefined quick views, enable editing, use the service
   * 1&2&!3
   *    -use predefined quick views, enable editing, use localstorage
   *  1&!2&!3
   *    -use predefined quick views, no editing, no storage
   *  !1&2&3
   *    -No predefined quick views, enable editing, use the service
   *  !1&2&!3
   *    -No predefined quick views, enable editing, use localstorage
   *  !1&!2&!3
   *    -No quick views at all.
   */
  getQuickViews = async isMounting => {
    let { quickViews, quickViewsId, quickViewsURL, ownerId } = this.props;
    let localRemoteQuickViews = {};
    if (quickViewsId) {
      if (quickViewsURL && ownerId) {
        let params = { quickViewsId, ownerId };
        try {
          localRemoteQuickViews = (await Axios.get(quickViewsURL, {
            params
          })).data;
        } catch (error) {
          this.props.showError('Failed to get quickviews from the service');
          console.error(error);
        }
      } else {
        let storageKey = `${process.env.REACT_APP_NAME}.${quickViewsId}.quickViews`;
        localRemoteQuickViews = JSON.parse(
          localStorage.getItem(storageKey) || '{}'
        );
      }
    }
    if (quickViews || quickViewsId) {
      quickViews = { ...(quickViews || {}), ...localRemoteQuickViews };
    }
    this.setState(
      prev => ({
        quickViewsConfig: quickViews,
        quickViews: ezQuickViewSelector(
          quickViews,
          prev,
          this.props.quickViewsId
        )
      }),
      () => {
        if (!isMounting) return;
        let quickView = this.props.quickView || this.props.defaultQuickView;
        if (quickView) {
          let { view } =
            this.state.quickViews.find(view => view.name === quickView) || {};
          if (view) this.setState({ ...view });
        }
      }
    );
  };
  saveQuickViews = async () => {
    let { quickViewsId, quickViewsURL, ownerId } = this.props;
    if (!quickViewsId) return;
    let { quickViewsConfig } = this.state;
    quickViewsConfig = stripNonCustomViews(quickViewsConfig);
    if (quickViewsURL) {
      let params = {
        quickViewsId,
        ownerId,
        quickViews: JSON.stringify(quickViewsConfig)
      };
      try {
        await Axios.put(quickViewsURL, params);
      } catch (error) {
        this.props.showError('Failed to save quickviews to the service');
        console.error(error);
      }
    } else {
      let storageKey = `${process.env.REACT_APP_NAME}.${quickViewsId}.quickViews`;
      localStorage.setItem(storageKey, JSON.stringify(quickViewsConfig));
    }
  };
  handleCreateQuickView = (name, group, icon, color) => {
    this.setState(prev => {
      let {
        quickViewsConfig,
        grouping,
        sortBy,
        sortOrder,
        generalSearch,
        activePage,
        itemsPerPage,
        filters,
        columns
      } = prev;
      columns = columns.map(col => ({ ID: col.ID, hidden: col.hidden }));
      let props = {
        custom: true,
        group,
        icon,
        color,
        view: {
          grouping,
          sortBy,
          sortOrder,
          generalSearch,
          activePage,
          itemsPerPage,
          filters,
          columns
        }
      };
      quickViewsConfig = { ...quickViewsConfig, [name]: props };
      return { quickViewsConfig };
    }, this.saveQuickViews);
  };
  handleEditQuickView = (name, newName, group, icon, color, updateData) => {
    if (updateData) {
      this.setState(prev => {
        let {
          quickViewsConfig,
          grouping,
          sortBy,
          sortOrder,
          generalSearch,
          activePage,
          itemsPerPage,
          filters,
          columns
        } = prev;
        columns = columns.map(col => ({ ID: col.ID, hidden: col.hidden }));
        let props = {
          custom: true,
          group,
          icon,
          color,
          view: {
            grouping,
            sortBy,
            sortOrder,
            generalSearch,
            activePage,
            itemsPerPage,
            filters,
            columns
          }
        };
        // quickViewsConfig = { ...quickViewsConfig, [name]: undefined, [newName]: props };
        quickViewsConfig = update(quickViewsConfig, {
          $unset: [name],
          [newName]: { $set: props }
        });
        return { quickViewsConfig };
      }, this.saveQuickViews);
    } else {
      this.setState(prev => {
        let { quickViewsConfig, editView } = prev;
        let props = { ...editView, group, icon, color };
        delete props.name;
        // console.log(props);
        // quickViewsConfig = { ...quickViewsConfig, [name]: undefined, [newName]: { ...editView, group, icon, color } };
        quickViewsConfig = update(quickViewsConfig, {
          $unset: [name],
          [newName]: { $set: props }
        });
        return { quickViewsConfig };
      }, this.saveQuickViews);
    }
  };
  handleDeleteQuickView = name => {
    this.setState(
      // (prev) => ({ quickViewsConfig: { ...prev.quickViewsConfig, [name]: undefined } }),
      prev => ({
        quickViewsConfig: update(prev.quickViewsConfig, { $unset: [name] })
      }),
      this.saveQuickViews
    );
  };
  handleShowQuickView = (evt, props) => {
    const { name, 'data-custom': custom, view } = props;
    // let { view, custom } = this.state.quickViews.find((view) => view.name === name) || {};
    if (this.props.onQuickViewChange) {
      this.props.onQuickViewChange(
        name,
        { ...this.props, quickView: name },
        !custom
      );
      if (this.props.quickView && this.props.quickView === name) {
        this.setState({ ...view });
      }
    }
    if (!this.props.quickView) {
      if (view) this.setState({ ...view });
    }
  };
  handleShareQuickView = (quickView, props) => {
    if (this.props.onQuickViewShare) {
      this.props.onQuickViewShare(quickView, { ...this.props, quickView });
    }
  };
  toggleQVModal = name => {
    let editView;
    if (typeof name === 'string') {
      editView = this.state.quickViews.find(qv => qv.name === name);
      // editView = this.state.quickViewsConfig[name];
    }
    this.setState(prev => ({ QVModalOpen: !prev.QVModalOpen, editView }));
  };

  handleGeneralSearch = (evt, data) => {
    let generalSearch = data.value;
    this.setState({ generalSearch, activePage: 1 });
  };
  handleGroupBy = col => {
    let newGroup = { col_id: col.ID, sortOrder: 'asc' };
    this.setState(prev => ({
      grouping: _.uniqBy(_.concat(prev.grouping || [], newGroup), 'col_id'),
      activePage: 1
    }));
  };
  handleRemoveGroupBy = col_id => () => {
    this.setState(prev => ({
      grouping: prev.grouping.filter(group => group.col_id !== col_id),
      activePage: 1
    }));
  };
  handleGroupSortToggle = col_id => () => {
    this.setState(prev => ({
      grouping: prev.grouping.map(group => {
        if (group.col_id === col_id)
          group = {
            ...group,
            sortOrder: group.sortOrder === 'asc' ? 'desc' : 'asc'
          };
        return group;
      }),
      activePage: 1
    }));
  };
  handleSort = field => () => {
    let sortBy = field;
    let sortOrder = 'ascending';
    this.setState(prev => {
      if (prev.sortBy === field) {
        if (prev.sortOrder === 'ascending') {
          sortOrder = 'descending';
        } else if (prev.sortOrder === 'descending') {
          sortBy = null;
          sortOrder = null;
        }
      }
      return { sortBy, sortOrder, activePage: 1 };
    });
  };

  handleColumnVisibilityToggle = col_id => () => {
    this.setState(prev => ({
      columns: prev.columns.map(col => {
        if (col.ID === col_id) col = { ...col, hidden: !col.hidden };
        return col;
      })
    }));
  };
  handleColumnReorder = (curIdx, newIdx) => {
    this.setState(prev => {
      const columns = prev.columns.slice();
      columns.splice(newIdx, 0, columns.splice(curIdx, 1)[0]);
      return { columns };
    });
  };
  handleFilterUpdate = (field, type) => value => {
    if (value === undefined) {
      this.setState(prev => ({
        filters: update(prev.filters, { $unset: [field] }),
        activePage: 1
      }));
    } else {
      this.setState(prev => ({
        filters: { ...prev.filters, [field]: { value, type } },
        activePage: 1
      }));
    }
  };
  handleItemsPerPageChange = (evt, data) => {
    this.setState({ itemsPerPage: data.value, activePage: 1 });
    // PAUL
    this.props.onInformItemsPerPage(data.value);
  };
  handlePageChange = (evt, data) => {
    this.setState({ activePage: data.activePage });
  };
  filterData = () => {
    this.setState(prev => {
      let { data = [] } = this.props;
      let { filters, generalSearch, columns } = prev;
      generalSearch = generalSearch.toLowerCase();
      let filteredData = data.filter(item => {
        // const values = Object.values(item);
        // const generalFilter =
        //   !generalSearch ||
        //   JSON.stringify(values)
        //     .toLowerCase()
        //     .includes(generalSearch.toLowerCase());
        const colFilters = _.every(
          _.concat(
            _.map(filters, (filter, field) =>
              filterTypes[filter.type].filter(item, field, filter.value)
            ),
            true
          )
        );
        return (
          colFilters &&
          columns.some(column => {
            return String(getFieldValue(item, column.field))
              .toLowerCase()
              .includes(generalSearch);
          })
        );
      });
      return { filteredData };
    });
  };
  // handleOnPageChange=()=>{

  // }
  // pageToProtein = (data, proteinToHighlight, itemsPerPage) => {
  //     const Index = _.findIndex(data, function(p) {
  //       return firstValue(p.Protein_Site) === proteinToHighlight;
  //     });
  //     const pageNumber = Math.ceil(Index / itemsPerPage);
  //     console.log(`Go to page ${pageNumber}`);
  //     // window.scrollTo(0, this.props.proteinToHighlightRow.offsetTop);
  //     this.handlePageChange({},{activePage: pageNumber})
  //     // ref.current.scoolInfo
  //     // const ele = document.getElementById("highlightedRow");
  //     // window.scrollTo(0, ele.offsetTop);
  // };

  render() {
    let {
      generalSearch,
      filters,
      columns,
      columnsConfig,
      sortBy,
      sortOrder,
      grouping,
      filteredData: data,
      itemsPerPage,
      quickViews,
      activePage
    } = this.state;
    let {
      data: rawData,
      exportBaseName,
      loading,
      additionalTemplateInfo,
      rowLevelStyleCalc,
      fetchData: reloadData,
      legend,
      extraHeaderItem,
      height,
      quickViewsId,
      quickViewsURL,
      generalSearchDebounceTime
      // columnsConfig,
      // itemsPerPage,
    } = this.props;
    let props = {
      generalSearch,
      filters,
      columns,
      sortBy,
      sortOrder,
      grouping,
      data,
      rawData,
      exportBaseName,
      loading,
      additionalTemplateInfo,
      rowLevelStyleCalc,
      reloadData,
      legend,
      extraHeaderItem,
      columnsConfig,
      itemsPerPage,
      height,
      generalSearchDebounceTime,
      activePage,
      onPageChange: this.handlePageChange
    };
    if (!this.props.disableGeneralSearch)
      props.onGeneralSearch = this.handleGeneralSearch;
    if (!this.props.disableGrouping) {
      props.onGroupBy = this.handleGroupBy;
      props.onRemoveGroupBy = this.handleRemoveGroupBy;
      props.onGroupSortToggle = this.handleGroupSortToggle;
    }
    if (!this.props.disableSort) {
      props.onSort = this.handleSort;
    }
    if (!this.props.disableColumnVisibilityToggle) {
      props.onColumnVisibilityToggle = this.handleColumnVisibilityToggle;
    }
    if (!this.props.disableColumnReorder) {
      props.onColumnReorder = this.handleColumnReorder;
    }
    if (!this.props.disableFilters) {
      props.onFilterUpdate = this.handleFilterUpdate;
    }
    if (quickViewsId && !this.props.disableQuickViewEditing) {
      props.onCreateQuickView = this.toggleQVModal;
      props.onRemoveQuickView = this.handleDeleteQuickView;
      props.onEditQuickView = this.toggleQVModal;
      if (quickViewsURL && this.props.onQuickViewShare) {
        props.onShareQuickView = this.handleShareQuickView;
      }
    }
    if (quickViews) {
      props.quickViews = quickViews;
      props.onShowQuickView = this.handleShowQuickView;
    }
    return (
      <>
        <QuickViewModal
          open={this.state.QVModalOpen}
          onClose={this.toggleQVModal}
          quickViews={quickViews}
          onCreateQuickView={this.handleCreateQuickView}
          onEditQuickView={this.handleEditQuickView}
          values={this.state.editView}
        />
        <QHGrid
          {...props}
          onItemsPerPageChange={this.handleItemsPerPageChange}
        />
      </>
    );
  }
}

/**
 *
 * @param {[{}]} columns
 */
function mapColumnsConfig(columns = []) {
  return columns.map(column => {
    let ID = column.ID || getField(column.field);
    return { ...column, ID };
  });
}

function firstValue(value) {
  if (value) {
    const firstValue = value.split(';')[0];
    return firstValue;
  }
}
