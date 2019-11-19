import React, { useCallback, useState, useEffect, useRef } from 'react';
import axios from 'axios';

import {
  Dropdown,
  Input,
  Icon,
  Button,
  Popup,
  Divider
} from 'semantic-ui-react';
import { List } from 'react-virtualized';
import update from 'immutability-helper';
import _ from 'lodash';
import './FilterDropdown.scss';
export function getAccessorValue(opt, accessor) {
  switch (typeof accessor) {
    case 'function':
      return accessor(opt);
    case 'object':
      return accessor[opt];
    case 'undefined':
      return opt;
    case 'null':
      return opt;
    default:
      return opt[accessor];
  }
}
const ListSwitchLength = 300;

/* 
* Component Props
- selectedOpts
- onChange
- trigger
- data
- field
*/
export class MultiFilterDropdown extends React.PureComponent {
  static defaultProps = {
    selectedOpts: []
  };
  state = { search: '', selectedOpts: [] };
  handleClick = evt => evt.stopPropagation();
  handleSearchChange = (evt, data) => {
    const filteredOpts = _.filter(
      this.state.options,
      option =>
        _.includes(
          _.lowerCase(_.trim(option)),
          _.lowerCase(_.trim(data.value))
        ) || _.includes(this.props.selectedOpts, option)
    );
    this.setState({ search: data.value, filteredOpts });
  };

  handleSelectionChange = (evt, data) => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};

    var isSelected = _.includes(this.props.selectedOpts, data.value);

    var newSelectedOpts;
    if (isSelected) {
      newSelectedOpts = _.filter(this.props.selectedOpts, function(opt) {
        return opt !== data.value;
      });
      if (!newSelectedOpts.length) {
        newSelectedOpts = undefined;
      }
    } else {
      newSelectedOpts = _.concat(this.props.selectedOpts, data.value);
    }

    onChange(newSelectedOpts);
    if (this.state.filteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };

  handleClearAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange();
    if (this.state.filteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };

  handleSelectAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange(_.uniq(this.props.options));
    if (this.state.filteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    let state = {};
    if (nextProps.data !== prevState.data) {
      state.data = nextProps.data;
      state.options = _.uniq(
        _.flatten(_.map(nextProps.data, item => item[nextProps.field]))
      ).sort();
      let selectedOpts = prevState.selectedOpts.filter(opt =>
        state.options.includes(opt)
      );
      if (selectedOpts.length !== prevState.selectedOpts.length) {
        state.selectedOpts = selectedOpts;
      }
      const filteredOpts = _.filter(
        state.options,
        option =>
          _.includes(
            _.lowerCase(_.trim(option)),
            _.lowerCase(_.trim(prevState.search))
          ) || _.includes(selectedOpts, option)
      );
      state.filteredOpts = filteredOpts;
    }
    return state;
  }

  rowRenderer = ({ key, index, style }) => {
    const { filteredOpts } = this.state;
    let opt = filteredOpts[index];
    return (
      <Dropdown.Item
        className="dropdownItem"
        key={key}
        value={opt}
        onClick={this.handleSelectionChange}
        style={style}
      >
        {_.includes(this.props.selectedOpts, opt) && (
          <Icon color="green" name="checkmark" />
        )}
        {getAccessorValue(opt, this.props.accessor)}
      </Dropdown.Item>
    );
  };
  setListRef = element => {
    this.List = element;
  };
  render() {
    const component = this;
    const { filteredOpts = [] } = this.state;
    // const options = _.uniq(
    //   _.concat(
    //     _.flatten(
    //       _.map(this.props.data, (item) => {
    //         return _.get(item, this.props.field);
    //       })
    //     ),
    //     this.props.selectedOpts
    //   )
    // ).sort();
    // const filteredOpts = _.filter(options, function(option) {
    //   return (
    //     _.includes(_.lowerCase(_.trim(option)), _.lowerCase(_.trim(component.state.search))) ||
    //     _.includes(component.props.selectedOpts, option)
    //   ); //always show selected opts...
    // });

    const trigger = this.props.trigger || <Icon name="filter" />;

    return (
      <Dropdown
        multiple
        trigger={trigger}
        icon={null}
        compact
        closeOnChange={false}
      >
        <Dropdown.Menu onClick={this.handleClick}>
          <Input
            icon="search"
            iconPosition="left"
            className="search"
            placeholder="search"
            value={this.state.search}
            onChange={component.handleSearchChange}
            onClick={e => e.stopPropagation()}
          />
          {filteredOpts.length > ListSwitchLength && (
            <List
              ref={this.setListRef}
              height={215}
              rowCount={filteredOpts.length}
              rowHeight={36}
              rowRenderer={this.rowRenderer}
              width={400}
              autoContainerWidth
              className="dropdownMenu"
            />
          )}
          {filteredOpts.length <= ListSwitchLength && (
            <Dropdown.Menu scrolling style={{ maxWidth: '25vw' }}>
              {_.map(filteredOpts, (opt, idx) => {
                return (
                  <Dropdown.Item
                    key={idx}
                    value={opt}
                    onClick={component.handleSelectionChange}
                  >
                    {_.includes(component.props.selectedOpts, opt) && (
                      <Icon color="green" name="checkmark" />
                    )}
                    {/* {this.props.valueMap ? this.props.valueMap[opt] : opt} */}
                    {getAccessorValue(opt, this.props.accessor)}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          )}
          {/* <Dropdown.Menu scrolling style={{ maxWidth: '25vw' }}>
            {_.map(filteredOpts, function(opt, idx) {
              return (
                <Dropdown.Item key={idx} value={opt} onClick={component.handleSelectionChange}>
                  {_.includes(component.props.selectedOpts, opt) && <Icon color="green" name="checkmark" />}
                  {opt}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu> */}

          <Button.Group fluid widths={2} style={{ marginTop: '15px' }}>
            <Button positive onClick={component.handleSelectAll}>
              Select All
            </Button>
            <Button negative onClick={component.handleClearAll}>
              Clear
            </Button>
          </Button.Group>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}
export class RemoteMultiFilterDropdown extends React.PureComponent {
  static defaultProps = {
    selectedOpts: []
  };
  state = { search: '', selectedOpts: [] };
  handleClick = evt => evt.stopPropagation();
  handleSearchChange = (evt, data) => {
    const remoteFilteredOpts = _.filter(this.state.remoteOptions, option => {
      return (
        _.includes(
          _.lowerCase(_.trim(option)),
          _.lowerCase(_.trim(data.value))
        ) || _.includes(this.props.selectedOpts, option)
      ); //always show selected opts...
    });
    this.setState({ search: data.value, remoteFilteredOpts });
  };

  handleSelectionChange = (evt, data) => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};

    var isSelected = _.includes(this.props.selectedOpts, data.value);

    var newSelectedOpts;
    if (isSelected) {
      newSelectedOpts = _.filter(this.props.selectedOpts, function(opt) {
        return opt !== data.value;
      });
      if (!newSelectedOpts.length) {
        newSelectedOpts = undefined;
      }
    } else {
      newSelectedOpts = _.concat(this.props.selectedOpts, data.value);
    }

    onChange(newSelectedOpts);
    if (this.state.remoteFilteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };

  handleClearAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange();
    if (this.state.remoteFilteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };

  handleSelectAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange(_.uniq(this.props.options));
    if (this.state.remoteFilteredOpts.length > ListSwitchLength) {
      this.List.forceUpdateGrid();
    }
  };
  handleOpen = evt => {
    if (this.state.fetchingRemoteOpts || this.state.fetched) {
      return;
    }
    if (this.props.prefetch) {
      return;
    }
    if (_.isUndefined(this.props.remoteUrl)) {
      return;
    }
    const comp = this;
    comp.setState({ fetchingRemoteOpts: true });
    axios
      .request({
        url: this.props.remoteUrl,
        method: 'get',
        params: this.props.remoteParams
      })
      .then(function(response) {
        var data = _.sortBy(response.data);

        comp.setState({
          fetchingRemoteOpts: false,
          remoteOptions: data,
          remoteFilteredOpts: data,
          fetched: true
        });
      })
      .catch(function(error) {
        comp.setState({ fetchingRemoteOpts: false });
      });
  };

  componentWillMount() {
    if (!this.props.prefetch) return;
    if (_.isUndefined(this.props.remoteUrl)) {
      return;
    }
    const comp = this;
    comp.setState({ fetchingRemoteOpts: true });
    axios
      .request({
        url: this.props.remoteUrl,
        method: 'get',
        params: this.props.remoteParams
      })
      .then(function(response) {
        var data = _.sortBy(response.data);

        comp.setState({
          fetchingRemoteOpts: false,
          remoteOptions: data,
          remoteFilteredOpts: data,
          fetched: true
        });
      })
      .catch(function(error) {
        comp.setState({ fetchingRemoteOpts: false });
      });
  }
  rowRenderer = ({ key, index, style }) => {
    const { remoteFilteredOpts } = this.state;
    let opt = remoteFilteredOpts[index];
    return (
      <Dropdown.Item
        className="dropdownItem"
        key={key}
        value={opt}
        onClick={this.handleSelectionChange}
        style={style}
      >
        {_.includes(this.props.selectedOpts, opt) && (
          <Icon color="green" name="checkmark" />
        )}
        {/* {this.props.valueMap ? this.props.valueMap[opt] : opt} */}
        {getAccessorValue(opt, this.props.accessor)}
      </Dropdown.Item>
    );
  };
  setListRef = element => {
    this.List = element;
  };
  render() {
    const component = this;
    const { remoteFilteredOpts = [] } = this.state;
    const trigger = this.props.trigger || <Icon name="filter" />;
    return (
      <Dropdown
        multiple
        trigger={trigger}
        icon={null}
        compact
        closeOnChange={false}
        loading={this.state.fetchingRemoteOpts}
        onOpen={this.handleOpen}
      >
        <Dropdown.Menu onClick={this.handleClick}>
          <Input
            icon="search"
            iconPosition="left"
            className="search"
            placeholder="search"
            value={this.state.search}
            onChange={component.handleSearchChange}
            onClick={e => e.stopPropagation()}
          />
          {remoteFilteredOpts.length > ListSwitchLength && (
            <List
              ref={this.setListRef}
              height={215}
              rowCount={remoteFilteredOpts.length}
              rowHeight={36}
              rowRenderer={this.rowRenderer}
              width={400}
              autoContainerWidth
              className="dropdownMenu"
            />
          )}
          {remoteFilteredOpts.length <= ListSwitchLength && (
            <Dropdown.Menu scrolling style={{ maxWidth: '25vw' }}>
              {_.map(remoteFilteredOpts, (opt, idx) => {
                return (
                  <Dropdown.Item
                    key={idx}
                    value={opt}
                    onClick={component.handleSelectionChange}
                  >
                    {_.includes(component.props.selectedOpts, opt) && (
                      <Icon color="green" name="checkmark" />
                    )}
                    {/* {this.props.valueMap ? this.props.valueMap[opt] : opt} */}
                    {getAccessorValue(opt, this.props.accessor)}
                  </Dropdown.Item>
                );
              })}
            </Dropdown.Menu>
          )}

          <Button.Group fluid widths={2} style={{ marginTop: '15px' }}>
            <Button positive onClick={component.handleSelectAll}>
              Select All
            </Button>
            <Button negative onClick={component.handleClearAll}>
              Clear
            </Button>
          </Button.Group>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export class RemoteAndLocalMultiFilterDropdown extends React.PureComponent {
  static defaultProps = {
    selectedOpts: []
  };
  state = { search: '', selectedOpts: [] };
  handleClick = evt => evt.stopPropagation();
  handleSearchChange = (evt, data) => this.setState({ search: data.value });

  handleSelectionChange = (evt, data) => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};

    var isSelected = _.includes(this.props.selectedOpts, data.value);

    var newSelectedOpts;
    if (isSelected) {
      newSelectedOpts = _.filter(this.props.selectedOpts, function(opt) {
        return opt !== data.value;
      });
      if (!newSelectedOpts.length) {
        newSelectedOpts = undefined;
      }
    } else {
      newSelectedOpts = _.concat(this.props.selectedOpts, data.value);
    }

    onChange(newSelectedOpts);
  };

  handleClearAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange();
  };

  handleSelectAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange || function() {};
    onChange(_.uniq(this.props.options));
  };

  componentWillMount() {
    if (_.isUndefined(this.props.remoteUrl)) {
      return;
    }
    const comp = this;
    comp.setState({ fetchingRemoteOpts: true });
    axios
      .request({
        url: this.props.remoteUrl,
        method: 'get'
      })
      .then(function(response) {
        var data = _.sortBy(response.data);

        comp.setState({
          fetchingRemoteOpts: false,
          remoteOptions: data
        });
      })
      .catch(function(error) {
        comp.setState({ fetchingRemoteOpts: false });
      });
  }

  render() {
    const component = this;
    const localOptions = _.uniq(
      _.concat(
        _.map(this.props.data, item => {
          return _.get(item, this.props.field);
        }),
        this.props.selectedOpts
      )
    ).sort();
    const localFilteredOpts = _.filter(localOptions, function(option) {
      return (
        _.includes(
          _.lowerCase(_.trim(option)),
          _.lowerCase(_.trim(component.state.search))
        ) || _.includes(component.props.selectedOpts, option)
      ); //always show selected opts...
    });

    const remoteFilteredOpts = _.filter(this.state.remoteOptions, function(
      option
    ) {
      return (
        _.includes(
          _.lowerCase(_.trim(option)),
          _.lowerCase(_.trim(component.state.search))
        ) || _.includes(component.props.selectedOpts, option)
      ); //always show selected opts...
    });

    const trigger = this.props.trigger || <Icon name="filter" />;

    return (
      <Dropdown
        multiple
        trigger={trigger}
        icon={null}
        compact
        closeOnChange={false}
        loading={this.state.fetchingRemoteOpts}
      >
        <Dropdown.Menu style={{ maxWidth: '25vw' }} onClick={this.handleClick}>
          <Dropdown.Item>
            <Dropdown
              text="Filter From Standard Options"
              pointing="left"
              className="link item"
            >
              <Dropdown.Menu
                style={{
                  maxWidth: '25vw',
                  maxHeight: '25vh',
                  overflowY: 'auto'
                }}
              >
                <Input
                  icon="search"
                  iconPosition="left"
                  className="search"
                  placeholder="search"
                  value={this.state.search}
                  onChange={component.handleSearchChange}
                  onClick={e => e.stopPropagation()}
                />
                {_.map(remoteFilteredOpts, function(opt, idx) {
                  return (
                    <Dropdown.Item
                      key={idx}
                      value={opt}
                      onClick={component.handleSelectionChange}
                      style={{ maxWidth: '25vw', wordWrap: 'break-word' }}
                    >
                      {_.includes(component.props.selectedOpts, opt) && (
                        <Icon color="green" name="checkmark" />
                      )}
                      {/* {opt} */}
                      {getAccessorValue(opt, this.props.accessor)}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Dropdown.Item>

          <Dropdown.Item>
            <Dropdown
              text="Filter From Data"
              pointing="right"
              className="link item"
            >
              <Dropdown.Menu
                style={{
                  maxWidth: '25vw',
                  maxHeight: '25vh',
                  overflowY: 'auto'
                }}
              >
                <Input
                  icon="search"
                  iconPosition="left"
                  className="search"
                  placeholder="search"
                  value={this.state.search}
                  onChange={component.handleSearchChange}
                  onClick={e => e.stopPropagation()}
                />
                {_.map(localFilteredOpts, function(opt, idx) {
                  return (
                    <Dropdown.Item
                      key={idx}
                      value={opt}
                      onClick={component.handleSelectionChange}
                      style={{ maxWidth: '25vw', wordWrap: 'break-word' }}
                    >
                      {_.includes(component.props.selectedOpts, opt) && (
                        <Icon color="green" name="checkmark" />
                      )}
                      {/* {opt} */}
                      {getAccessorValue(opt, this.props.accessor)}
                    </Dropdown.Item>
                  );
                })}
              </Dropdown.Menu>
            </Dropdown>
          </Dropdown.Item>
          <Button.Group fluid widths={2} style={{ marginTop: '15px' }}>
            <Button positive onClick={component.handleSelectAll}>
              Select All
            </Button>
            <Button negative onClick={component.handleClearAll}>
              Clear
            </Button>
          </Button.Group>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export class ExecutedDateFilterDropdown extends React.PureComponent {
  static defaultProps = {
    onChange: () => {},
    selectedOpts: [],
    trigger: <Icon name="filter" />
  };
  state = { search: '', selectedOpts: [] };
  handleSearchChange = (evt, data) => this.setState({ search: data.value });

  handleSelectionChange = (evt, data) => {
    evt.stopPropagation();

    var onChange = this.props.onChange;

    var isSelected = _.includes(this.props.selectedOpts, data.value);

    var newSelectedOpts;
    if (isSelected) {
      newSelectedOpts = undefined;
    } else {
      newSelectedOpts = [data.value];
    }

    onChange(newSelectedOpts);
  };

  handleClearAll = evt => {
    evt.stopPropagation();

    var onChange = this.props.onChange;
    onChange();
  };

  render() {
    const component = this;
    const options = [
      'Executed In Past 24 Hours',
      'Executed In Past 72 Hours',
      'Executed In Past 7 Days',
      'Executed In Past Month',
      'Contract Is Executed',
      'Not Yet Executed'
    ];
    const filteredOpts = _.filter(options, function(option) {
      return (
        _.includes(
          _.lowerCase(_.trim(option)),
          _.lowerCase(_.trim(component.state.search))
        ) || _.includes(component.props.selectedOpts, option)
      ); //always show selected opts...
    });

    const trigger = this.props.trigger; // || <Icon name="filter" />;

    return (
      <Dropdown
        multiple
        trigger={trigger}
        icon={null}
        compact
        closeOnChange={false}
      >
        <Dropdown.Menu>
          <Input
            icon="search"
            iconPosition="left"
            className="search"
            placeholder="search"
            value={this.state.search}
            onChange={component.handleSearchChange}
            onClick={e => e.stopPropagation()}
          />

          <Dropdown.Menu scrolling style={{ maxWidth: '25vw' }}>
            {_.map(filteredOpts, function(opt, idx) {
              return (
                <Dropdown.Item
                  key={idx}
                  value={opt}
                  onClick={component.handleSelectionChange}
                >
                  {_.includes(component.props.selectedOpts, opt) && (
                    <Icon color="green" name="checkmark" />
                  )}
                  {opt}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>

          <Button.Group fluid widths={2} style={{ marginTop: '15px' }}>
            <Button negative onClick={component.handleClearAll}>
              Clear
            </Button>
          </Button.Group>
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

export class DateFilterDropdown extends React.PureComponent {
  static defaultProps = {
    onChange: () => {},
    selectedOpts: { startDate: '', endDate: '' },
    trigger: <Icon name="filter" />
  };
  handleClick = evt => evt.stopPropagation();
  handleChange = (evt, { value, name }) => {
    evt.stopPropagation();
    let newOpts = { ...this.props.selectedOpts, [name]: value };
    if (!_.some(newOpts, Boolean)) {
      this.props.onChange();
    } else {
      this.props.onChange(newOpts);
    }
  };
  render() {
    const trigger = this.props.trigger; // || <Icon name="filter" />;
    const {
      selectedOpts: { startDate, endDate }
    } = this.props;
    return (
      <Dropdown
        className={'DateFilterDropdown'}
        multiple
        trigger={trigger}
        icon={null}
        compact
        closeOnChange={false}
      >
        <Dropdown.Menu>
          <Input
            onClick={this.handleClick}
            icon="calendar alternate outline"
            label={{ content: 'From:', color: 'blue' }}
            labelPosition="left"
            type="date"
            fluid
            style={{ cursor: 'pointer' }}
            value={startDate}
            name="startDate"
            onChange={this.handleChange}
          />
          <Input
            onClick={this.handleClick}
            icon="calendar alternate outline"
            label={{ content: 'To:', color: 'blue' }}
            labelPosition="left"
            type="date"
            fluid
            style={{ cursor: 'pointer' }}
            value={endDate}
            name="endDate"
            onChange={this.handleChange}
          />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const numericComparisons = [
  {
    text: 'Is equal to',
    value: '='
  },
  {
    text: 'Is not equal to',
    value: '!='
  },
  {
    text: 'Is greater than or equal to',
    value: '>='
  },
  {
    text: 'Is greater than',
    value: '>'
  },
  {
    text: 'Is less than or equal to',
    value: '<='
  },
  {
    text: 'Is less than',
    value: '<'
  },
  {
    text: 'Is null',
    value: 'null'
  },
  {
    text: 'Is not null',
    value: '!null'
  }
];
const singleComparisons = {
  null: true,
  '!null': true,
  empty: true,
  '!empty': true
};
const combinations = [
  {
    text: 'And',
    value: '&&'
  },
  { text: 'Or', value: '||' }
];
const numericInitialState = { combination: '&&', comparison: '=', value: '' };

const stopPropagation = evt => evt.stopPropagation();
const isComparisonActive = opts =>
  singleComparisons[opts.comparison] || opts.value;
function useComparisonFilter(selectedOptsProp, onChange, initialState) {
  const [selectedOpts, setSelectedOpts] = useState(selectedOptsProp);
  const selectedOptsRef = useRef(selectedOpts);
  useEffect(() => {
    selectedOptsRef.current = selectedOpts;
  }, [selectedOpts]);
  const handleAdd = useCallback(
    evt => {
      setSelectedOpts(selectedOpts =>
        update(selectedOpts, { $push: [initialState] })
      );
    },
    [initialState]
  );
  const handleChange = useCallback((evt, { value, name, 'data-idx': idx }) => {
    evt.stopPropagation();
    setSelectedOpts(selectedOpts =>
      update(selectedOpts, { [idx]: { [name]: { $set: value } } })
    );
  }, []);
  const handleClear = useCallback(() => {
    setSelectedOpts([initialState]);
    onChange();
  }, [onChange, initialState]);
  const handleFilter = useCallback(() => {
    if (!selectedOptsRef.current.some(isComparisonActive)) {
      onChange();
    } else {
      onChange(selectedOptsRef.current);
    }
  }, [onChange]);
  const handleOpen = useCallback(() => {
    if (selectedOptsProp.some(isComparisonActive)) {
      setSelectedOpts(selectedOptsProp);
    }
  }, [selectedOptsProp]);
  const handleRemove = useCallback((evt, { 'data-idx': idx }) => {
    setSelectedOpts(selectedOpts =>
      update(selectedOpts, { $splice: [[idx, 1]] })
    );
  }, []);
  return {
    handleAdd,
    handleChange,
    handleClear,
    handleFilter,
    handleOpen,
    handleRemove,
    selectedOpts
  };
}

export function NumericFilterPopup({ onChange, ...props }) {
  const filter = useComparisonFilter(
    props.selectedOpts,
    onChange,
    numericInitialState
  );
  let filterInputs = filter.selectedOpts.map((opts, idx) => {
    let combination =
      idx > 0 ? (
        <Dropdown
          data-idx={idx}
          name="combination"
          options={combinations}
          selection
          value={opts.combination}
          onChange={filter.handleChange}
          className="combination"
          compact
        />
      ) : null;
    return (
      <div className="filter" key={idx}>
        {idx > 0 &&
          (opts.combination === '&&' ? (
            combination
          ) : (
            <Divider horizontal>{combination}</Divider>
          ))}
        <div className="values">
          <div>
            <Dropdown
              data-idx={idx}
              name="comparison"
              options={numericComparisons}
              selection
              value={opts.comparison}
              onChange={filter.handleChange}
            />
            {!singleComparisons[opts.comparison] && (
              <Input
                data-idx={idx}
                name="value"
                type="number"
                step="any"
                value={opts.value}
                onChange={filter.handleChange}
              />
            )}
          </div>
          <Button
            icon={{ name: 'minus', color: 'red' }}
            compact
            disabled={idx === 0}
            onClick={filter.handleRemove}
            data-idx={idx}
          />
        </div>
      </div>
    );
  });
  return (
    <Popup
      position="bottom center"
      trigger={<span onClick={stopPropagation}>{props.trigger}</span>}
      className="ComparisonFilterPopup"
      on="click"
      onOpen={filter.handleOpen}
      onClick={stopPropagation}
    >
      <Popup.Content className="ComparisonFilter">
        {filterInputs}
        <Divider horizontal>
          <Button
            className="add"
            icon={{ name: 'plus circle', color: 'green', size: 'large' }}
            compact
            onClick={filter.handleAdd}
          />
        </Divider>
        <Button.Group
          fluid
          widths={2}
          style={{ position: 'sticky', bottom: '0px' }}
        >
          <Button positive onClick={filter.handleFilter}>
            Filter
          </Button>
          <Button negative onClick={filter.handleClear}>
            Clear
          </Button>
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
}
NumericFilterPopup.defaultProps = {
  selectedOpts: [numericInitialState]
};

const alphanumericComparisons = [
  {
    text: 'Is equal to',
    value: '='
  },
  {
    text: 'Is not equal to',
    value: '!='
  },
  {
    text: 'Contains',
    value: 'contains'
  },
  {
    text: 'Does not Contain',
    value: '!contains'
  },
  {
    text: 'Starts with',
    value: 'starts'
  },
  {
    text: 'Ends with',
    value: 'ends'
  },
  {
    text: 'Is null',
    value: 'null'
  },
  {
    text: 'Is not null',
    value: '!null'
  },
  {
    text: 'Is empty',
    value: 'empty'
  },
  {
    text: 'Is not empty',
    value: '!empty'
  }
];
const alphanumericInitialState = {
  combination: '&&',
  comparison: 'contains',
  value: ''
};

export function AlphanumericFilterPopup({ onChange, ...props }) {
  const filter = useComparisonFilter(
    props.selectedOpts,
    onChange,
    alphanumericInitialState
  );
  let filterInputs = filter.selectedOpts.map((opts, idx) => {
    let combination =
      idx > 0 ? (
        <Dropdown
          data-idx={idx}
          name="combination"
          options={combinations}
          selection
          value={opts.combination}
          onChange={filter.handleChange}
          className="combination"
          compact
        />
      ) : null;
    return (
      <div className="filter" key={idx}>
        {idx > 0 &&
          (opts.combination === '&&' ? (
            combination
          ) : (
            <Divider horizontal>{combination}</Divider>
          ))}
        <div className="values">
          <div>
            <Dropdown
              data-idx={idx}
              name="comparison"
              options={alphanumericComparisons}
              selection
              value={opts.comparison}
              onChange={filter.handleChange}
            />
            {!singleComparisons[opts.comparison] && (
              <Input
                data-idx={idx}
                name="value"
                // type="number"
                // step="any"
                value={opts.value}
                onChange={filter.handleChange}
              />
            )}
          </div>
          <Button
            icon={{ name: 'minus', color: 'red' }}
            compact
            disabled={idx === 0}
            onClick={filter.handleRemove}
            data-idx={idx}
          />
        </div>
      </div>
    );
  });
  return (
    <Popup
      position="bottom center"
      trigger={<span onClick={stopPropagation}>{props.trigger}</span>}
      className="ComparisonFilterPopup"
      on="click"
      onOpen={filter.handleOpen}
      onClick={stopPropagation}
    >
      <Popup.Content className="ComparisonFilter">
        {filterInputs}
        <Divider horizontal>
          <Button
            className="add"
            icon={{ name: 'plus circle', color: 'green', size: 'large' }}
            compact
            onClick={filter.handleAdd}
          />
        </Divider>
        <Button.Group
          fluid
          widths={2}
          style={{ position: 'sticky', bottom: '0px' }}
        >
          <Button positive onClick={filter.handleFilter}>
            Filter
          </Button>
          <Button negative onClick={filter.handleClear}>
            Clear
          </Button>
        </Button.Group>
      </Popup.Content>
    </Popup>
  );
}
AlphanumericFilterPopup.defaultProps = {
  selectedOpts: [alphanumericInitialState]
};
