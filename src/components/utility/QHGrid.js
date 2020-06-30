import React from 'react';
import update from 'immutability-helper';
import PropTypes from 'prop-types';
import propTypes from 'airbnb-prop-types';
import XLSX from 'xlsx';
import {
  Table,
  Popup,
  Menu,
  Header,
  Button,
  Icon,
  Input,
  Pagination,
  Dropdown,
  Dimmer,
  Loader,
  Image,
  // Paul start
  Message,
  // Paul end
} from 'semantic-ui-react';

import { filterTypes } from './FilterTypeConfig';

import _ from 'lodash';
import moment from 'moment';
// Paul start
import excel_logo from '../../resources/excel.png';
import excel_logo_custom from '../../resources/excel3.png';
// Paul end

import './QHGrid.scss';
import {
  QHGridSelector,
  columnsSelector,
  QHGridBodyHeadersHandleFilterUpdate,
  getFieldValue,
  getField,
  getTemplate,
  getExportTemplate,
} from './selectors/QHGridSelector';

//import { DragDropContext } from 'react-dnd';
//import HTML5Backend from 'react-dnd-html5-backend';

const paginationOpts = [
  {
    text: '5',
    value: 5,
  },
  {
    text: '10',
    value: 10,
  },
  {
    text: '15',
    value: 15,
  },
  {
    text: '30',
    value: 30,
  },
  {
    text: '45',
    value: 45,
  },
  {
    text: '60',
    value: 60,
  },
  {
    text: '75',
    value: 75,
  },
  {
    text: '100',
    value: 100,
  },
  {
    text: '250',
    value: 250,
  },
  {
    text: '500',
    value: 500,
  },
  {
    text: '1000',
    value: 1000,
  },
  // {
  //   text: 'All',
  //   // title: 'Warning: Slow!',
  //   // value: 'All',
  //   value: 2000, //Infinity,
  // },
];
// const paginationOptsNoAll = paginationOpts;
// .slice(0, -1)
// .concat([
//   { text: '2000', value: 2000 },
//   { text: 'All', title: 'DO NOT USE UNLESS YOU ARE USING A VERY POWERFUL COMPUTER', value: Infinity },
// ]);
// const stubArray = [];
const stubFunction = () => {};
const filteredIcon = (
  <Icon.Group>
    <Icon name="filter" color="blue" />
    <Icon corner name="asterisk" color="blue" />
  </Icon.Group>
);
const unfilteredIcon = <Icon name="filter" />;

class QHGridHeader extends React.PureComponent {
  state = {
    generalSearch: this.props.generalSearch || '',
    prevGeneralSearch: '',
  };
  togglePopup = (ev, data) => {
    const name = `${data.name}Open`;
    this.setState(prev => ({ [name]: !prev[name] }));
  };
  handlePropsGeneralSearch = _.debounce((ev, data) => {
    // this.setState({ prevGeneralSearch: data.value });
    this.props.onGeneralSearch(ev, data);
  }, this.props.generalSearchDebounceTime);
  handleGeneralSearch = (ev, data) => {
    this.setState(() => ({ generalSearch: data.value }));
    this.handlePropsGeneralSearch(ev, data);
  };
  handleClearGeneralSearch = (ev, data) => {
    if (this.state.generalSearch === '') return;
    this.setState(() => ({ generalSearch: '' }));
    const newData = { ...data, value: '' };
    this.props.onGeneralSearch(ev, newData);
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    let newState = {};
    if (nextProps.generalSearch !== prevState.prevGeneralSearch) {
      newState.generalSearch = nextProps.generalSearch;
      newState.prevGeneralSearch = nextProps.generalSearch;
    }
    return newState;
  }
  // closePopup=(ev,data)=>{
  //   this.setState(()=>({[data.name]:false}))
  // }
  //For Grouping
  onDrop = evt => {
    evt.preventDefault();
    const col = JSON.parse(evt.dataTransfer.getData('col'));
    const groupBy = this.props.onGroupBy || stubFunction;
    groupBy(col);
  };
  allowDrop = evt => {
    evt.preventDefault();
  };
  saveCurrentSettings = () => {
    this.setState(() => ({ customizeOpen: false }));
    this.props.onSaveSettings();
  };
  clearSavedSettings = () => {
    this.setState(() => ({ customizeOpen: false }));
    this.props.onClearSettings();
  };
  handleResetFiltersToCustomView = () => {
    this.setState(() => ({ filtersOpen: false }));
    this.props.onResetFiltersToCustomView();
  };
  handleResetFiltersToDefaultView = () => {
    this.setState(() => ({ filtersOpen: false }));
    this.props.onResetFiltersToDefaultView();
  };
  handleFiltersResetAll = () => {
    this.setState(() => ({ filtersOpen: false }));
    this.props.onResetFiltersAll();
  };
  handleShowQuickView = (ev, data) => {
    this.setState(() => ({ quickOpen: false }));
    this.props.onShowQuickView(ev, data);
  };
  handleCreateQuickView = () => {
    this.setState(() => ({ quickOpen: false }));
    this.props.onCreateQuickView();
  };
  handleRemoveQuickView = (ev, props) => {
    ev.stopPropagation();
    this.setState(() => ({ quickOpen: false }));
    // console.log('remove QuickView', props.name);
    this.props.onRemoveQuickView(props.name);
  };
  handleEditQuickView = (ev, props) => {
    ev.stopPropagation();
    this.setState(() => ({ quickOpen: false }));
    // console.log('remove QuickView', props.name);
    this.props.onEditQuickView(props.name);
  };
  handleShareQuickView = (ev, props) => {
    ev.stopPropagation();
    this.setState(() => ({ quickOpen: false }));
    // console.log('remove QuickView', props.name);
    this.props.onShareQuickView(props.name, this.props);
  };
  // Paul start
  getExportButton = columns => {
    const BreadcrumbPopupStyle = {
      backgroundColor: '2E2E2E',
      borderBottom: '2px solid var(--color-primary)',
      color: '#FFF',
      padding: '1em',
      maxWidth: '50vw',
      fontSize: '13px',
      wordBreak: 'break-all',
    };

    if (
      this.props.exportBaseName === 'Enrichment_Analysis' ||
      this.props.exportBaseName === 'Differential_Phosphorylation_Analysis'
    ) {
      return (
        <Image
          src={excel_logo_custom}
          onClick={this.props.exportExcel(columns)}
          style={{ float: 'right', cursor: 'pointer' }}
        />
      );
    } else if (this.props.exportBaseName === 'VolcanoPlot_Filtered_Results') {
      return null;
    } else {
      return (
        <Popup
          trigger={
            <Image
              src={excel_logo}
              className="ExcelLogo"
              // avatar
              size="mini"
              onClick={this.props.exportExcel(columns)}
              style={{ float: 'right', cursor: 'pointer' }}
            />
          }
          style={BreadcrumbPopupStyle}
          inverted
          basic
          position="bottom right"
          content="Export Data to Excel"
        />
      );
    }
  };
  // Paul end
  render() {
    const { customizeOpen, columnOpen, filtersOpen, quickOpen } = this.state;
    const { columns, grouping, numColumns } = this.props;
    const columnMenuItems = _.map(_.sortBy(columns, 'title'), (col, idx) => {
      const handleColumnVisibilityToggle = this.props.onColumnVisibilityToggle
        ? this.props.onColumnVisibilityToggle(col.ID)
        : stubFunction;

      return (
        <Dropdown.Item
          key={col.ID}
          onClick={(evt, data) => {
            evt.stopPropagation();
            handleColumnVisibilityToggle();
          }}
        >
          {!col.hidden && <Icon color="green" name="checkmark" />}
          {col.title}
        </Dropdown.Item>
      );
    });

    const groupMenuItems = _.map(grouping, (group, idx) => {
      const col =
        _.find(columns, col => {
          return col.ID === group.col_id;
        }) || {};
      const sortIcon =
        group.sortOrder === 'asc' ? (
          <Icon name="long arrow alternate up" />
        ) : (
          <Icon name="long arrow alternate down" />
        );

      const handleRemoveGroupBy = this.props.onRemoveGroupBy
        ? this.props.onRemoveGroupBy(group.col_id)
        : stubFunction;
      const handleGroupSortToggle = this.props.onGroupSortToggle
        ? this.props.onGroupSortToggle(group.col_id)
        : stubFunction;
      return (
        <Button.Group
          key={col.ID}
          inverted
          size="mini"
          compact
          style={{ marginRight: '10px' }}
        >
          <Button inverted size="mini" compact onClick={handleGroupSortToggle}>
            {sortIcon}
            {col.title}
          </Button>
          <Button
            inverted
            size="mini"
            compact
            color="red"
            basic
            onClick={handleRemoveGroupBy}
          >
            X
          </Button>
        </Button.Group>
      );
    });
    const quickViewGroups = _.groupBy(this.props.quickViews, 'group');
    const quickViewMenu = _.map(quickViewGroups, (qvGroup, groupName) => {
      const items = _.map(qvGroup, qv => (
        <Menu.Item
          key={qv.name}
          view={qv.view}
          name={qv.name}
          data-custom={qv.custom}
          onClick={this.handleShowQuickView}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {qv.icon && (
            <Icon className={`quickViewIcon ${qv.color}`} name={qv.icon} />
          )}
          {qv.name}
          <div>
            {qv.custom && this.props.onShareQuickView && (
              <Button
                title="Share View"
                // icon="pencil"
                icon={<Icon name="share square" color="black" />}
                compact
                size="mini"
                name={qv.name}
                onClick={this.handleShareQuickView}
                className="QHGrid--ButtonClear"
              />
            )}
            {qv.custom && this.props.onEditQuickView && (
              <Button
                title="Edit View"
                // icon="pencil"
                icon={<Icon name="pencil" color="black" />}
                compact
                size="mini"
                name={qv.name}
                onClick={this.handleEditQuickView}
                className="QHGrid--ButtonClear"
              />
            )}
            {qv.custom && this.props.onRemoveQuickView && (
              <Button
                title="Delete View"
                icon={<Icon name="remove" color="red" />}
                // icon="remove"
                color="red"
                compact
                size="mini"
                name={qv.name}
                onClick={this.handleRemoveQuickView}
                className="QHGrid--ButtonClear"
              />
            )}
          </div>
        </Menu.Item>
      ));
      if (groupName !== 'undefined') {
        return (
          <Dropdown key={groupName} item text={groupName}>
            <Dropdown.Menu>{items}</Dropdown.Menu>
          </Dropdown>
        );
      } else {
        return items;
      }
    });
    const showFiltersMenu =
      this.props.onResetFiltersAll ||
      this.props.onResetFiltersToCustomView ||
      this.props.onResetFiltersToDefaultView;
    // Paul start
    const ExportButton = this.getExportButton(columns);
    // Paul end
    return (
      <Table
        compact="very"
        size="small"
        style={{ marginBottom: 0, paddingBottom: 0 }}
      >
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell
              colSpan={numColumns + grouping.length}
              style={{ backgroundColor: '#1678C2', color: 'white' }}
              // className="QHGrid--header"
            >
              {this.props.onGeneralSearch && (
                <Input
                  className="QHGrid--generalSearch"
                  icon="search"
                  iconPosition="left"
                  placeholder="Search Table"
                  value={this.state.generalSearch}
                  onChange={this.handleGeneralSearch}
                  action={{
                    color: 'red',
                    icon: 'x',
                    onClick: this.handleClearGeneralSearch,
                    title: 'Clear Search',
                  }}
                  // actionPosition="right"
                />
              )}
              {this.props.onSaveSettings && (
                <Popup
                  trigger={
                    <Button inverted>
                      <Icon name="setting" />
                      Customize
                    </Button>
                  }
                  position="bottom center"
                  on="click"
                  open={customizeOpen}
                  onOpen={this.togglePopup}
                  onClose={this.togglePopup}
                  name={'customize'}
                >
                  <Header as="h3" dividing>
                    Customize
                  </Header>

                  <Menu vertical>
                    <Menu.Item onClick={this.saveCurrentSettings}>
                      {this.props.showSaveSettingsSuccessful && (
                        <Icon name="checkmark" color="green" />
                      )}
                      Remember Current Filters
                    </Menu.Item>

                    <Menu.Item onClick={this.clearSavedSettings}>
                      Clear Saved Settings
                    </Menu.Item>
                    {/* <Menu.Item onClick={} */}
                  </Menu>
                </Popup>
              )}
              {showFiltersMenu && (
                <Popup
                  trigger={
                    <Button inverted>
                      <Icon name="refresh" />
                      Reset Filters
                    </Button>
                  }
                  position="bottom center"
                  on="click"
                  open={filtersOpen}
                  onOpen={this.togglePopup}
                  onClose={this.togglePopup}
                  name={'filters'}
                >
                  <Header as="h3" dividing>
                    Reset Filters
                  </Header>

                  <Menu vertical>
                    {this.props.onResetFiltersToCustomView && (
                      <Menu.Item onClick={this.handleResetFiltersToCustomView}>
                        Back To My Custom View
                      </Menu.Item>
                    )}

                    {this.props.onResetFiltersToDefaultView && (
                      <Menu.Item onClick={this.handleResetFiltersToDefaultView}>
                        Reset To Default View
                      </Menu.Item>
                    )}

                    {this.props.onResetFiltersAll && (
                      <Menu.Item onClick={this.handleFiltersResetAll}>
                        Clear All Filters
                      </Menu.Item>
                    )}
                  </Menu>
                </Popup>
              )}
              {(!!this.props.quickViews.length ||
                !!this.props.onCreateQuickView) && (
                <Popup
                  trigger={
                    <Button inverted>
                      <Icon name="lightning" />
                      Quick Views
                    </Button>
                  }
                  position="bottom center"
                  on="click"
                  open={quickOpen}
                  onOpen={this.togglePopup}
                  onClose={this.togglePopup}
                  name={'quick'}
                  flowing
                >
                  <Header as="h3" dividing>
                    Quick Views
                  </Header>
                  <Menu vertical fluid>
                    {!!this.props.onCreateQuickView && (
                      <Menu.Item
                        // style={{ backgroundColor: 'green' }}
                        // color="green"
                        onClick={this.handleCreateQuickView}
                      >
                        <Icon name="add" color="green" />
                        Add Quick View
                      </Menu.Item>
                    )}
                    {quickViewMenu}
                  </Menu>
                </Popup>
              )}
              {this.props.onColumnVisibilityToggle && (
                <Dropdown
                  scrolling
                  trigger={
                    <Button inverted>
                      <Icon name="columns" />
                      Columns
                    </Button>
                  }
                  icon={null}
                  open={columnOpen}
                  onOpen={this.togglePopup}
                  onClose={this.togglePopup}
                  name={'column'}
                >
                  <Dropdown.Menu>
                    <Dropdown.Header>Columns</Dropdown.Header>
                    <Dropdown.Divider />
                    {columnMenuItems}
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {this.props.legend && (
                <Popup
                  flowing
                  trigger={
                    <Button inverted>
                      <Icon name="info circle" />
                      Legend
                    </Button>
                  }
                  children={this.props.legend}
                />
              )}
              {/* Paul start */}
              {!this.props.loading &&
                !!this.props.exportBaseName &&
                ExportButton}
              {/* Paul end */}
              {this.props.extraHeaderItem}
            </Table.HeaderCell>
          </Table.Row>
          {this.props.onGroupBy && (
            <Table.Row>
              <Table.HeaderCell
                colSpan={numColumns + grouping.length}
                style={{
                  backgroundColor: '#1678C2',
                  color: 'white',
                  borderRadius: 0,
                  borderTop: '2px solid white',
                }}
                onDrop={this.onDrop}
                onDragOver={this.allowDrop}
              >
                {groupMenuItems}
                {/*groupMenuItems.length === 0 && 'Drag a column header and drop it here to group by that column'*/}
                Drag a column header and drop it here to group by that column
              </Table.HeaderCell>
            </Table.Row>
          )}
        </Table.Header>
      </Table>
    );
  }
}

class QHGridBodyHeaders extends React.PureComponent {
  state = {
    colDraggingIndex: null,
    colHoverIndex: null,
  };

  setColDraggingIndex = idx => {
    this.setState({ colDraggingIndex: idx });
  };
  setColHoverIndex = idx => {
    this.setState({ colHoverIndex: idx });
  };

  handleHeaderDragStart = col => evt => {
    evt.dataTransfer.setData('col', JSON.stringify(col));
    this.setColDraggingIndex(col.QHgridIndex);
  };
  handleHeaderDrop = col => evt => {
    evt.preventDefault();
    if (this.state.colDraggingIndex === col.QHgridIndex) {
      return;
    }

    const handleColumnReorder = this.props.onColumnReorder || stubFunction;
    handleColumnReorder(this.state.colDraggingIndex, col.QHgridIndex);
    this.setState(() => ({ colDraggingIndex: null }));
  };
  handleHeaderDragEnd = evt => {
    evt.preventDefault();
    this.setState(() => ({ colDraggingIndex: null, colHoverIndex: null }));
    // this.setColDraggingIndex(null);
    // this.setColHoverIndex(null);
  };
  handleHeaderDragOver = evt => {
    evt.preventDefault();
  };
  handleHeaderDragEnter = col => evt => {
    evt.preventDefault();
    this.setState(() => ({ colHoverIndex: col.QHgridIndex }));
    //console.log('entered:' + idx)
    // this.setColHoverIndex(col.QHgridIndex);
  };
  handleHeaderDragLeave = col => evt => {
    evt.preventDefault();
    this.setState(prev => {
      if (prev.colHoverIndex === col.QHgridIndex) {
        return { colHoverIndex: null };
      }
    });
    //console.log('left: ' + idx)
    // if (this.state.colHoverIndex === col.QHgridIndex) {
    //   this.setState(() => ({ colHoverIndex: null }));
    //   // this.setColHoverIndex(null);
    // }
  };
  render() {
    const leftHoverStyle = {
      borderLeft: '5px solid #1678C2',
      whiteSpace: 'nowrap',
    };
    const rightHoverStyle = {
      borderRight: '5px solid #1678C2',
      whiteSpace: 'nowrap',
    };
    return _.map(this.props.visibleColumns, col => {
      let field = getField(col.field);
      let ID = col.ID;
      let sortProps = col.sortDisabled
        ? {}
        : {
            sorted: this.props.sortBy === ID ? this.props.sortOrder : null,
            onClick: this.props.onSort ? this.props.onSort(ID) : null,
          };
      const dragProps = {
        draggable: !!this.props.onColumnReorder,
        onDragStart: this.handleHeaderDragStart(col),
        onDrop: this.handleHeaderDrop(col),
        onDragEnd: this.handleHeaderDragEnd,
        onDragOver: this.handleHeaderDragOver,
        onDragEnter: this.handleHeaderDragEnter(col),
        onDragLeave: this.handleHeaderDragLeave(col),
      };

      let style = {
        whiteSpace: 'nowrap',
      };
      if (
        this.state.colDraggingIndex < this.state.colHoverIndex &&
        this.state.colHoverIndex === col.QHgridIndex
      ) {
        style = rightHoverStyle;
      } else if (
        this.state.colDraggingIndex > this.state.colHoverIndex &&
        this.state.colHoverIndex === col.QHgridIndex
      ) {
        style = leftHoverStyle;
      }

      // if (col.sortDisabled) {
      //   sortProps = {};
      // }
      const filterType = _.get(col, 'filterable.type');
      const filterProps = _.get(col, 'filterable.props');
      const FilterDropdown = _.get(
        filterTypes,
        '[' + filterType + '].component',
      );
      const filterVals = _.get(this.props, 'filters.' + field + '.value'); // || stubArray;
      return (
        <Table.HeaderCell
          {...(col.headerAttributes || {})}
          className={this.state.colDraggingIndex !== null ? 'dragging' : ''}
          key={col.ID || col.title}
          {...sortProps}
          {...dragProps}
          style={style}
          nowrap="true"
          collapsing
        >
          {col.title}
          {!_.isUndefined(FilterDropdown) && (
            <FilterDropdown
              selectedOpts={filterVals}
              onChange={QHGridBodyHeadersHandleFilterUpdate(
                field,
                filterType,
                this.props.onFilterUpdate,
              )}
              trigger={
                filterVals /*.length > 0*/ ? filteredIcon : unfilteredIcon
              }
              data={this.props.rawData}
              field={getField(col.field)}
              {...filterProps}
            />
          )}
        </Table.HeaderCell>
      );
    });
  }
}

class QHGridBody extends React.PureComponent {
  state = { hidden: {} };
  static getDerivedStateFromProps(nextProps, prevState) {
    const newState = {};
    if (nextProps.grouping !== prevState.grouping) {
      newState.grouping = nextProps.grouping;
      newState.hidden = {};
    }
    return newState;
  }
  handleToggle = key => evt => {
    this.setState(prev => update(prev, { hidden: { $toggle: [key] } }));
  };
  render() {
    const {
      itemKeyMap,
      grouping,
      visibleColumns,
      groupLengths,
      slicedGroupLengths,
      slicedData,
      startIndex,
    } = this.props;

    const numColumns = visibleColumns.length;
    let curRow = 0;
    const makeBody = (idx = 0, groupLengthsKey = '') => (
      data,
      groupName,
      _ign,
    ) => {
      const curKey = groupLengthsKey + groupName;
      const hidden = this.state.hidden[curKey];
      // console.log(idx, data, groupName);
      let data_rows = [];
      let children = [];
      if (_.isArray(data)) {
        if (data.length === 0) {
          return null;
        }
        if (!hidden) {
          data_rows = _.map(data, (item, idx) => {
            const rowLevelStyle = this.props.rowLevelStyleCalc(item, ++curRow);
            // Paul start
            let highlightClass = '';
            let maxHighlightId = '';
            let rowHighlightMax = false;
            let rowHighlightOther = false;
            if (
              item[this.props.additionalTemplateInfo.elementId] != null &&
              this.props.additionalTemplateInfo !== '' &&
              this.props.additionalTemplateInfo != null
            ) {
              if (
                item[this.props.additionalTemplateInfo.elementId] ===
                this.props.additionalTemplateInfo.rowHighlightMax
              ) {
                rowHighlightMax = true;
              }
              if (
                this.props.additionalTemplateInfo?.rowHighlightOther?.includes(
                  item[this.props.additionalTemplateInfo.elementId],
                )
              ) {
                rowHighlightOther = true;
              }
            }

            if (rowHighlightMax) {
              highlightClass = 'rowHighlightMax';
              maxHighlightId = 'rowHighlightMax';
            }

            if (rowHighlightOther) {
              highlightClass = 'rowHighlightOther';
            }
            // Paul end
            return (
              <Table.Row
                onClick={evt =>
                  this.props.onRowClick(evt, item, startIndex + idx)
                }
                key={itemKeyMap(item) || idx}
                id={maxHighlightId}
                className={highlightClass}
                style={rowLevelStyle}
              >
                {_.map(grouping, (_group, group_idx) => {
                  return (
                    <Table.Cell
                      style={{ backgroundColor: '#F2F2F2' }}
                      key={group_idx}
                      collapsing
                    />
                  );
                })}
                {_.map(visibleColumns, (col, col_idx) => {
                  let template = getTemplate(col);
                  return (
                    <Table.Cell key={col.ID || col.title}>
                      {template === undefined
                        ? getFieldValue(item, col.field, col.type)
                        : template(
                            getFieldValue(item, col.field, col.type),
                            item,
                            this.props.additionalTemplateInfo,
                          )}
                    </Table.Cell>
                  );
                })}
              </Table.Row>
            );
          });
        }
        if (grouping.length === 0) {
          return [data_rows];
        }
      } else {
        if (!hidden) {
          children = _.map(
            data,
            makeBody(idx + 1, groupLengthsKey + groupName),
          );
          if (children.every(val => val === null)) {
            return null;
          }
        }
      }
      const fullGroupLength = groupLengths[curKey];
      const slicedGroupLength = slicedGroupLengths[curKey];
      const head = (
        <Table.Row key={`\u200C${groupName}`}>
          {_.map(_.range(idx), r_idx => {
            return (
              <Table.Cell
                style={{ backgroundColor: '#F2F2F2' }}
                key={r_idx}
                collapsing
              />
            );
          })}
          <Table.Cell
            onClick={this.handleToggle(curKey)}
            colSpan={numColumns + grouping.length - idx}
            style={{ cursor: 'pointer', backgroundColor: '#F2F2F2' }}
            collapsing
          >
            <Icon name={`caret ${hidden ? 'right' : 'down'}`} />
            <strong>
              {grouping[idx].title}: {groupName} - (
              {fullGroupLength === slicedGroupLength
                ? `${fullGroupLength} Entr${
                    fullGroupLength.length === 1 ? 'y' : 'ies'
                  }`
                : `${slicedGroupLength}/${fullGroupLength} Entries`}
              )
            </strong>
          </Table.Cell>
        </Table.Row>
      );

      return [head, ...children, ...data_rows];
      // return (

      // )
    };
    const body = _.map(slicedData, makeBody());
    return body;
  }
}
/*
* Functions Parent Component Must Provide:
- handleGroupBy
- handleRemoveGroupBy
- handleGroupSortToggle
- handleSort
- handleColumnReorder
- handleColumnVisibilityToggle
- handleGeneralSearch
- handleResetFiltersToCustomView
- handleResetFiltersToDefaultView
- handleFiltersResetAll
- handlePageChange
- handleItemsPerPageChange

*Props Parent Must Pass:
- data
- columns
- grouping
- activePage
- generalSearch
- quickViews
- itemsPerPage
- sortBy
- sortOrder
*/
export class QHGrid extends React.PureComponent {
  state = { activePage: 1, itemsPerPage: 15 };
  bodyRef = null;
  setBodyRef = element => {
    this.bodyRef = element;
  };
  handlePageChange = (event, data) => {
    if (this.props.activePage !== undefined) {
      this.props.onPageChange(event, data);
    } else {
      this.setState({ activePage: data.activePage });
    }
    if (this.bodyRef) {
      this.bodyRef.scrollTop = 0;
    }
  };
  handleItemsPerPageChange = (event, data) => {
    if (this.props.itemsPerPage !== undefined) {
      if (this.props.itemsPerPage !== data.value)
        this.props.onItemsPerPageChange(event, data);
    } else {
      if (this.state.itemsPerPage !== data.value)
        this.setState({ itemsPerPage: data.value });
    }
  };
  // Paul start
  scrollElement = () => {
    const _this = this;
    window.requestAnimationFrame(function() {
      if (_this.bodyRef !== null) {
        const row = _this.bodyRef.getElementsByClassName('rowHighlightMax');
        if (row.length !== 0) {
          _this.bodyRef.scrollTo({
            top: row[0].offsetTop - 40,
            left: 0,
            behavior: 'smooth',
          });
        }
      }
    });
  };
  // Paul end

  componentDidMount = () => {
    // this.scrollElement();
  };
  componentDidUpdate = (prevProps, prevState) => {
    if (
      this.props.activePage === undefined &&
      this.props.data !== prevProps.data
    ) {
      this.setState({ activePage: 1 });
    }
    // this.scrollElement();
  };

  //For Grouping
  onDrop = evt => {
    evt.preventDefault();
    const col = JSON.parse(evt.dataTransfer.getData('col'));
    const groupBy = this.props.onGroupBy || function() {};
    groupBy(col);
  };
  allowDrop = evt => {
    evt.preventDefault();
  };

  exportExcel = cols => async (
    evt,
    data = (this.props.getExportData && this.props.getExportData()) ||
      this.props.data,
  ) => {
    data = await data;
    let wb = XLSX.utils.book_new();
    //XLSX.utils.book_append_sheet(wb, ws, ws_name);
    const visibleColumns = _.filter(cols, col => {
      const notHidden = !col.hidden;
      const hideOnExport = col.hideOnExport;

      var visibleDueToOtherCol = false;
      if (!_.isUndefined(col.exportIfVisible)) {
        const dependentCol = _.find(cols, depCol => {
          return depCol.ID === col.exportIfVisible.ID;
        });

        visibleDueToOtherCol = !dependentCol.hidden;
      }
      return (notHidden && !hideOnExport) || visibleDueToOtherCol;
    });
    /*
    const exportData = _.concat(
        [_.reduce(cols, (accumulator, col) => {
            if(!col.hidden) {
                accumulator.push(col.title)
            }
            return accumulator
        }, [])],
        _.map(data, (item) => {
            return _.reduce(cols, (accumulator, col) => {
                if(!col.hidden) {
                    accumulator.push(item[col.field])
                }
                return accumulator
            }, [])
        })
    )*/
    const exportData = _.concat(
      [
        _.map(visibleColumns, col => {
          return col.exportTitle || col.title;
        }),
      ],
      _.map(data, item => {
        return _.map(visibleColumns, col => {
          let template = getExportTemplate(col);
          let value = getFieldValue(item, col.field, col.type);
          if (template)
            value = template(value, item, this.props.additionalTemplateInfo);
          // var value = getFieldValue(item, col.field, col.type); // item[col.field];

          if (_.isArray(value)) {
            value = _.join(value, ' : ');
          }
          //return moment.isMoment(value) ? moment(value).format('D/MMM/YYYY') : value
          return moment.isMoment(value) ? moment(value).toDate() : value;
        });
      }),
    );
    //const visibleColumns = _.filter(cols, (col) => { return !col.hidden})
    const wscols = _.map(visibleColumns, col => {
      return {
        width: _.max(
          _.map(data, item => {
            // var value = item[col.field];
            let template = getExportTemplate(col);
            let value = getFieldValue(item, col.field, col.type);
            if (template)
              value = template(value, item, this.props.additionalTemplateInfo);

            if (_.isArray(value)) {
              value = _.join(value, ' : ');
            }
            //console.log(item[col.field], moment.isMoment(item[col.field]))
            const col_width = moment.isMoment(value)
              ? 18
              : (value || '').length * 1.5;

            return col_width > 70 ? 70 : col_width < 18 ? 18 : col_width;
          }),
        ),
      };
    });
    //console.log(wscols)

    var ws = XLSX.utils.aoa_to_sheet(exportData, { cellDates: true });
    ws['!autofilter'] = {
      ref: 'A1:' + XLSX.utils.encode_col(visibleColumns.length - 1) + '1',
    };
    ws['!cols'] = wscols;
    XLSX.utils.book_append_sheet(wb, ws, 'report');
    //console.log(ws)
    XLSX.writeFile(
      wb,
      `${this.props.exportBaseName} - ${moment().format('DD/MMM/YYYY')}.xlsx`,
    );
  };

  static defaultProps = {
    data: [],
    rawData: [],
    columns: [],
    // columnsConfig: [],
    grouping: [],
    filters: {},
    quickViews: [],
    sortBy: null,
    sortOrder: null,
    rowLevelStyleCalc: () => {},
    loadingMessage: 'Loading Data. Please Wait.',
    emptyMessage: 'No Results',
    height: '70vh',
    generalSearchDebounceTime: 500,
  };
  render() {
    const data = this.props.data; // || [];
    const { columns, visibleColumns, itemKeyMap } = columnsSelector(
      this.props.columns,
    );
    const { columnsConfig = this.props.columns } = this.props;

    const numColumns = visibleColumns.length;
    let numRows = data.length;
    if (this.props.isPaginated) {
      numRows = this.props.totalRows;
    }

    const activePage = this.props.activePage || this.state.activePage;
    let itemsPerPage = this.props.itemsPerPage || this.state.itemsPerPage;
    const numPages =
      _.ceil(numRows / itemsPerPage) > 0 ? _.ceil(numRows / itemsPerPage) : 1;

    let realStartIndex = (activePage - 1) * itemsPerPage || 0;
    let realEndIndex =
      activePage * itemsPerPage > numRows
        ? numRows - 1
        : activePage * itemsPerPage - 1;
    let startIndex = realStartIndex;
    let endIndex = realEndIndex;
    if (this.props.isPaginated) {
      startIndex = 0;
      endIndex = itemsPerPage;
    }

    const {
      grouping,
      slicedData,
      groupLengths,
      slicedGroupLengths,
    } = QHGridSelector(
      columnsConfig,
      this.props.grouping,
      this.props.data,
      this.props.sortBy,
      this.props.sortOrder,
      startIndex,
      endIndex,
      this.props.isPaginated,
    );
    let headerProps = {};
    {
      let {
        onSaveSettings,
        showSaveSettingsSuccessful,
        onClearSettings,
        onResetFiltersToCustomView,
        onResetFiltersToDefaultView,
        onResetFiltersAll,
        onGroupBy,
        onRemoveGroupBy,
        onGroupSortToggle,
        onColumnVisibilityToggle,
        onShowQuickView,
        onCreateQuickView,
        onRemoveQuickView,
        onEditQuickView,
        onShareQuickView,
        quickViews,
        loading,
        generalSearch,
        onGeneralSearch,
        legend,
        exportBaseName,
        generalSearchDebounceTime,
        extraHeaderItem,
      } = this.props;
      headerProps = {
        columns,
        grouping,
        numColumns,
        onSaveSettings,
        showSaveSettingsSuccessful,
        onClearSettings,
        onResetFiltersToCustomView,
        onResetFiltersToDefaultView,
        onResetFiltersAll,
        onGroupBy,
        onRemoveGroupBy,
        onGroupSortToggle,
        onColumnVisibilityToggle,
        onShowQuickView,
        onCreateQuickView,
        onRemoveQuickView,
        onEditQuickView,
        onShareQuickView,
        quickViews,
        loading,
        generalSearch,
        onGeneralSearch,
        legend,
        exportExcel: this.exportExcel,
        exportBaseName,
        generalSearchDebounceTime,
        extraHeaderItem,
      };
    }
    const headers = (
      <QHGridBodyHeaders
        filterTypes={filterTypes}
        filters={this.props.filters}
        onFilterUpdate={this.props.onFilterUpdate}
        rawData={this.props.rawData}
        onColumnReorder={this.props.onColumnReorder}
        sortBy={this.props.sortBy}
        sortOrder={this.props.sortOrder}
        onSort={this.props.onSort}
        visibleColumns={visibleColumns}
      />
    );

    return (
      <div
        className={'QHGrid'}
        style={{ width: '100%', margin: 0, padding: 0 }}
      >
        <Dimmer active={this.props.loading}>
          <Loader>{this.props.loadingMessage}</Loader>
        </Dimmer>
        <QHGridHeader {...headerProps} />
        <div
          // Paul start
          className="QHGridHeaderDiv"
          // Paul end
          style={{
            margin: 0,
            padding: 0,
            width: '100%',
            height: `calc(${this.props.height})`,
            overflowX: 'auto',
            overflowY: 'auto',
          }}
          ref={this.setBodyRef}
        >
          <Table
            className={'QHGrid--body'}
            fixed={this.props.loading && !this.props.isPaginated}
            striped
            sortable={!!this.props.onSort}
            selectable
            celled
            compact="very"
            size="small"
            style={{
              marginTop: 0,
              paddingTop: 0,
              borderRadius: 0,
              marginBottom: 0,
              paddingBottom: 0,
              fontSize: 12,
            }}
          >
            <Table.Header>
              <Table.Row>
                {_.map(grouping, (group, group_idx) => {
                  return (
                    <Table.HeaderCell
                      key={group_idx}
                      collapsing
                      style={{ cursor: 'default' }}
                    />
                  );
                })}
                {headers}
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {
                /*!this.props.loading &&*/ <QHGridBody
                  startIndex={realStartIndex}
                  rowLevelStyleCalc={this.props.rowLevelStyleCalc}
                  additionalTemplateInfo={this.props.additionalTemplateInfo}
                  onRowClick={this.props.onRowClick || stubFunction}
                  itemKeyMap={itemKeyMap}
                  grouping={grouping}
                  visibleColumns={visibleColumns}
                  groupLengths={groupLengths}
                  slicedGroupLengths={slicedGroupLengths}
                  slicedData={slicedData}
                />
              }
              {/* {this.props.loading && (
                <Table.Row>
                  <Table.Cell colSpan={numColumns + grouping.length} style={{ padding: '0', margin: '0' }}>
                    <Segment style={{ height: '60vh' }}>
                      <Dimmer active>
                        <Loader>Caching Data Records. This May Take a Few Moments.</Loader>
                      </Dimmer>
                    </Segment>
                  </Table.Cell>
                </Table.Row>
              )} */}
            </Table.Body>
          </Table>
          {!this.props.loading && numRows === 0 && (
            <div className="QHGrid--empty">
              {typeof this.props.emptyMessage === 'string' ? (
                // Paul start
                <Message
                  className=""
                  icon="search"
                  header="No Results"
                  content="Please Adjust Filters"
                />
              ) : (
                // Paul end
                this.props.emptyMessage
              )}
            </div>
          )}
        </div>

        {/*style={{marginTop: 0, paddingTop: 0, borderRadius: 0, borderTop: ".25px solid #DFDFDF"}}*/}
        <Table
          striped
          sortable
          selectable
          celled
          compact="very"
          size="small"
          style={{ marginTop: 0, paddingTop: 0, borderRadius: 0, borderTop: 0 }}
        >
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell
                colSpan={numColumns + grouping.length}
                style={{ marginTop: 0, borderRadius: 0, borderTop: 0 }}
              >
                <Pagination
                  size="mini"
                  activePage={activePage}
                  totalPages={numPages}
                  onPageChange={this.handlePageChange}
                  firstItem={{ content: '«' }}
                  lastItem={{ content: '»' }}
                  nextItem={{ content: '⟩' }}
                  prevItem={{ content: '⟨' }}
                />

                <span>
                  <Dropdown
                    inline
                    options={paginationOpts}
                    // options={numRows < 2000 ? paginationOpts : paginationOptsNoAll}
                    value={itemsPerPage}
                    onChange={this.handleItemsPerPageChange}
                    upward
                    style={{ marginLeft: '30px' }}
                  />
                  <strong>Items Per Page</strong>
                </span>

                <span
                  style={{ float: 'right', color: '#BBBBBB', fontSize: 16 }}
                >
                  {realStartIndex + 1} - {realEndIndex + 1} of {numRows} Items{' '}
                  {this.props.reloadData && (
                    <Button
                      style={{ marginLeft: 10 }}
                      circular
                      icon="undo"
                      size="mini"
                      color="blue"
                      onClick={this.props.reloadData}
                    />
                  )}
                </span>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
      </div>
    );
  }
}
const columnsType = PropTypes.arrayOf(PropTypes.object);
const filtersType = PropTypes.object;
QHGrid.propTypes = propTypes.forbidExtraProps({
  columns: columnsType.isRequired,
  columnsConfig: columnsType,
  data: PropTypes.array.isRequired,
  rawData: propTypes.mutuallyExclusiveProps(PropTypes.array, 'totalRows'),
  grouping: PropTypes.array.isRequired,

  generalSearch: propTypes.requiredBy('onGeneralSearch', PropTypes.string),
  onGeneralSearch: propTypes.mutuallyExclusiveProps(
    PropTypes.func,
    'totalRows',
  ),
  generalSearchDebounceTime: propTypes.nonNegativeInteger,

  filters: filtersType.isRequired,
  onResetFiltersToCustomView: propTypes.requiredBy(
    'onSaveSettings',
    PropTypes.func,
  ),
  onResetFiltersToDefaultView: PropTypes.func,
  onResetFiltersAll: PropTypes.func, // instead of onFiltersResetAll -- name similarities

  activePage: propTypes.requiredBy('isPaginated', propTypes.nonNegativeInteger),
  // itemsPerPage: propTypes.nonNegativeInteger.isRequired,
  itemsPerPage: propTypes.requiredBy(
    'isPaginated',
    propTypes.or([propTypes.nonNegativeInteger, PropTypes.oneOf([Infinity])]),
  ),
  totalRows: propTypes.requiredBy('isPaginated', propTypes.nonNegativeInteger),
  onPageChange: propTypes.requiredBy('activePage', PropTypes.func),
  onItemsPerPageChange: propTypes.requiredBy('itemsPerPage', PropTypes.func),

  sortBy: PropTypes.string,
  sortOrder: PropTypes.string,
  loading: PropTypes.bool,
  loadingMessage: PropTypes.string,

  quickViews: propTypes.requiredBy('onShowQuickView', PropTypes.array),
  onShowQuickView: PropTypes.func,
  onCreateQuickView: PropTypes.func,
  onRemoveQuickView: PropTypes.func,
  onEditQuickView: PropTypes.func,
  onShareQuickView: PropTypes.func,

  onGroupBy: PropTypes.func,
  onRemoveGroupBy: propTypes.requiredBy('onGroupBy', PropTypes.func),
  onGroupSortToggle: propTypes.requiredBy('onGroupBy', PropTypes.func),

  onSort: PropTypes.func, //.isRequired,
  onColumnVisibilityToggle: PropTypes.func,
  onColumnReorder: PropTypes.func, //.isRequired,
  onFilterUpdate: PropTypes.func, //.isRequired,

  onSaveSettings: PropTypes.func,
  showSaveSettingsSuccessful: PropTypes.bool,
  onClearSettings: propTypes.requiredBy('onSaveSettings', PropTypes.func),
  onRowClick: PropTypes.func,

  additionalTemplateInfo: PropTypes.object,
  rowLevelStyleCalc: PropTypes.func,
  reloadData: PropTypes.func,

  isPaginated: PropTypes.bool,
  legend: PropTypes.element,
  emptyMessage: PropTypes.oneOfType([PropTypes.element, PropTypes.string]),

  exportBaseName: PropTypes.string,
  getExportData: PropTypes.func,

  height: PropTypes.string,
  extraHeaderItem: PropTypes.node,
});

export default QHGrid;
