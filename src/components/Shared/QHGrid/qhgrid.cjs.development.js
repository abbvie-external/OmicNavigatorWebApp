'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault(ex) {
  return ex && typeof ex === 'object' && 'default' in ex ? ex['default'] : ex;
}

function _interopNamespace(e) {
  if (e && e.__esModule) {
    return e;
  } else {
    var n = {};
    if (e) {
      Object.keys(e).forEach(function(k) {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(
          n,
          k,
          d.get
            ? d
            : {
                enumerable: true,
                get: function() {
                  return e[k];
                },
              },
        );
      });
    }
    n['default'] = e;
    return n;
  }
}

var update = _interopDefault(require('immutability-helper'));
var lodashEs = require('lodash-es');
var React = require('react');
var React__default = _interopDefault(React);
var semanticUiReact = require('semantic-ui-react');
var moment = _interopDefault(require('moment'));
var reactVirtualized = require('react-virtualized');
var Axios = _interopDefault(require('axios'));

function _extends() {
  _extends =
    Object.assign ||
    function(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = arguments[i];

        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target[key] = source[key];
          }
        }
      }

      return target;
    };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _objectWithoutPropertiesLoose(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  return target;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === 'string') return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === 'Object' && o.constructor) n = o.constructor.name;
  if (n === 'Map' || n === 'Set') return Array.from(o);
  if (n === 'Arguments' || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n))
    return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === 'undefined' || o[Symbol.iterator] == null) {
    if (
      Array.isArray(o) ||
      (it = _unsupportedIterableToArray(o)) ||
      (allowArrayLike && o && typeof o.length === 'number')
    ) {
      if (it) o = it;
      var i = 0;
      return function() {
        if (i >= o.length)
          return {
            done: true,
          };
        return {
          done: false,
          value: o[i++],
        };
      };
    }

    throw new TypeError(
      'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.',
    );
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

function _toPrimitive(input, hint) {
  if (typeof input !== 'object' || input === null) return input;
  var prim = input[Symbol.toPrimitive];

  if (prim !== undefined) {
    var res = prim.call(input, hint || 'default');
    if (typeof res !== 'object') return res;
    throw new TypeError('@@toPrimitive must return a primitive value.');
  }

  return (hint === 'string' ? String : Number)(input);
}

function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, 'string');

  return typeof key === 'symbol' ? key : String(key);
}

var cache = {};
var keyDelim = '\u200C';
/**
 * @param url - Url to query
 * @param  params - Parameters
 * @param  hookConfig
 */

function useAxiosGet(url, params, hookConfig) {
  if (hookConfig === void 0) {
    hookConfig = {};
  }

  var reducer = React.useMemo(function() {
    return axiosReducer();
  }, []);

  var _useReducer3 = React.useReducer(reducer, {
      loading: true,
      error: {},
    }),
    state = _useReducer3[0],
    dispatch = _useReducer3[1];

  var _useReducer4 = React.useReducer(function(x) {
      return x + 1;
    }, 0),
    forceTrigger = _useReducer4[0],
    trigger = _useReducer4[1];

  var _hookConfig2 = hookConfig,
    processData = _hookConfig2.processData,
    onError = _hookConfig2.onError,
    withCredentials = _hookConfig2.withCredentials,
    _hookConfig2$deps = _hookConfig2.deps,
    deps = _hookConfig2$deps === void 0 ? [] : _hookConfig2$deps,
    runIf = _hookConfig2.runIf,
    cacheKey = _hookConfig2.cacheKey;
  React.useEffect(function() {
    if (runIf && !runIf()) {
      dispatch({
        type: 'noRun',
      });
      return;
    }

    var key = '' + url + keyDelim + cacheKey + keyDelim + deps.join(keyDelim);

    if (cacheKey && cache[key]) {
      var data = cache[key];
      data = processData ? processData(data) : data;
      dispatch({
        type: 'data',
        payload: data,
      });
      return;
    }

    var cancelToken;
    dispatch({
      type: 'loading',
    });
    Axios.get(url, {
      withCredentials: withCredentials,
      params: params,
      cancelToken: new Axios.CancelToken(function(c) {
        return (cancelToken = c);
      }),
    }).then(
      function(res) {
        if (cacheKey) {
          cache[key] = res.data;
        }

        var data = processData ? processData(res.data) : res.data;
        dispatch({
          type: 'data',
          payload: data,
        });
      },
      function(err) {
        if (Axios.isCancel(err)) return;
        dispatch({
          type: 'error',
          payload: err,
        });
        onError && onError(err);
      },
    );
    return cancelToken; // eslint-disable-next-line
  }, [].concat(deps, [forceTrigger]));
  return _extends({}, state, {
    trigger: trigger,
  });
}

var axiosReducer = function axiosReducer() {
  return function(state, action) {
    switch (action.type) {
      case 'loading':
        return _extends({}, state, {
          error: undefined,
          loading: true,
        });

      case 'error':
        return _extends({}, state, {
          error: action.payload,
          loading: false,
        });

      case 'data':
        return _extends({}, state, {
          error: undefined,
          loading: false,
          data: action.payload,
        });

      case 'noRun':
        return _extends({}, state, {
          error: undefined,
          loading: false,
        });

      default:
        return state;
    }
  };
};

function getAccessorValue(opt, accessor) {
  if (accessor == null) {
    return opt;
  }

  switch (typeof accessor) {
    case 'function':
      return accessor(opt);

    case 'object':
      return accessor[opt];

    default:
      return opt[accessor];
  }
}
var ListSwitchLength = 300;
var listHeight = 215;
var baseTrigger = /*#__PURE__*/ React__default.createElement(
  semanticUiReact.Icon,
  {
    name: 'filter',
  },
);

var stopPropFunc = function stopPropFunc(evt) {
  return evt.stopPropagation();
};

var noVertPadding = {
  paddingBottom: 0,
  paddingTop: 0,
};
var stubArray = [];
function MultiFilterDropdown(_ref) {
  var _ref$selectedOpts = _ref.selectedOpts,
    selectedOpts = _ref$selectedOpts === void 0 ? stubArray : _ref$selectedOpts,
    data = _ref.data,
    field = _ref.field,
    onChange = _ref.onChange,
    accessor = _ref.accessor,
    _ref$trigger = _ref.trigger,
    trigger = _ref$trigger === void 0 ? baseTrigger : _ref$trigger,
    props = _objectWithoutPropertiesLoose(_ref, [
      'selectedOpts',
      'data',
      'field',
      'onChange',
      'accessor',
      'trigger',
    ]);

  var _useState = React.useState(''),
    search = _useState[0],
    setSearch = _useState[1];

  var _useState2 = React.useState(0),
    showSelected = _useState2[0],
    setShowSelected = _useState2[1];

  var options = React.useMemo(
    function() {
      return Array.from(
        new Set(
          data
            .flatMap(function(item) {
              return item[field];
            })
            .map(function(val) {
              return '' + val;
            }),
        ),
      ).sort();
    },
    [data, field],
  );
  var listRef = React.useRef(null);
  var filteredOptions = React.useMemo(
    function() {
      if (showSelected) {
        return [];
      }

      var opts = options;
      var lowerSearch = search.trim().toLowerCase();

      if (!lowerSearch) {
        return opts;
      }

      return opts.filter(function(option) {
        return option
          .toLowerCase()
          .trim()
          .includes(lowerSearch);
      });
    },
    [options, search, showSelected],
  );
  var filteredSelectedOpts = React.useMemo(
    function() {
      if (!showSelected) {
        return [];
      }

      var opts = selectedOpts;
      var lowerSearch = search.trim().toLowerCase();

      if (!lowerSearch) {
        return opts;
      }

      return opts.filter(function(option) {
        return option
          .toLowerCase()
          .trim()
          .includes(lowerSearch);
      });
    },
    [search, selectedOpts, showSelected],
  );
  var filteredOpts = showSelected ? filteredSelectedOpts : filteredOptions;
  var selectedOptsMap = React.useMemo(
    function() {
      return Object.fromEntries(
        selectedOpts.map(function(opt) {
          return [opt, true];
        }),
      );
    },
    [selectedOpts],
  );
  React.useEffect(
    function() {
      if (filteredOpts.length > ListSwitchLength) {
        var _listRef$current;

        (_listRef$current = listRef.current) === null ||
        _listRef$current === void 0
          ? void 0
          : _listRef$current.forceUpdateGrid();
      }
    },
    [filteredOpts.length],
  );

  var handleSelectionChange = function handleSelectionChange(evt, data) {
    evt.stopPropagation();
    var isSelected = selectedOpts.includes(data.value);
    var newSelectedOpts = selectedOpts;

    if (isSelected) {
      newSelectedOpts = newSelectedOpts.filter(function(opt) {
        return opt !== data.value;
      });
    } else {
      newSelectedOpts = newSelectedOpts.concat(data.value);
    }

    onChange(newSelectedOpts.length ? newSelectedOpts : undefined);
  };

  var handleClearAll = function handleClearAll(evt) {
    evt.stopPropagation();
    var newSelectedOpts = selectedOpts.filter(function(opt) {
      return !filteredOpts.includes(opt);
    });
    onChange(newSelectedOpts.length ? newSelectedOpts : undefined);

    if (props.clearSearchOnSelectOrClearAll) {
      setSearch('');
    }
  };

  var handleSelectAll = function handleSelectAll(evt) {
    evt.stopPropagation();
    onChange(Array.from(new Set([].concat(filteredOpts, selectedOpts))));

    if (props.clearSearchOnSelectOrClearAll) {
      setSearch('');
    }
  };

  var rowRenderer = function rowRenderer(_ref2) {
    var key = _ref2.key,
      index = _ref2.index,
      style = _ref2.style;
    var opt = filteredOpts[index];
    return React__default.createElement(
      semanticUiReact.Dropdown.Item,
      {
        className: 'dropdownItem',
        key: key,
        value: opt,
        onClick: handleSelectionChange,
        style: style,
      },
      selectedOptsMap[opt] &&
        React__default.createElement(semanticUiReact.Icon, {
          color: 'green',
          name: 'checkmark',
        }),
      getAccessorValue(opt, accessor),
    );
  };

  return React__default.createElement(
    semanticUiReact.Popup,
    {
      position: 'bottom center',
      trigger: React__default.createElement(
        'span',
        {
          onClick: stopPropFunc,
        },
        trigger,
      ),
      className: 'MultiFilterPopup',
      on: 'click',
      onClick: stopPropFunc,
      popperDependencies: [filteredOpts.length],
    },
    React__default.createElement(
      semanticUiReact.Popup.Content,
      {
        className: 'Filter MultiFilter',
      },
      React__default.createElement(semanticUiReact.Tab, {
        panes: [
          {
            menuItem: 'All',
            pane: React__default.createElement('div', null),
          },
          {
            menuItem:
              'Selected ' +
              (selectedOpts.length ? '(' + selectedOpts.length + ')' : ''),
            pane: React__default.createElement('div', null),
          },
        ],
        activeIndex: showSelected,
        onTabChange: function onTabChange(_evt, data) {
          return setShowSelected(data.activeIndex);
        },
      }),
      React__default.createElement(
        'div',
        {
          className: ' dropdown ui',
        },
        React__default.createElement(
          'div',
          {
            className: 'menu transition visible',
            style: {
              position: 'unset',
            },
          },
          React__default.createElement(semanticUiReact.Input, {
            icon: 'search',
            iconPosition: 'left',
            className: 'search',
            placeholder: 'search',
            value: search,
            onChange: function onChange(_evt, data) {
              return setSearch(data.value);
            },
            onClick: stopPropFunc,
            action: {
              color: 'red',
              icon: {
                name: 'x',
                style: noVertPadding,
              },
              onClick: function onClick() {
                return setSearch('');
              },
              title: 'Clear Search',
              style: noVertPadding,
            },
          }),
          filteredOpts.length > ListSwitchLength &&
            React__default.createElement(reactVirtualized.List, {
              ref: listRef,
              height: listHeight,
              rowCount: filteredOpts.length,
              rowHeight: 36,
              rowRenderer: rowRenderer,
              width: 400,
              autoContainerWidth: true,
              className: 'dropdownMenu',
            }),
          filteredOpts.length <= ListSwitchLength &&
            React__default.createElement(
              semanticUiReact.Dropdown.Menu,
              {
                scrolling: true,
                style: {
                  maxWidth: '25vw',
                  maxHeight: listHeight + 'px',
                },
              },
              filteredOpts.map(function(opt, idx) {
                return React__default.createElement(
                  semanticUiReact.Dropdown.Item,
                  {
                    key: idx,
                    value: opt,
                    onClick: handleSelectionChange,
                  },
                  selectedOptsMap[opt] &&
                    React__default.createElement(semanticUiReact.Icon, {
                      color: 'green',
                      name: 'checkmark',
                    }),
                  getAccessorValue(opt, accessor),
                );
              }),
            ),
          React__default.createElement(
            semanticUiReact.Button.Group,
            {
              fluid: true,
              widths: 2,
            },
            React__default.createElement(
              semanticUiReact.Button,
              {
                disabled: filteredOpts.length > 500 || !!showSelected,
                title:
                  filteredOptions.length > 500
                    ? 'Disabled due to large number of options'
                    : undefined,
                positive: true,
                onClick: handleSelectAll,
              },
              'Select All',
            ),
            React__default.createElement(
              semanticUiReact.Button,
              {
                negative: true,
                onClick: handleClearAll,
              },
              'Clear',
            ),
          ),
        ),
      ),
    ),
  );
}
function RemoteMultiFilterDropdown(_ref3) {
  var _ref3$selectedOpts = _ref3.selectedOpts,
    selectedOpts =
      _ref3$selectedOpts === void 0 ? stubArray : _ref3$selectedOpts,
    data = _ref3.data,
    field = _ref3.field,
    onChange = _ref3.onChange,
    accessor = _ref3.accessor,
    _ref3$trigger = _ref3.trigger,
    trigger = _ref3$trigger === void 0 ? baseTrigger : _ref3$trigger,
    useLocal = _ref3.useLocal,
    props = _objectWithoutPropertiesLoose(_ref3, [
      'selectedOpts',
      'data',
      'field',
      'onChange',
      'accessor',
      'trigger',
      'useLocal',
    ]);

  var _useState3 = React.useState(''),
    search = _useState3[0],
    setSearch = _useState3[1];

  var _useState4 = React.useState(0),
    showSelected = _useState4[0],
    setShowSelected = _useState4[1];

  var _useState5 = React.useState(false),
    opened = _useState5[0],
    setOpened = _useState5[1];

  var _useAxiosGet = useAxiosGet(props.remoteUrl, props.remoteParams, {
      runIf: function runIf() {
        return props.prefetch || opened;
      },
      processData: function processData(data) {
        return data
          .map(function(val) {
            return '' + val;
          })
          .sort();
      },
    }),
    _useAxiosGet$data = _useAxiosGet.data,
    remoteOptions =
      _useAxiosGet$data === void 0 ? stubArray : _useAxiosGet$data,
    loading = _useAxiosGet.loading,
    loadOptions = _useAxiosGet.trigger;

  React.useEffect(
    function() {
      if (!props.prefetch) {
        loadOptions();
      }
    },
    [opened, loadOptions, props.prefetch],
  );
  var localOptions = React.useMemo(
    function() {
      if (!useLocal) {
        return stubArray;
      }

      return Array.from(
        new Set(
          data
            .flatMap(function(item) {
              return item[field];
            })
            .map(function(val) {
              return '' + val;
            }),
        ),
      ).sort();
    },
    [data, useLocal, field],
  );
  var options = React.useMemo(
    function() {
      if (!localOptions.length) {
        return remoteOptions;
      }

      return Array.from(new Set([].concat(remoteOptions, localOptions))).sort();
    },
    [remoteOptions, localOptions],
  );
  var listRef = React.useRef(null);
  var filteredOptions = React.useMemo(
    function() {
      if (showSelected) {
        return [];
      }

      var opts = options;
      var lowerSearch = search.trim().toLowerCase();

      if (!lowerSearch) {
        return opts;
      }

      return opts.filter(function(option) {
        return option
          .toLowerCase()
          .trim()
          .includes(lowerSearch);
      });
    },
    [options, search, showSelected],
  );
  var filteredSelectedOpts = React.useMemo(
    function() {
      if (!showSelected) {
        return [];
      }

      var opts = selectedOpts;
      var lowerSearch = search.trim().toLowerCase();

      if (!lowerSearch) {
        return opts;
      }

      return opts.filter(function(option) {
        return option
          .toLowerCase()
          .trim()
          .includes(lowerSearch);
      });
    },
    [search, selectedOpts, showSelected],
  );
  var filteredOpts = showSelected ? filteredSelectedOpts : filteredOptions;
  var selectedOptsMap = React.useMemo(
    function() {
      return Object.fromEntries(
        selectedOpts.map(function(opt) {
          return [opt, true];
        }),
      );
    },
    [selectedOpts],
  );
  React.useEffect(
    function() {
      if (filteredOpts.length > ListSwitchLength) {
        var _listRef$current2;

        (_listRef$current2 = listRef.current) === null ||
        _listRef$current2 === void 0
          ? void 0
          : _listRef$current2.forceUpdateGrid();
      }
    },
    [filteredOpts.length],
  );

  var handleSelectionChange = function handleSelectionChange(evt, data) {
    evt.stopPropagation();
    var isSelected = selectedOpts.includes(data.value);
    var newSelectedOpts = selectedOpts;

    if (isSelected) {
      newSelectedOpts = newSelectedOpts.filter(function(opt) {
        return opt !== data.value;
      });
    } else {
      newSelectedOpts = newSelectedOpts.concat(data.value);
    }

    onChange(newSelectedOpts.length ? newSelectedOpts : undefined);
  };

  var handleClearAll = function handleClearAll(evt) {
    evt.stopPropagation();
    var newSelectedOpts = selectedOpts.filter(function(opt) {
      return !filteredOpts.includes(opt);
    });
    onChange(newSelectedOpts.length ? newSelectedOpts : undefined);

    if (props.clearSearchOnSelectOrClearAll) {
      setSearch('');
    }
  };

  var handleSelectAll = function handleSelectAll(evt) {
    evt.stopPropagation();
    onChange(Array.from(new Set([].concat(filteredOpts, selectedOpts))));

    if (props.clearSearchOnSelectOrClearAll) {
      setSearch('');
    }
  };

  var rowRenderer = function rowRenderer(_ref4) {
    var key = _ref4.key,
      index = _ref4.index,
      style = _ref4.style;
    var opt = filteredOpts[index];
    return React__default.createElement(
      semanticUiReact.Dropdown.Item,
      {
        className: 'dropdownItem',
        key: key,
        value: opt,
        onClick: handleSelectionChange,
        style: style,
      },
      selectedOptsMap[opt] &&
        React__default.createElement(semanticUiReact.Icon, {
          color: 'green',
          name: 'checkmark',
        }),
      getAccessorValue(opt, accessor),
    );
  };

  return React__default.createElement(
    semanticUiReact.Popup,
    {
      position: 'bottom center',
      trigger: React__default.createElement(
        'span',
        {
          onClick: stopPropFunc,
        },
        trigger,
      ),
      className: 'MultiFilterPopup',
      on: 'click',
      onOpen: function onOpen() {
        return setOpened(true);
      },
      onClick: stopPropFunc,
      popperDependencies: [filteredOpts.length],
    },
    React__default.createElement(
      semanticUiReact.Popup.Content,
      {
        className: 'Filter MultiFilter',
      },
      React__default.createElement(semanticUiReact.Loader, {
        active: loading,
      }),
      React__default.createElement(semanticUiReact.Tab, {
        panes: [
          {
            menuItem: 'All',
            pane: React__default.createElement('div', null),
          },
          {
            menuItem:
              'Selected ' +
              (selectedOpts.length ? '(' + selectedOpts.length + ')' : ''),
            pane: React__default.createElement('div', null),
          },
        ],
        activeIndex: showSelected,
        onTabChange: function onTabChange(_evt, data) {
          return setShowSelected(data.activeIndex);
        },
      }),
      React__default.createElement(
        'div',
        {
          className: ' dropdown ui',
        },
        React__default.createElement(
          'div',
          {
            className: 'menu transition visible',
            style: {
              position: 'unset',
            },
          },
          React__default.createElement(semanticUiReact.Input, {
            icon: 'search',
            iconPosition: 'left',
            className: 'search',
            placeholder: 'search',
            value: search,
            onChange: function onChange(_evt, data) {
              return setSearch(data.value);
            },
            onClick: stopPropFunc,
            action: {
              color: 'red',
              icon: {
                name: 'x',
                style: noVertPadding,
              },
              onClick: function onClick() {
                return setSearch('');
              },
              title: 'Clear Search',
              style: noVertPadding,
            },
          }),
          filteredOpts.length > ListSwitchLength &&
            React__default.createElement(reactVirtualized.List, {
              ref: listRef,
              height: listHeight,
              rowCount: filteredOpts.length,
              rowHeight: 36,
              rowRenderer: rowRenderer,
              width: 400,
              autoContainerWidth: true,
              className: 'dropdownMenu',
            }),
          filteredOpts.length <= ListSwitchLength &&
            React__default.createElement(
              semanticUiReact.Dropdown.Menu,
              {
                scrolling: true,
                style: {
                  maxWidth: '25vw',
                  maxHeight: listHeight + 'px',
                },
              },
              filteredOpts.map(function(opt, idx) {
                return React__default.createElement(
                  semanticUiReact.Dropdown.Item,
                  {
                    key: idx,
                    value: opt,
                    onClick: handleSelectionChange,
                  },
                  selectedOptsMap[opt] &&
                    React__default.createElement(semanticUiReact.Icon, {
                      color: 'green',
                      name: 'checkmark',
                    }),
                  getAccessorValue(opt, accessor),
                );
              }),
            ),
          React__default.createElement(
            semanticUiReact.Button.Group,
            {
              fluid: true,
              widths: 2,
            },
            React__default.createElement(
              semanticUiReact.Button,
              {
                disabled: filteredOpts.length > 500 || !!showSelected,
                title:
                  filteredOptions.length > 500
                    ? 'Disabled due to large number of options'
                    : undefined,
                positive: true,
                onClick: handleSelectAll,
              },
              'Select All',
            ),
            React__default.createElement(
              semanticUiReact.Button,
              {
                negative: true,
                onClick: handleClearAll,
              },
              'Clear',
            ),
          ),
        ),
      ),
    ),
  );
}
var initialDateFilterOpts = {
  startDate: '',
  endDate: '',
};
var DateFilterDropdown = function DateFilterDropdown(props) {
  var _props$selectedOpts = props.selectedOpts,
    selectedOpts =
      _props$selectedOpts === void 0
        ? initialDateFilterOpts
        : _props$selectedOpts,
    _props$trigger = props.trigger,
    trigger = _props$trigger === void 0 ? baseTrigger : _props$trigger;

  var handleChange = function handleChange(evt, _ref5) {
    var _extends2;

    var value = _ref5.value,
      name = _ref5.name;
    evt.stopPropagation();

    var newOpts = _extends(
      {},
      selectedOpts,
      ((_extends2 = {}), (_extends2[name] = value), _extends2),
    );

    if (!lodashEs.some(newOpts, Boolean)) {
      var _props$onChange;

      (_props$onChange = props.onChange) === null || _props$onChange === void 0
        ? void 0
        : _props$onChange.call(props);
    } else {
      var _props$onChange2;

      (_props$onChange2 = props.onChange) === null ||
      _props$onChange2 === void 0
        ? void 0
        : _props$onChange2.call(props, newOpts);
    }
  };

  var startDate = selectedOpts.startDate,
    endDate = selectedOpts.endDate;
  return React__default.createElement(
    semanticUiReact.Popup,
    {
      position: 'bottom center',
      trigger: React__default.createElement(
        'span',
        {
          onClick: stopPropFunc,
        },
        trigger,
      ),
      className: 'DateFilterDropdown',
      on: 'click',
      onClick: stopPropFunc,
    },
    React__default.createElement(
      semanticUiReact.Popup.Content,
      {
        className: 'Filter DateFilter',
      },
      React__default.createElement(semanticUiReact.Input, {
        onClick: stopPropFunc,
        icon: {
          name: 'x',
          style: {
            pointerEvents: 'all',
          },
          onClick: function onClick(e) {
            handleChange(e, {
              value: '',
              name: 'startDate',
            });
          },
          'aria-label': 'Clear',
        },
        label: {
          content: 'From:',
          color: 'blue',
          htmlFor: 'startDate',
        },
        labelPosition: 'left',
        type: 'date',
        fluid: true,
        style: {
          cursor: 'pointer',
        },
        value: startDate,
        name: 'startDate',
        onChange: handleChange,
      }),
      React__default.createElement(semanticUiReact.Input, {
        onClick: stopPropFunc,
        icon: {
          name: 'x',
          style: {
            pointerEvents: 'all',
          },
          onClick: function onClick(e) {
            handleChange(e, {
              value: '',
              name: 'endDate',
            });
          },
          'aria-label': 'Clear',
        },
        label: {
          content: 'Until:',
          color: 'blue',
          htmlFor: 'endDate',
        },
        labelPosition: 'left',
        type: 'date',
        fluid: true,
        style: {
          cursor: 'pointer',
        },
        value: endDate,
        name: 'endDate',
        onChange: handleChange,
      }),
    ),
  );
};
var numericComparisons = [
  {
    text: 'Is equal to',
    value: '=',
  },
  {
    text: 'Is not equal to',
    value: '!=',
  },
  {
    text: 'Is greater than or equal to',
    value: '>=',
  },
  {
    text: 'Is greater than',
    value: '>',
  },
  {
    text: 'Is less than or equal to',
    value: '<=',
  },
  {
    text: 'Is less than',
    value: '<',
  },
  {
    text: 'Is null',
    value: 'null',
  },
  {
    text: 'Is not null',
    value: '!null',
  },
];
var Comparisons;

(function(Comparisons) {
  Comparisons['equals'] = '=';
  Comparisons['notEquals'] = '!=';
  Comparisons['greaterOrEqual'] = '>=';
  Comparisons['greater'] = '>';
  Comparisons['lessOrEqual'] = '<=';
  Comparisons['less'] = '<';
  Comparisons['null'] = 'null';
  Comparisons['notNull'] = '!null';
  Comparisons['contains'] = 'contains';
  Comparisons['notContains'] = '!contains';
  Comparisons['starts'] = 'starts';
  Comparisons['ends'] = 'ends';
  Comparisons['empty'] = 'empty';
  Comparisons['notEmpty'] = '!empty';
})(Comparisons || (Comparisons = {}));

var singleComparisons = {
  null: true,
  '!null': true,
  empty: true,
  '!empty': true,
};
var Combinations;

(function(Combinations) {
  Combinations['and'] = '&&';
  Combinations['or'] = '||';
})(Combinations || (Combinations = {}));

var combinations = [
  {
    text: 'And',
    value: Combinations.and,
  },
  {
    text: 'Or',
    value: Combinations.or,
  },
];
var numericInitialState = {
  combination: Combinations.and,
  comparison: Comparisons.equals,
  value: '',
};

var isComparisonActive = function isComparisonActive(opts) {
  return singleComparisons[opts.comparison] || opts.value;
};

function useComparisonFilter(selectedOptsProp, onChange, initialState) {
  var _useState6 = React.useState(selectedOptsProp),
    selectedOpts = _useState6[0],
    setSelectedOpts = _useState6[1];

  var selectedOptsRef = React.useRef(selectedOpts);
  React.useEffect(
    function() {
      selectedOptsRef.current = selectedOpts;
    },
    [selectedOpts],
  );
  var handleAdd = React.useCallback(
    function(_evt) {
      setSelectedOpts(function(selectedOpts) {
        return update(selectedOpts, {
          $push: [initialState],
        });
      });
    },
    [initialState],
  );
  var handleChange = React.useCallback(function(evt, _ref6) {
    var value = _ref6.value,
      name = _ref6.name,
      idx = _ref6['data-idx'];
    evt.stopPropagation();
    setSelectedOpts(function(selectedOpts) {
      var _idx, _update;

      return update(
        selectedOpts,
        ((_update = {}),
        (_update[idx] =
          ((_idx = {}),
          (_idx[name] = {
            $set: value,
          }),
          _idx)),
        _update),
      );
    });
  }, []);
  var handleClear = React.useCallback(
    function() {
      setSelectedOpts([initialState]);
      onChange();
    },
    [onChange, initialState],
  );
  var handleFilter = React.useCallback(
    function() {
      if (!selectedOptsRef.current.some(isComparisonActive)) {
        onChange();
      } else {
        onChange(selectedOptsRef.current);
      }
    },
    [onChange],
  );
  var handleOpen = React.useCallback(
    function() {
      if (selectedOptsProp.some(isComparisonActive)) {
        setSelectedOpts(selectedOptsProp);
      }
    },
    [selectedOptsProp],
  );
  var handleRemove = React.useCallback(function(_evt, _ref7) {
    var idx = _ref7['data-idx'];
    setSelectedOpts(function(selectedOpts) {
      return update(selectedOpts, {
        $splice: [[idx, 1]],
      });
    });
  }, []);
  return {
    handleAdd: handleAdd,
    handleChange: handleChange,
    handleClear: handleClear,
    handleFilter: handleFilter,
    handleOpen: handleOpen,
    handleRemove: handleRemove,
    selectedOpts: selectedOpts,
  };
}

var NumericFilterPopup = /*#__PURE__*/ React__default.memo(
  function NumericFilterPopup(_ref8) {
    var _props$selectedOpts2;

    var onChange = _ref8.onChange,
      props = _objectWithoutPropertiesLoose(_ref8, ['onChange']);

    var filter = useComparisonFilter(
      (_props$selectedOpts2 = props.selectedOpts) !== null &&
        _props$selectedOpts2 !== void 0
        ? _props$selectedOpts2
        : [numericInitialState],
      onChange,
      numericInitialState,
    );
    var filterInputs = filter.selectedOpts.map(function(opts, idx) {
      var combination =
        idx > 0
          ? React__default.createElement(semanticUiReact.Dropdown, {
              'data-idx': idx,
              name: 'combination',
              options: combinations,
              selection: true,
              value: opts.combination,
              onChange: filter.handleChange,
              className: 'combination',
              compact: true,
            })
          : null;
      return React__default.createElement(
        'div',
        {
          className: 'filter',
          key: idx,
        },
        idx > 0 &&
          (opts.combination === '&&'
            ? combination
            : React__default.createElement(
                semanticUiReact.Divider,
                {
                  horizontal: true,
                },
                combination,
              )),
        React__default.createElement(
          'div',
          {
            className: 'values',
          },
          React__default.createElement(
            'div',
            null,
            React__default.createElement(semanticUiReact.Dropdown, {
              'data-idx': idx,
              name: 'comparison',
              options: numericComparisons,
              selection: true,
              value: opts.comparison,
              onChange: filter.handleChange,
            }),
            !singleComparisons[opts.comparison] &&
              React__default.createElement(semanticUiReact.Input, {
                'data-idx': idx,
                name: 'value',
                type: 'number',
                step: 'any',
                value: opts.value,
                onChange: filter.handleChange,
              }),
          ),
          React__default.createElement(semanticUiReact.Button, {
            icon: {
              name: 'minus',
              color: 'red',
            },
            compact: true,
            disabled: idx === 0,
            onClick: filter.handleRemove,
            'data-idx': idx,
          }),
        ),
      );
    });
    return React__default.createElement(
      semanticUiReact.Popup,
      {
        position: 'bottom center',
        trigger: React__default.createElement(
          'span',
          {
            onClick: stopPropFunc,
          },
          props.trigger,
        ),
        className: 'ComparisonFilterPopup',
        on: 'click',
        onOpen: filter.handleOpen,
        onClick: stopPropFunc,
      },
      React__default.createElement(
        semanticUiReact.Popup.Content,
        {
          className: 'ComparisonFilter',
        },
        filterInputs,
        React__default.createElement(
          semanticUiReact.Divider,
          {
            horizontal: true,
          },
          React__default.createElement(semanticUiReact.Button, {
            className: 'add',
            icon: {
              name: 'plus circle',
              color: 'green',
              size: 'large',
            },
            compact: true,
            onClick: filter.handleAdd,
          }),
        ),
        React__default.createElement(
          semanticUiReact.Button.Group,
          {
            fluid: true,
            widths: 2,
            style: {
              position: 'sticky',
              bottom: '0px',
            },
          },
          React__default.createElement(
            semanticUiReact.Button,
            {
              positive: true,
              onClick: filter.handleFilter,
            },
            'Filter',
          ),
          React__default.createElement(
            semanticUiReact.Button,
            {
              negative: true,
              onClick: filter.handleClear,
            },
            'Clear',
          ),
        ),
      ),
    );
  },
);
var alphanumericComparisons = [
  {
    text: 'Is equal to',
    value: Comparisons.equals,
  },
  {
    text: 'Is not equal to',
    value: Comparisons.notEquals,
  },
  {
    text: 'Contains',
    value: Comparisons.contains,
  },
  {
    text: 'Does not Contain',
    value: Comparisons.notContains,
  },
  {
    text: 'Starts with',
    value: Comparisons.starts,
  },
  {
    text: 'Ends with',
    value: Comparisons.ends,
  },
  {
    text: 'Is null',
    value: Comparisons['null'],
  },
  {
    text: 'Is not null',
    value: Comparisons.notNull,
  },
  {
    text: 'Is empty',
    value: Comparisons.empty,
  },
  {
    text: 'Is not empty',
    value: Comparisons.notEmpty,
  },
];
var alphanumericInitialState = {
  combination: Combinations.and,
  comparison: Comparisons.contains,
  value: '',
};
var AlphanumericFilterPopup = function AlphanumericFilterPopup(_ref9) {
  var _props$selectedOpts3;

  var onChange = _ref9.onChange,
    props = _objectWithoutPropertiesLoose(_ref9, ['onChange']);

  var filter = useComparisonFilter(
    (_props$selectedOpts3 = props.selectedOpts) !== null &&
      _props$selectedOpts3 !== void 0
      ? _props$selectedOpts3
      : [alphanumericInitialState],
    onChange,
    alphanumericInitialState,
  );
  var filterInputs = filter.selectedOpts.map(function(opts, idx) {
    var combination =
      idx > 0
        ? React__default.createElement(semanticUiReact.Dropdown, {
            'data-idx': idx,
            name: 'combination',
            options: combinations,
            selection: true,
            value: opts.combination,
            onChange: filter.handleChange,
            className: 'combination',
            compact: true,
          })
        : null;
    return React__default.createElement(
      'div',
      {
        className: 'filter',
        key: idx,
      },
      idx > 0 &&
        (opts.combination === '&&'
          ? combination
          : React__default.createElement(
              semanticUiReact.Divider,
              {
                horizontal: true,
              },
              combination,
            )),
      React__default.createElement(
        'div',
        {
          className: 'values',
        },
        React__default.createElement(
          'div',
          null,
          React__default.createElement(semanticUiReact.Dropdown, {
            'data-idx': idx,
            name: 'comparison',
            options: alphanumericComparisons,
            selection: true,
            value: opts.comparison,
            onChange: filter.handleChange,
          }),
          !singleComparisons[opts.comparison] &&
            React__default.createElement(semanticUiReact.Input, {
              'data-idx': idx,
              name: 'value',
              // type="number"
              // step="any"
              value: opts.value,
              onChange: filter.handleChange,
            }),
        ),
        React__default.createElement(semanticUiReact.Button, {
          icon: {
            name: 'minus',
            color: 'red',
          },
          compact: true,
          disabled: idx === 0,
          onClick: filter.handleRemove,
          'data-idx': idx,
        }),
      ),
    );
  });
  return React__default.createElement(
    semanticUiReact.Popup,
    {
      position: 'bottom center',
      trigger: React__default.createElement(
        'span',
        {
          onClick: stopPropFunc,
        },
        props.trigger,
      ),
      className: 'ComparisonFilterPopup',
      on: 'click',
      onOpen: filter.handleOpen,
      onClick: stopPropFunc,
    },
    React__default.createElement(
      semanticUiReact.Popup.Content,
      {
        className: 'ComparisonFilter',
      },
      filterInputs,
      React__default.createElement(
        semanticUiReact.Divider,
        {
          horizontal: true,
        },
        React__default.createElement(semanticUiReact.Button, {
          className: 'add',
          icon: {
            name: 'plus circle',
            color: 'green',
            size: 'large',
          },
          compact: true,
          onClick: filter.handleAdd,
        }),
      ),
      React__default.createElement(
        semanticUiReact.Button.Group,
        {
          fluid: true,
          widths: 2,
          style: {
            position: 'sticky',
            bottom: '0px',
          },
        },
        React__default.createElement(
          semanticUiReact.Button,
          {
            positive: true,
            onClick: filter.handleFilter,
          },
          'Filter',
        ),
        React__default.createElement(
          semanticUiReact.Button,
          {
            negative: true,
            onClick: filter.handleClear,
          },
          'Clear',
        ),
      ),
    ),
  );
}; // AlphanumericFilterPopup.defaultProps = {
//   selectedOpts: [alphanumericInitialState],
// };

var filterTypes = {
  multiFilter: {
    filter: function filter(item, filterField, filterValues) {
      if (!filterValues || filterValues.length === 0) {
        return true;
      }

      var itemFieldValues;

      if (!Array.isArray(item[filterField])) {
        itemFieldValues = [item[filterField]];
      } else {
        itemFieldValues = item[filterField];
      }

      return !itemFieldValues.every(function(itemValue) {
        return !filterValues.includes(itemValue);
      });
    },
    component: MultiFilterDropdown,
  },
  remoteMultiFilter: {
    filter: function filter(item, filterField, filterValues) {
      if (!filterValues || filterValues.length === 0) {
        return true;
      }

      var itemFieldValues;

      if (!Array.isArray(item[filterField])) {
        itemFieldValues = [item[filterField]];
      } else {
        itemFieldValues = item[filterField];
      }

      return !itemFieldValues.every(function(itemValue) {
        return !filterValues.includes(itemValue);
      });
    },
    component: RemoteMultiFilterDropdown,
  },
  dateFilter: {
    filter: function filter(item, filterField, filterValues) {
      if (!filterValues) {
        return true;
      }

      var startDate = filterValues.startDate,
        endDate = filterValues.endDate;
      var date = new Date(item[filterField]).toISOString().slice(0, 10);

      if (startDate && date <= new Date(startDate).toISOString().slice(0, 10)) {
        return false;
      }

      if (endDate && date >= new Date(endDate).toISOString().slice(0, 10)) {
        return false;
      }

      return true;
    },
    component: DateFilterDropdown,
  },
  numericFilter: {
    filter: /*#__PURE__*/ comparisonFilter(numericComparisons$1),
    component: NumericFilterPopup,
  },
  alphanumericFilter: {
    filter: /*#__PURE__*/ comparisonFilter(alphanumericComparisons$1),
    component: AlphanumericFilterPopup,
  },
};
var singleComparators = {
  null: true,
  '!null': true,
  empty: true,
  '!empty': true,
};

function comparisonFilter(comparisons) {
  return function(item, filterField, filterValues) {
    if (!filterValues) return true;
    var isValid = true;
    var orHasValue = false;

    for (
      var _iterator = _createForOfIteratorHelperLoose(filterValues), _step;
      !(_step = _iterator()).done;

    ) {
      var opts = _step.value;

      if (opts.combination === '||') {
        if (isValid && orHasValue) break;
        isValid = true;
        orHasValue = false;
      } else if (isValid === false) {
        continue;
      }

      if (!(singleComparators[opts.comparison] || opts.value)) {
        continue;
      }

      orHasValue = true;

      if (!comparisons(opts.comparison, item[filterField], opts.value)) {
        isValid = false;
      }
    }

    return orHasValue && isValid;
  };
}

function numericComparisons$1(comparison, a, b) {
  /* eslint-disable eqeqeq */
  switch (comparison) {
    case '=':
      return a == b;

    case '!=':
      return a != b;

    case '>=':
      return a >= b;

    case '>':
      return a > b;

    case '<=':
      return a <= b;

    case '<':
      return a < b;

    case 'null':
      return a == null;

    case '!null':
      return a != null;

    default:
      return true;
  }
}

function alphanumericComparisons$1(comparison, a, b) {
  var stringA = String(a).toUpperCase();
  var stringB = String(b).toUpperCase();

  switch (comparison) {
    case '=':
      return stringA === stringB;

    case '!=':
      return stringA !== stringB;

    case 'contains':
      return stringA.includes(stringB);

    case '!contains':
      return !stringA.includes(stringB);

    case 'starts':
      return stringA.startsWith(stringB);

    case 'ends':
      return stringA.endsWith(stringB);

    case 'null':
      return a == null;

    case '!null':
      return a != null;

    case 'empty':
      return stringA === '';

    case '!empty':
      return stringA !== '';

    default:
      return true;
  }
}

function getTemplate(column) {
  if (column.template) {
    return column.template;
  }

  if (typeMap[column.type]) {
    return typeMap[column.type].template;
  }

  return undefined;
}
function getExportTemplate(column) {
  var _typeMap, _column$type;

  if (column.exportTemplate) {
    return column.exportTemplate;
  }

  return (_typeMap =
    typeMap[
      (_column$type = column.type) !== null && _column$type !== void 0
        ? _column$type
        : ''
    ]) === null || _typeMap === void 0
    ? void 0
    : _typeMap.exportTemplate; // if (column.type && typeMap[column.type]) {
  //   return typeMap[column.type].exportTemplate;
  // }
  // return undefined;
}
function getFieldValue(item, field, type) {
  var _typeMap2;

  var fieldName;
  var accessor =
    (_typeMap2 = typeMap[type || '']) === null || _typeMap2 === void 0
      ? void 0
      : _typeMap2.accessor;

  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.accessor) accessor = field.accessor;
  } else {
    fieldName = field;
  }

  switch (typeof accessor) {
    case 'function':
      return accessor(item, fieldName);

    case 'object':
      return accessor[item[fieldName]];

    default:
      return item[accessor || fieldName];
  }
}
function getField(field) {
  if (field === null) return field;

  switch (typeof field) {
    case 'object':
      return field.field;

    default:
      return field;
  }
}
var typeMap = {
  number: {
    sortAccessor: function sortAccessor(item, field) {
      return Number(item[field]);
    },
    groupAccessor: function groupAccessor(item, field) {
      return '#' + item[field];
    },
  },
  date: {
    accessor: function accessor(item, field) {
      if (!item[field]) return undefined;
      var date = moment(new Date(item[field]));
      return date.isValid() ? date : undefined; // .format('D/MMM/YYYY') : 'N/A';
      // return value ? value.format('D/MMM/Y') : 'N/A';
    },
    sortAccessor: function sortAccessor(item, field) {
      return item[field] && new Date(item[field]).toISOString().slice(0, 10);
    },
    groupAccessor: function groupAccessor(item, field) {
      return item[field] && moment(new Date(item[field])).format('D/MMM/Y');
    },
    exportTemplate: function exportTemplate(value) {
      return value ? value.format('D/MMM/Y') : 'N/A';
    },
    template: function template(value) {
      return value ? value.format('D/MMM/Y') : 'N/A';
    },
  },
  datetime: {
    accessor: function accessor(item, field) {
      if (!item[field]) return undefined;
      var date = moment(new Date(item[field]));
      return date.isValid() ? date : undefined; // .format('D/MMM/YYYY') : 'N/A';
      // return value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A';
    },
    sortAccessor: function sortAccessor(item, field) {
      return item[field] && new Date(item[field]);
    },
    groupAccessor: function groupAccessor(item, field) {
      return item[field] && moment(new Date(item[field])).format('D/MMM/Y');
    },
    exportTemplate: function exportTemplate(value) {
      return value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A';
    },
    template: function template(value) {
      return value ? value.format('D/MMM/Y HH:mm:ss') : 'N/A';
    },
  },
};
function getFieldGroupValueFunction(field, type) {
  var _typeMap3;

  var fieldName;
  var groupAccessor =
    (_typeMap3 = typeMap[type || '']) === null || _typeMap3 === void 0
      ? void 0
      : _typeMap3.groupAccessor;

  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.groupAccessor) groupAccessor = field.groupAccessor;
  } else {
    fieldName = field;
  }

  switch (typeof groupAccessor) {
    case 'function': {
      var accessor = groupAccessor;
      return function(item) {
        return accessor(item, fieldName);
      };
    }

    case 'object': {
      var _accessor = groupAccessor;
      return function(item) {
        return _accessor[item[fieldName]];
      };
    }

    default: {
      var _accessor2 = groupAccessor || fieldName;

      return function(item) {
        return item[_accessor2];
      };
    }
  }
}
function getFieldSortValueFunction(field, type) {
  var _typeMap4;

  var fieldName;
  var sortAccessor =
    (_typeMap4 = typeMap[type || '']) === null || _typeMap4 === void 0
      ? void 0
      : _typeMap4.sortAccessor;

  if (typeof field === 'object') {
    fieldName = field.field;
    if (field.sortAccessor) sortAccessor = field.sortAccessor;
  } else {
    fieldName = field;
  }

  switch (typeof sortAccessor) {
    case 'function': {
      var accessor = sortAccessor;
      return function(item) {
        return accessor(item, fieldName);
      };
    }

    case 'object': {
      var _accessor3 = sortAccessor;
      return function(item) {
        return _accessor3[item[fieldName]];
      };
    }

    default: {
      var _accessor4 = sortAccessor || fieldName;

      return function(item) {
        var val = item[_accessor4];
        return Array.isArray(val) ? val.toString() : val;
      };
    }
  }
}

var excelLogo =
  'data:image/webp;base64,UklGRrYCAABXRUJQVlA4WAoAAAAQAAAAIgAAIgAAQUxQSIoAAAANcFpt27K8P5qo7u7wZGYgkhiCLZiATCW5jWDR3YlM4KT/fL8mUkRMAKm1Gfq+BBo/AOipWRHHmASQJNGNWQB+Yo7kmaY9okSZBMcLTJnSmKR332Tw330jWhYBxHRMqyrTjIieg8lkco4CSJv4tjUmxsdiMpkszABgJ0l/x8lkMvkgJwX/ffKSTkxWUDggBgIAAFAKAJ0BKiMAIwA+USCNRCOiIRccBZg4BQSyC8AA/78XUZqZ+IB6wGmZ8sB8GUsxx2/6X+QHpf/OWHHf0n3M+276AC9vjjuJedH4dU8PX6wcy161gSu1AZTYmgAA/vQZkRb1eznLfFZOpFT7zmzrr3/x2sflg9BPWFnUaQVqKd4IoGt2IrvFm/2gda5PT+Qk7x9J3tf1oY/9D64RNOVjgJt4H3FFLzDck4mvA/1hA0y/AYEL2y9yAZ3Ozv/9AnbS4jv+Wav+sLC/3sX6p/7E3JsbtiEHoGG8h//6BXI+BwmeKqmai99NN5v3r3L1MVLmK/R1Xsukcho2hTrm09nuPg9CEAoNH47/hGv3ILW/PiG0w1gTxhKgXFP/nrP/x6nqW5+439//kYogAzgl6puDT2mgDvOsnF8otZk4vz0qfzpByAFbZv4e+heFr/81Q3FsdiDweL3816loiAA8DFDB0OrAf7Uf3L7VzIM+Lz1zzKWp07f9miJfUSWpS0TU3yG8Ui+/rwn/zG+sOyUcMy5l0e/D0b6NuTpslnA8ayMXOX+rvRhD+5RuNoNbH6Fk9X+IYTr+yT6oPP191SSxFa7n/Fsir+OmRQWhhBQFwLAPBXHEQ6WndWf4ENqV/Atg+Zpk0zkTeH5FlXURY0v/y54Gqn/xwH/+rMMupaDcyjn3OqfXroAAAAAA';
var paginationOpts = [
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
];

var stubFunction = function stubFunction() {
  return {};
};

var stubArray$1 = [];
var filteredIcon = /*#__PURE__*/ React__default.createElement(
  semanticUiReact.Icon.Group,
  null,
  /*#__PURE__*/ React__default.createElement(semanticUiReact.Icon, {
    name: 'filter',
    color: 'blue',
  }),
  /*#__PURE__*/ React__default.createElement(semanticUiReact.Icon, {
    corner: true,
    name: 'asterisk',
    color: 'blue',
  }),
);
var unfilteredIcon = /*#__PURE__*/ React__default.createElement(
  semanticUiReact.Icon,
  {
    name: 'filter',
  },
);

function QHGridHeader(props) {
  var _useState = React.useState(false),
    columnOpen = _useState[0],
    setColumnOpen = _useState[1];

  var _useState2 = React.useState(props.generalSearch),
    generalSearch = _useState2[0],
    setGeneralSearch = _useState2[1];

  React.useEffect(
    function() {
      setGeneralSearch(props.generalSearch);
    },
    [props.generalSearch],
  );
  var onGeneralSearch = props.onGeneralSearch;
  var handlePropsGeneralSearch = React.useMemo(
    function() {
      return lodashEs.debounce(function(value) {
        onGeneralSearch === null || onGeneralSearch === void 0
          ? void 0
          : onGeneralSearch(value);
      }, props.generalSearchDebounceTime);
    },
    [onGeneralSearch, props.generalSearchDebounceTime],
  );
  var generalSearchRef = React.useRef(props.generalSearch);
  generalSearchRef.current = props.generalSearch;
  React.useEffect(
    function() {
      if (generalSearchRef.current === generalSearch) {
        return;
      }

      handlePropsGeneralSearch(generalSearch);
    },
    [generalSearch, handlePropsGeneralSearch],
  ); // For Grouping

  var onDrop = function onDrop(evt) {
    var _props$onGroupChange;

    var colId = evt.dataTransfer.getData('colId');

    if (!colId) {
      return;
    }

    if (
      grouping.find(function(group) {
        return group.colId === colId;
      })
    ) {
      return;
    }

    (_props$onGroupChange = props.onGroupChange) === null ||
    _props$onGroupChange === void 0
      ? void 0
      : _props$onGroupChange.call(
          props,
          grouping
            .map(function(group) {
              return {
                colId: group.colId,
                sortOrder: group.sortOrder,
              };
            })
            .concat({
              colId: colId,
              sortOrder: 'asc',
            }),
        );
  };

  var allowDrop = function allowDrop(evt) {
    if (evt.dataTransfer.types[0] === 'colid') {
      evt.preventDefault();
    }
  };

  var columns = props.columns,
    grouping = props.grouping;
  var sortedColumns = React.useMemo(
    function() {
      return lodashEs.sortBy(columns, 'title');
    },
    [columns],
  );
  var columnMenuItems = columnOpen
    ? sortedColumns.map(function(col) {
        return React__default.createElement(
          semanticUiReact.Dropdown.Item,
          {
            key: col.id,
            onClick: function onClick(evt) {
              var _props$onColumnVisibi;

              evt.stopPropagation();
              (_props$onColumnVisibi = props.onColumnVisibilityToggle) ===
                null || _props$onColumnVisibi === void 0
                ? void 0
                : _props$onColumnVisibi.call(props, col.id);
            },
          },
          !col.hidden &&
            React__default.createElement(semanticUiReact.Icon, {
              color: 'green',
              name: 'checkmark',
            }),
          col.title,
        );
      })
    : null;

  var handleRemoveGroupBy = function handleRemoveGroupBy(colId) {
    var _props$onGroupChange2;

    (_props$onGroupChange2 = props.onGroupChange) === null ||
    _props$onGroupChange2 === void 0
      ? void 0
      : _props$onGroupChange2.call(
          props,
          grouping.filter(function(group) {
            return group.colId !== colId;
          }),
        );
  };

  var handleGroupSortToggle = function handleGroupSortToggle(colId) {
    var _props$onGroupChange3;

    var sortSwitch = {
      asc: 'desc',
      desc: 'asc',
    };
    (_props$onGroupChange3 = props.onGroupChange) === null ||
    _props$onGroupChange3 === void 0
      ? void 0
      : _props$onGroupChange3.call(
          props,
          grouping.map(function(group) {
            return group.colId === colId
              ? {
                  colId: group.colId,
                  sortOrder: sortSwitch[group.sortOrder],
                }
              : group;
          }),
        );
  };

  var groupMenuItems = grouping.map(function(group) {
    var colId = group.colId;
    var col = columns.find(function(col) {
      return col.id === group.colId;
    });
    var sortIcon =
      group.sortOrder === 'asc'
        ? React__default.createElement(semanticUiReact.Icon, {
            name: 'long arrow alternate up',
          })
        : React__default.createElement(semanticUiReact.Icon, {
            name: 'long arrow alternate down',
          });
    return React__default.createElement(
      semanticUiReact.Button.Group,
      {
        key: colId,
        inverted: true,
        size: 'mini',
        compact: true,
        style: {
          marginRight: '10px',
        },
      },
      React__default.createElement(
        semanticUiReact.Button,
        {
          inverted: true,
          size: 'mini',
          compact: true,
          onClick: function onClick() {
            return handleGroupSortToggle(colId);
          },
        },
        sortIcon,
        (col === null || col === void 0 ? void 0 : col.title) || colId,
      ),
      React__default.createElement(
        semanticUiReact.Button,
        {
          inverted: true,
          size: 'mini',
          compact: true,
          color: 'red',
          basic: true,
          onClick: function onClick() {
            return handleRemoveGroupBy(colId);
          },
        },
        'X',
      ),
    );
  });
  return React__default.createElement(
    semanticUiReact.Table,
    {
      compact: 'very',
      size: 'small',
      style: {
        marginBottom: 0,
        paddingBottom: 0,
      },
    },
    React__default.createElement(
      semanticUiReact.Table.Header,
      null,
      (props.onGeneralSearch ||
        props.onColumnVisibilityToggle ||
        props.extraHeaderItem ||
        props.exportBaseName) &&
        React__default.createElement(
          semanticUiReact.Table.Row,
          null,
          React__default.createElement(
            semanticUiReact.Table.HeaderCell,
            {
              style: {
                backgroundColor: '#1678C2',
                color: 'white',
              },
              className: 'QHGrid--header',
            },
            props.onGeneralSearch &&
              React__default.createElement(semanticUiReact.Input, {
                className: 'QHGrid--generalSearch',
                icon: 'search',
                iconPosition: 'left',
                placeholder: 'Search...',
                value: generalSearch,
                onChange: function onChange(_ev, data) {
                  return setGeneralSearch(data.value);
                },
                action: {
                  color: 'red',
                  icon: 'x',
                  onClick: function onClick() {
                    return setGeneralSearch('');
                  },
                  title: 'Clear Search',
                },
              }),
            props.onColumnVisibilityToggle &&
              React__default.createElement(
                semanticUiReact.Dropdown,
                {
                  scrolling: true,
                  trigger: React__default.createElement(
                    semanticUiReact.Button,
                    {
                      inverted: true,
                    },
                    React__default.createElement(semanticUiReact.Icon, {
                      name: 'columns',
                    }),
                    'Columns',
                  ),
                  icon: null,
                  open: columnOpen,
                  onOpen: function onOpen() {
                    return setColumnOpen(true);
                  },
                  onClose: function onClose() {
                    return setColumnOpen(false);
                  },
                  name: 'column',
                },
                React__default.createElement(
                  semanticUiReact.Dropdown.Menu,
                  null,
                  columnMenuItems,
                ),
              ),
            props.extraHeaderItem,
            !props.loading &&
              !!props.exportBaseName &&
              React__default.createElement(semanticUiReact.Image, {
                src: excelLogo,
                avatar: true,
                size: 'mini',
                onClick: function onClick() {
                  return props.onExportExcel();
                },
                style: {
                  float: 'right',
                  cursor: 'pointer',
                },
              }),
          ),
        ),
      props.onGroupChange &&
        React__default.createElement(
          semanticUiReact.Table.Row,
          null,
          React__default.createElement(
            semanticUiReact.Table.HeaderCell,
            {
              style: {
                backgroundColor: '#1678C2',
                color: 'white',
                borderRadius: 0,
                borderTop: '2px solid white',
                paddingTop: '4px',
                paddingBottom: '4px',
              },
              onDrop: onDrop,
              onDragOver: allowDrop,
            },
            groupMenuItems,
            'Drag a column header and drop it here to group by that column',
          ),
        ),
    ),
  );
}

function QHGridBodyHeaders(props) {
  var enableDrag = props.enableDrag || !!props.onColumnReorder;

  var _useState3 = React.useState(-1),
    dragIndex = _useState3[0],
    setDragIndex = _useState3[1];

  var _useState4 = React.useState(-1),
    hoverIndex = _useState4[0],
    setHoverIndex = _useState4[1];

  var handleHeaderDragStart = function handleHeaderDragStart(evt) {
    var _dataset$id;

    var dataset = evt.currentTarget.dataset;
    evt.dataTransfer.setData(
      'colId',
      (_dataset$id = dataset.id) !== null && _dataset$id !== void 0
        ? _dataset$id
        : '',
    );
    setDragIndex(Number(dataset.index));
  };

  var handleHeaderDrop = function handleHeaderDrop(evt) {
    var _props$onColumnReorde;

    setDragIndex(-1);

    if (!evt.dataTransfer.getData('colId')) {
      return;
    }

    var index = Number(evt.currentTarget.dataset.index);

    if (Number.isNaN(index) || dragIndex === -1 || dragIndex === index) {
      return;
    }

    (_props$onColumnReorde = props.onColumnReorder) === null ||
    _props$onColumnReorde === void 0
      ? void 0
      : _props$onColumnReorde.call(props, dragIndex, index);
  };

  var handleHeaderDragEnd = function handleHeaderDragEnd() {
    setDragIndex(-1);
    setHoverIndex(-1);
  };

  var handleAllowDrop = function handleAllowDrop(evt) {
    if (props.onColumnReorder && evt.dataTransfer.types[0] === 'colid') {
      evt.preventDefault();
    }
  };

  var handleHeaderDragEnter = function handleHeaderDragEnter(evt) {
    if (evt.dataTransfer.types[0] === 'colid') {
      setHoverIndex(Number(evt.currentTarget.dataset.index));
    }
  };

  var handleHeaderDragLeave = function handleHeaderDragLeave(evt) {
    if (evt.dataTransfer.types[0] === 'colid') {
      var dataset = evt.currentTarget.dataset;
      setHoverIndex(function(prev) {
        return prev === Number(dataset.index) ? -1 : prev;
      });
    }
  };

  var handleSort = function handleSort(evt) {
    var id = evt.currentTarget.dataset.id;

    if (id) {
      var _props$onSort;

      (_props$onSort = props.onSort) === null || _props$onSort === void 0
        ? void 0
        : _props$onSort.call(props, id);
    }
  };

  var leftHoverStyle = {
    borderLeft: '5px solid #1678C2',
  };
  var rightHoverStyle = {
    borderRight: '5px solid #1678C2',
  };
  var visibleColumns = props.columns
    .map(function(col, index) {
      return _extends({}, col, {
        index: index,
      });
    })
    .filter(function(col) {
      return !col.hidden;
    });
  var columnElements = visibleColumns.map(function(col) {
    var _col$filterable,
      _col$filterable2,
      _filterTypes$filterTy,
      _props$filters$,
      _col$headerAttributes;

    var field = getField(col.field);
    var index = col.index,
      id = col.id;
    var sortProps = col.sortDisabled
      ? {}
      : {
          sorted:
            props.sortBy === id
              ? props.sortOrder === 'asc'
                ? 'ascending'
                : 'descending'
              : undefined,
          onClick: handleSort,
        };
    var dragProps = {
      'data-id': id,
      'data-index': index,
      draggable: enableDrag,
      onDragStart: handleHeaderDragStart,
      onDrop: handleHeaderDrop,
      onDragEnd: handleHeaderDragEnd,
      onDragOver: handleAllowDrop,
      onDragEnter: handleHeaderDragEnter,
      onDragLeave: handleHeaderDragLeave,
    };
    var style = {};

    if (!props.onColumnReorder);
    else if (dragIndex < hoverIndex && hoverIndex === index) {
      style = rightHoverStyle;
    } else if (dragIndex > hoverIndex && hoverIndex === index) {
      style = leftHoverStyle;
    }

    var filterType =
      (_col$filterable = col.filterable) === null || _col$filterable === void 0
        ? void 0
        : _col$filterable.type;
    var filterProps =
      (_col$filterable2 = col.filterable) === null ||
      _col$filterable2 === void 0
        ? void 0
        : _col$filterable2.props;
    var FilterDropdown = filterType
      ? (_filterTypes$filterTy = filterTypes[filterType]) === null ||
        _filterTypes$filterTy === void 0
        ? void 0
        : _filterTypes$filterTy.component
      : undefined;
    var filterVals =
      (_props$filters$ = props.filters['' + field]) === null ||
      _props$filters$ === void 0
        ? void 0
        : _props$filters$.value;
    return React__default.createElement(
      semanticUiReact.Table.HeaderCell,
      Object.assign(
        {},
        col.headerAttributes,
        {
          className: dragIndex !== -1 ? 'dragging' : '',
          key: col.id,
        },
        sortProps,
        dragProps,
        {
          style: _extends(
            {},
            style,
            (_col$headerAttributes = col.headerAttributes) === null ||
              _col$headerAttributes === void 0
              ? void 0
              : _col$headerAttributes.style,
          ),
          nowrap: 'true',
          collapsing: true,
        },
      ),
      col.title,
      props.onFilterUpdate &&
        FilterDropdown &&
        React__default.createElement(
          FilterDropdown,
          Object.assign({}, filterProps, {
            selectedOpts: filterVals,
            onChange: props.onFilterUpdate(getField(col.field), filterType),
            trigger: filterVals ? filteredIcon : unfilteredIcon,
            data: props.rawData,
            field: getField(col.field),
            filterType: filterType,
          }),
        ),
    );
  });
  return React__default.createElement(
    React__default.Fragment,
    null,
    columnElements,
  );
}

function QHGridBody(props) {
  var joinChar = '\u200C';

  var _useState5 = React.useState({}),
    hidden = _useState5[0],
    setHidden = _useState5[1];

  React.useEffect(
    function() {
      setHidden({});
    },
    [props.grouping],
  );

  var handleToggle = function handleToggle(key) {
    return function() {
      setHidden(function(prev) {
        var _extends2;

        return _extends(
          {},
          prev,
          ((_extends2 = {}), (_extends2[key] = !prev[key]), _extends2),
        );
      });
    };
  };

  var curGroups = [];
  var groupAccessors = props.grouping.map(function(group) {
    return getFieldGroupValueFunction(group.field, group.type);
  });
  var curRow = 0;
  var rows = props.slicedData.map(function(item, idx) {
    var _props$rowLevelPropsC, _props$rowLevelStyleC;

    var groupValues = groupAccessors.map(function(accessor) {
      return accessor(item);
    });
    var rowLevelProps =
      ((_props$rowLevelPropsC = props.rowLevelPropsCalc) === null ||
      _props$rowLevelPropsC === void 0
        ? void 0
        : _props$rowLevelPropsC.call(props, item, curRow)) || {};
    var rowLevelStyle =
      (_props$rowLevelStyleC = props.rowLevelStyleCalc) === null ||
      _props$rowLevelStyleC === void 0
        ? void 0
        : _props$rowLevelStyleC.call(props, item, curRow);
    curRow += 1;
    var isHidden = false;
    var hiddenGroupIndex = -1;

    for (var index = 0; index < groupValues.length; ++index) {
      var groupName = groupValues.slice(0, index + 1).join(joinChar);

      if (hidden[groupName]) {
        isHidden = true;
        hiddenGroupIndex = index;
        break;
      }
    }

    var row = isHidden
      ? null
      : React__default.createElement(
          semanticUiReact.Table.Row,
          Object.assign(
            {
              style: rowLevelStyle,
            },
            rowLevelProps,
            {
              key: props.itemKeyMap(item) || idx,
              onClick: function onClick(evt) {
                var _props$onRowClick;

                return (_props$onRowClick = props.onRowClick) === null ||
                  _props$onRowClick === void 0
                  ? void 0
                  : _props$onRowClick.call(
                      props,
                      evt,
                      item,
                      props.startIndex + idx,
                    );
              },
            },
          ),
          props.grouping.map(function(_group, groupIdx) {
            return React__default.createElement(semanticUiReact.Table.Cell, {
              style: {
                backgroundColor: '#F2F2F2',
              },
              key: groupIdx,
              collapsing: true,
            });
          }),
          props.visibleColumns.map(function(col) {
            var template = getTemplate(col);
            return React__default.createElement(
              semanticUiReact.Table.Cell,
              {
                key: col.id || col.title,
              },
              template === undefined
                ? getFieldValue(item, col.field, col.type)
                : template(
                    getFieldValue(item, col.field, col.type),
                    item,
                    props.additionalTemplateInfo,
                  ),
            );
          }),
        );

    if (!props.grouping.length) {
      return row;
    }

    var groupsToDisplay = -1;

    for (var _index = 0; _index < groupValues.length; ++_index) {
      if (groupsToDisplay === -1 && curGroups[_index] !== groupValues[_index]) {
        groupsToDisplay = _index;
      }

      if (groupsToDisplay >= 0) {
        curGroups[_index] = groupValues[_index];
      }
    }

    if (groupsToDisplay === -1) {
      return row;
    }

    var groupDisplays = [];

    for (
      var _index2 = groupsToDisplay;
      _index2 < groupValues.length;
      ++_index2
    ) {
      var group = props.grouping[_index2];

      var _groupName = groupValues.slice(0, _index2 + 1).join(joinChar);

      var value = groupValues[_index2];

      if (hiddenGroupIndex > -1 && _index2 > hiddenGroupIndex) {
        continue;
      }

      groupDisplays.push(
        React__default.createElement(
          semanticUiReact.Table.Row,
          {
            key: '' + group.title + _groupName,
          },
          lodashEs.range(_index2).map(function(rangeIdx) {
            return React__default.createElement(semanticUiReact.Table.Cell, {
              style: {
                backgroundColor: '#F2F2F2',
              },
              key: rangeIdx,
              collapsing: true,
            });
          }),
          React__default.createElement(
            semanticUiReact.Table.Cell,
            {
              onClick: handleToggle(_groupName),
              colSpan:
                props.visibleColumns.length + props.grouping.length - _index2,
              style: {
                cursor: 'pointer',
                backgroundColor: '#F2F2F2',
              },
              collapsing: true,
            },
            React__default.createElement(semanticUiReact.Icon, {
              name: 'caret ' + (hidden[_groupName] ? 'right' : 'down'),
            }),
            React__default.createElement(
              'strong',
              null,
              group.title,
              ': ',
              value,
            ),
          ),
        ),
      );
    }

    return [].concat(groupDisplays, [row]);
  });
  return React__default.createElement(React__default.Fragment, null, rows);
}

function QHGrid(_ref) {
  var _props$totalRows,
    _props$activePage,
    _props$itemsPerPage,
    _grouping$0$colId,
    _grouping$,
    _grouping$0$sortOrder,
    _grouping$2;

  var _ref$loadingMessage = _ref.loadingMessage,
    loadingMessage =
      _ref$loadingMessage === void 0
        ? 'Loading Data... Please Wait...'
        : _ref$loadingMessage,
    _ref$emptyMessage = _ref.emptyMessage,
    emptyMessage =
      _ref$emptyMessage === void 0 ? 'No Data Available' : _ref$emptyMessage,
    _ref$height = _ref.height,
    height = _ref$height === void 0 ? '70vh' : _ref$height,
    _ref$generalSearchDeb = _ref.generalSearchDebounceTime,
    generalSearchDebounceTime =
      _ref$generalSearchDeb === void 0 ? 500 : _ref$generalSearchDeb,
    _ref$grouping = _ref.grouping,
    grouping = _ref$grouping === void 0 ? stubArray$1 : _ref$grouping,
    props = _objectWithoutPropertiesLoose(_ref, [
      'loadingMessage',
      'emptyMessage',
      'height',
      'generalSearchDebounceTime',
      'grouping',
    ]);

  var _useState6 = React.useState(1),
    activePageState = _useState6[0],
    setActivePage = _useState6[1];

  var _useState7 = React.useState(15),
    itemsPerPageState = _useState7[0],
    setItemsPerPage = _useState7[1];

  var bodyRef = React.useRef(null);
  var data = React.useMemo(
    function() {
      var data = props.data;

      if (props.isPaginated) {
        return data;
      }

      if (!lodashEs.isEmpty(props.filters)) {
        var filters = Object.entries(props.filters);
        data = data.filter(function(item) {
          var include = true;

          for (
            var _iterator = _createForOfIteratorHelperLoose(filters), _step;
            !(_step = _iterator()).done;

          ) {
            var _filterTypes$type;

            var _step$value = _step.value,
              field = _step$value[0],
              _step$value$ = _step$value[1],
              type = _step$value$.type,
              value = _step$value$.value;

            var _ref2 =
                (_filterTypes$type = filterTypes[type]) !== null &&
                _filterTypes$type !== void 0
                  ? _filterTypes$type
                  : {},
              _filter = _ref2.filter;

            if (!_filter) {
              continue;
            }

            include = _filter(item, field, value);
            if (!include) break;
          }

          return include;
        });
      }

      if (props.generalSearch) {
        data = data.filter(function(item) {
          return Object.values(item)
            .join('\u200C')
            .includes(props.generalSearch);
        });
      }

      return data;
    },
    [props.data, props.generalSearch, props.filters, props.isPaginated],
  );

  var handlePageChange = function handlePageChange(_event, data) {
    var activePage = data.activePage;

    if (typeof activePage !== 'number') {
      return;
    }

    if (props.activePage) {
      var _props$onPageChange;

      (_props$onPageChange = props.onPageChange) === null ||
      _props$onPageChange === void 0
        ? void 0
        : _props$onPageChange.call(props, activePage);
    } else {
      setActivePage(activePage);
    }

    if (bodyRef.current) {
      bodyRef.current.scrollTop = 0;
    }
  };

  var handleItemsPerPageChange = function handleItemsPerPageChange(
    _event,
    data,
  ) {
    var itemsPerPage = data.value;

    if (typeof itemsPerPage !== 'number') {
      return;
    }

    if (props.itemsPerPage) {
      if (props.itemsPerPage !== itemsPerPage) {
        var _props$onItemsPerPage;

        (_props$onItemsPerPage = props.onItemsPerPageChange) === null ||
        _props$onItemsPerPage === void 0
          ? void 0
          : _props$onItemsPerPage.call(props, itemsPerPage);
      }
    } else {
      setItemsPerPage(itemsPerPage);
    }
  };

  React.useEffect(
    function() {
      setActivePage(1);
    },
    [props.data, props.activePage],
  ); // const { data = stubArray } = props;

  var visibleColumns = React.useMemo(
    function() {
      return props.columns
        .map(function(col, idx) {
          return _extends({}, col, {
            QHgridIndex: idx,
          });
        })
        .filter(function(col) {
          return !col.hidden;
        });
    },
    [props.columns],
  );
  var itemKeyMap = React.useMemo(
    function() {
      var uniqueColumns = props.columns.filter(function(col) {
        return col.unique;
      });
      return function(item) {
        return uniqueColumns.length
          ? uniqueColumns
              .map(function(col) {
                return getFieldValue(item, col.field, col.type);
              })
              .join(',')
          : undefined;
      };
    },
    [props.columns],
  );
  var _props$columnsConfig = props.columnsConfig,
    columnsConfig =
      _props$columnsConfig === void 0 ? props.columns : _props$columnsConfig;
  var numColumns = visibleColumns.length;
  var numRows =
    (_props$totalRows = props.totalRows) !== null && _props$totalRows !== void 0
      ? _props$totalRows
      : data.length;
  var activePage =
    (_props$activePage = props.activePage) !== null &&
    _props$activePage !== void 0
      ? _props$activePage
      : activePageState;
  var itemsPerPage =
    (_props$itemsPerPage = props.itemsPerPage) !== null &&
    _props$itemsPerPage !== void 0
      ? _props$itemsPerPage
      : itemsPerPageState;
  var numPages = Math.ceil(numRows / itemsPerPage) || 1;
  var realStartIndex = (activePage - 1) * itemsPerPage || 0;
  var realEndIndex =
    activePage * itemsPerPage > numRows ? numRows : activePage * itemsPerPage;
  var startIndex = realStartIndex;
  var endIndex = realEndIndex;

  if (props.isPaginated) {
    startIndex = 0;
    endIndex = itemsPerPage;
  }

  var groupingWithExtraStuff = React.useMemo(
    function() {
      return grouping.map(function(group) {
        var col = columnsConfig.find(function(col) {
          return col.id === group.colId;
        }) || {
          field: '',
          title: '',
          type: '',
        };
        return _extends({}, group, {
          field: col.field,
          title: col.title,
          type: col.type,
        });
      });
    },
    [grouping, columnsConfig],
  );
  var initialSortBy =
    (_grouping$0$colId =
      (_grouping$ = grouping[0]) === null || _grouping$ === void 0
        ? void 0
        : _grouping$.colId) !== null && _grouping$0$colId !== void 0
      ? _grouping$0$colId
      : props.sortBy;
  var initialOrderBy =
    (_grouping$0$sortOrder =
      (_grouping$2 = grouping[0]) === null || _grouping$2 === void 0
        ? void 0
        : _grouping$2.sortOrder) !== null && _grouping$0$sortOrder !== void 0
      ? _grouping$0$sortOrder
      : props.sortOrder;
  var columnsById = React.useMemo(
    function() {
      return Object.fromEntries(
        columnsConfig.map(function(col) {
          return [col.id, col];
        }),
      );
    },
    [columnsConfig],
  );
  var sortColumn = initialSortBy ? columnsById[initialSortBy] : null;
  var groupDataMap = React.useMemo(
    function() {
      if (!sortColumn || props.isPaginated) {
        return null;
      }

      var map = new Map();
      var accessor = getFieldSortValueFunction(
        sortColumn.field,
        sortColumn.type,
      );

      for (
        var _iterator2 = _createForOfIteratorHelperLoose(data), _step2;
        !(_step2 = _iterator2()).done;

      ) {
        var item = _step2.value;
        var key = accessor(item);

        if (map.has(key)) {
          var _map$get;

          (_map$get = map.get(key)) === null || _map$get === void 0
            ? void 0
            : _map$get.push(item);
        } else {
          map.set(key, [item]);
        }
      }

      return map;
    },
    [data, sortColumn, props.isPaginated],
  );
  var sortedGroups = React.useMemo(
    function() {
      if (!sortColumn || !groupDataMap) {
        return null;
      }

      return lodashEs.orderBy(
        Array.from(groupDataMap.keys()),
        [],
        [
          initialOrderBy !== null && initialOrderBy !== void 0
            ? initialOrderBy
            : 'asc',
        ],
      );
    },
    [sortColumn, groupDataMap, initialOrderBy],
  );
  var slicedData = React.useMemo(
    function() {
      if (!sortColumn || !groupDataMap || !sortedGroups) {
        return data.slice(startIndex, endIndex);
      }

      var initialIndex = -1;
      var curIndex = 0;
      var slicedData = [];

      for (
        var _iterator3 = _createForOfIteratorHelperLoose(sortedGroups), _step3;
        !(_step3 = _iterator3()).done;

      ) {
        var groupName = _step3.value;
        var groupVals = groupDataMap.get(groupName);
        curIndex += groupVals.length;

        if (curIndex >= startIndex) {
          if (initialIndex === -1) {
            initialIndex = curIndex - groupVals.length;
          }

          slicedData = slicedData.concat(groupVals);
        }

        if (curIndex >= endIndex) {
          break;
        }
      }

      var groups = grouping.map(function(group) {
        return _extends({}, group, {
          col: columnsById[group.colId],
        });
      });
      var sortBys = groups.map(function(group) {
        return getFieldSortValueFunction(group.col.field, group.col.type);
      });

      if (props.sortBy) {
        var col = columnsById[props.sortBy];
        sortBys.push(getFieldSortValueFunction(col.field, col.type));
      }

      var sortOrders = groups.map(function(group) {
        return group.sortOrder;
      });

      if (props.sortOrder) {
        sortOrders.push(props.sortOrder);
      }

      slicedData = lodashEs
        .orderBy(slicedData, sortBys, sortOrders)
        .slice(startIndex - initialIndex, endIndex - initialIndex);
      return slicedData;
    },
    [
      sortColumn,
      groupDataMap,
      sortedGroups,
      grouping,
      props.sortBy,
      props.sortOrder,
      startIndex,
      endIndex,
      data,
      columnsById,
    ],
  );
  var onGroupChange = props.onGroupChange,
    onColumnVisibilityToggle = props.onColumnVisibilityToggle,
    loading = props.loading,
    generalSearch = props.generalSearch,
    onGeneralSearch = props.onGeneralSearch,
    exportBaseName = props.exportBaseName,
    extraHeaderItem = props.extraHeaderItem;

  function getSortedData() {
    if (!initialSortBy) {
      return data;
    }

    var groups = grouping.map(function(group) {
      return _extends({}, group, {
        col: columnsById[group.colId],
      });
    });
    var sortBys = groups.map(function(group) {
      return getFieldSortValueFunction(group.col.field, group.col.type);
    });

    if (props.sortBy) {
      var col = columnsById[props.sortBy];
      sortBys.push(getFieldSortValueFunction(col.field, col.type));
    }

    var sortOrders = groups.map(function(group) {
      return group.sortOrder;
    });

    if (props.sortOrder) {
      sortOrders.push(props.sortOrder);
    }

    return lodashEs.orderBy(data, sortBys, sortOrders);
  }

  var exportExcel = function exportExcel(name) {
    try {
      var _props$exportBaseName, _props$getExportData, _props$getExportData2;

      if (name === undefined)
        name =
          (_props$exportBaseName = props.exportBaseName) !== null &&
          _props$exportBaseName !== void 0
            ? _props$exportBaseName
            : '';
      var cols = props.columns;
      var dataPromise =
        (_props$getExportData =
          (_props$getExportData2 = props.getExportData) === null ||
          _props$getExportData2 === void 0
            ? void 0
            : _props$getExportData2.call(props)) !== null &&
        _props$getExportData !== void 0
          ? _props$getExportData
          : getSortedData();
      return Promise.resolve(
        new Promise(function(resolve) {
          resolve(_interopNamespace(require('xlsx')));
        })['catch'](function() {
          alert('XSLX needs to be imported!');
        }),
      ).then(function(XLSX) {
        if (!XLSX) return;
        return Promise.resolve(dataPromise).then(function(data) {
          var wb = XLSX.utils.book_new();
          var visibleColumns = lodashEs.filter(cols, function(col) {
            var notHidden = !col.hidden;
            var hideOnExport = col.hideOnExport;
            var visibleDueToOtherCol = false;

            if (col.exportIfVisible) {
              var dependentCol = lodashEs.find(cols, function(depCol) {
                return depCol.id === col.exportIfVisible;
              });
              visibleDueToOtherCol = !(dependentCol === null ||
              dependentCol === void 0
                ? void 0
                : dependentCol.hidden);
            }

            return (notHidden && !hideOnExport) || visibleDueToOtherCol;
          });
          var exportMainData = data.map(function(item) {
            return visibleColumns.map(function(col) {
              var template = getExportTemplate(col);
              var value = getFieldValue(item, col.field, col.type);
              if (template)
                value = template(value, item, props.additionalTemplateInfo);

              if (Array.isArray(value)) {
                value = value.join(' : ');
              }

              return moment.isMoment(value) ? moment(value).toDate() : value;
            });
          });
          var exportData = [
            visibleColumns.map(function(col) {
              return col.exportTitle || col.title;
            }),
          ].concat(exportMainData);
          var wscols = visibleColumns.map(function(_col, idx) {
            return {
              width: Math.max.apply(
                Math,
                exportMainData.map(function(row) {
                  var value = row[idx];
                  var colWidth = moment.isDate(value)
                    ? 18
                    : ('' + value).length * 1.5;
                  return colWidth > 70 ? 70 : colWidth < 18 ? 18 : colWidth;
                }),
              ),
            };
          });
          var ws = XLSX.utils.aoa_to_sheet(exportData, {
            cellDates: true,
          });
          ws['!autofilter'] = {
            ref: 'A1:' + XLSX.utils.encode_col(visibleColumns.length - 1) + '1',
          };
          ws['!cols'] = wscols;
          XLSX.utils.book_append_sheet(wb, ws, 'report');
          XLSX.writeFile(
            wb,
            name + ' - ' + moment().format('DD/MMM/YYYY') + '.xlsx',
          );
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  if (props.qhGridRef) {
    props.qhGridRef.current = {
      bodyRef: bodyRef,
      exportExcel: exportExcel,
      data: data,
      slicedData: slicedData,
      props: props,
      getSortedData: getSortedData,
    };
  }

  return React__default.createElement(
    'div',
    {
      className: 'QHGrid',
      style: {
        width: '100%',
        margin: 0,
        padding: 0,
      },
    },
    React__default.createElement(
      semanticUiReact.Dimmer,
      {
        active: props.loading,
        className: 'QHGrid--loading',
      },
      React__default.createElement(
        semanticUiReact.Loader,
        null,
        loadingMessage,
      ),
    ),
    React__default.createElement(QHGridHeader, {
      columns: props.columns,
      grouping: grouping,
      onGroupChange: onGroupChange,
      onColumnVisibilityToggle: onColumnVisibilityToggle,
      loading: loading,
      generalSearch: generalSearch,
      onGeneralSearch: onGeneralSearch,
      onExportExcel: exportExcel,
      exportBaseName: exportBaseName,
      generalSearchDebounceTime: generalSearchDebounceTime,
      extraHeaderItem: extraHeaderItem,
    }),
    React__default.createElement(
      'div',
      {
        className: 'QHGrid-body-div',
        style: {
          margin: 0,
          padding: 0,
          width: '100%',
          height: height,
          overflowX: 'auto',
          overflowY: 'auto',
        },
        ref: bodyRef,
      },
      React__default.createElement(
        semanticUiReact.Table,
        {
          className: 'QHGrid--body',
          fixed: props.loading && !props.isPaginated,
          striped: true,
          sortable: !!props.onSort,
          selectable: true,
          celled: true,
          compact: 'very',
          size: 'small',
          style: {
            marginTop: 0,
            paddingTop: 0,
            borderRadius: 0,
            marginBottom: 0,
            paddingBottom: 0,
            fontSize: 12,
          },
        },
        React__default.createElement(
          'colgroup',
          null,
          grouping.length > 0 &&
            React__default.createElement('col', {
              span: grouping.length,
            }),
          visibleColumns.map(function(column) {
            return React__default.createElement('col', {
              style: column.columnStyle,
              key: column.id || column.title,
            });
          }),
        ),
        React__default.createElement(
          semanticUiReact.Table.Header,
          null,
          React__default.createElement(
            semanticUiReact.Table.Row,
            null,
            lodashEs.map(grouping, function(_group, groupIdx) {
              return React__default.createElement(
                semanticUiReact.Table.HeaderCell,
                {
                  key: groupIdx,
                  collapsing: true,
                  style: {
                    cursor: 'default',
                  },
                },
              );
            }),
            React__default.createElement(QHGridBodyHeaders, {
              filters: props.filters,
              onFilterUpdate: props.onFilterUpdate,
              rawData: props.data,
              onColumnReorder: props.onColumnReorder,
              sortBy: props.sortBy,
              sortOrder: props.sortOrder,
              onSort: props.onSort,
              columns: props.columns,
              enableDrag: !!props.onGroupChange,
            }),
          ),
        ),
        React__default.createElement(
          semanticUiReact.Table.Body,
          null,
          React__default.createElement(QHGridBody, {
            startIndex: realStartIndex,
            rowLevelStyleCalc: props.rowLevelStyleCalc || stubFunction,
            rowLevelPropsCalc: props.rowLevelPropsCalc,
            additionalTemplateInfo: props.additionalTemplateInfo,
            onRowClick: props.onRowClick || stubFunction,
            itemKeyMap: itemKeyMap,
            grouping: groupingWithExtraStuff,
            visibleColumns: visibleColumns,
            slicedData: slicedData,
          }),
        ),
      ),
      !props.loading &&
        numRows === 0 &&
        React__default.createElement(
          'div',
          {
            className: 'QHGrid--empty',
          },
          lodashEs.isEmpty(emptyMessage)
            ? null
            : typeof emptyMessage === 'string'
            ? React__default.createElement(semanticUiReact.Message, {
                icon: 'search',
                content: emptyMessage,
              })
            : emptyMessage,
        ),
    ),
    React__default.createElement(
      semanticUiReact.Table,
      {
        striped: true,
        sortable: true,
        selectable: true,
        celled: true,
        compact: 'very',
        size: 'small',
        style: {
          marginTop: 0,
          paddingTop: 0,
          borderRadius: 0,
          borderTop: 0,
        },
      },
      React__default.createElement(
        semanticUiReact.Table.Footer,
        null,
        React__default.createElement(
          semanticUiReact.Table.Row,
          null,
          React__default.createElement(
            semanticUiReact.Table.HeaderCell,
            {
              colSpan: numColumns + grouping.length,
              style: {
                marginTop: 0,
                borderRadius: 0,
                borderTop: 0,
              },
            },
            React__default.createElement(semanticUiReact.Pagination, {
              size: 'mini',
              activePage: activePage,
              totalPages: numPages,
              onPageChange: handlePageChange,
              firstItem: {
                content: '«',
              },
              lastItem: {
                content: '»',
              },
              nextItem: {
                content: '⟩',
              },
              prevItem: {
                content: '⟨',
              },
            }),
            React__default.createElement(
              'span',
              null,
              React__default.createElement(semanticUiReact.Dropdown, {
                inline: true,
                options: paginationOpts,
                value: itemsPerPage,
                onChange: handleItemsPerPageChange,
                upward: true,
                style: {
                  marginLeft: '30px',
                },
              }),
              React__default.createElement('strong', null, 'Items Per Page'),
            ),
            React__default.createElement(
              'span',
              {
                style: {
                  float: 'right',
                  color: '#BBBBBB',
                  fontSize: 16,
                },
              },
              realStartIndex + 1,
              ' - ',
              realEndIndex,
              ' of ',
              numRows,
              ' Items',
              ' ',
              props.onReloadData &&
                React__default.createElement(semanticUiReact.Button, {
                  style: {
                    marginLeft: 10,
                  },
                  circular: true,
                  icon: 'undo',
                  size: 'mini',
                  color: 'blue',
                  onClick: props.onReloadData,
                }),
            ),
          ),
        ),
      ),
    ),
  );
}

// A type of promise-like that resolves synchronously and supports only one observer

const _iteratorSymbol =
  /*#__PURE__*/ typeof Symbol !== 'undefined'
    ? Symbol.iterator || (Symbol.iterator = Symbol('Symbol.iterator'))
    : '@@iterator';

const _asyncIteratorSymbol =
  /*#__PURE__*/ typeof Symbol !== 'undefined'
    ? Symbol.asyncIterator ||
      (Symbol.asyncIterator = Symbol('Symbol.asyncIterator'))
    : '@@asyncIterator';

// Asynchronously call a function and send errors to recovery continuation
function _catch(body, recover) {
  try {
    var result = body();
  } catch (e) {
    return recover(e);
  }
  if (result && result.then) {
    return result.then(void 0, recover);
  }
  return result;
}

/**
 * Returns a stateful value, and a function to update it. Mimics the `useState()` React Hook
 * signature.
 * https://github.com/microsoft/fluentui/blob/master/packages/fluentui/react-bindings/src/hooks/useAutoControlled.ts
 */

var useAutoControlled = function useAutoControlled(options) {
  var defaultValue = options.defaultValue,
    _options$initialValue = options.initialValue,
    initialValue =
      _options$initialValue === void 0 ? undefined : _options$initialValue,
    value = options.value;

  var _useState = React.useState(
      defaultValue === undefined ? initialValue : defaultValue,
    ),
    state = _useState[0],
    setState = _useState[1];

  return [value === undefined ? state : value, setState];
};

var colorOptions = [
  {
    key: 'No Colour',
    value: '',
    text: 'No Colour',
  },
  {
    key: 'red',
    value: 'red',
    text: 'Red',
  },
  {
    key: 'orange',
    value: 'orange',
    text: 'Orange',
  },
  {
    key: 'yellow',
    value: 'yellow',
    text: 'Yellow',
  },
  {
    key: 'olive',
    value: 'olive',
    text: 'Olive',
  },
  {
    key: 'green',
    value: 'green',
    text: 'Green',
  },
  {
    key: 'teal',
    value: 'teal',
    text: 'Teal',
  },
  {
    key: 'blue',
    value: 'blue',
    text: 'Blue',
  },
  {
    key: 'violet',
    value: 'violet',
    text: 'Violet',
  },
  {
    key: 'purple',
    value: 'purple',
    text: 'Purple',
  },
  {
    key: 'pink',
    value: 'pink',
    text: 'Pink',
  },
  {
    key: 'brown',
    value: 'brown',
    text: 'Brown',
  },
  {
    key: 'grey',
    value: 'grey',
    text: 'Grey',
  },
  {
    key: 'black',
    value: 'black',
    text: 'Black',
  },
  {
    key: 'AbbvieBlue',
    value: 'AbbvieBlue',
    text: 'AbbVie Blue',
  },
  {
    key: 'AbbviePurple',
    value: 'AbbviePurple',
    text: 'AbbVie Purple',
  },
  {
    key: 'AbbvieTeal',
    value: 'AbbvieTeal',
    text: 'AbbVie Teal',
  },
];
var icons = [
  'hourglass',
  'hourglass start',
  'hourglass half',
  'hourglass end',
  'checkmark',
  'user',
  'star outline',
  'users',
  'warning sign',
  'times circle outline',
  'flask',
  'cocktail',
  'beer',
  'coffee',
  'certificate',
  'birthday cake',
  'magic',
  'plus circle',
  'plus square outline',
  'question',
  'pied piper',
  'smile outline',
  'frown outline',
  'thumbs up outline',
  'thumbs down outline',
  'hand rock',
  'hand paper',
  'hand scissors',
  'hand lizard',
  'hand spock',
];
var iconOptions = /*#__PURE__*/ icons.map(function(icon) {
  return {
    key: icon,
    // icon,
    value: icon,
    text: icon,
    content: React__default.createElement(semanticUiReact.Header, {
      icon: icon,
      content: icon,
    }),
  };
});
iconOptions.unshift({
  key: 'No Icon',
  value: '',
  text: 'No Icon',
});

var QuickViewModal = /*#__PURE__*/ (function(_Component) {
  _inheritsLoose(QuickViewModal, _Component);

  function QuickViewModal() {
    var _this;

    _this = _Component.apply(this, arguments) || this;
    _this.state = {
      name: '',
      group: 'No Group',
      color: '',
      icon: '',
      update: false,
      groupOptions: [],
      groupError: false,
      nameError: false,
      quickViews: [],
      usedNames: {},
      values: null,
    }; // static defaultProps = {
    //   header: 'Create QuickView',
    // };

    _this.handleConfirmClick = function() {};

    _this.handleGroupAddition = function(_evt, _ref) {
      var value = _ref.value;

      if (typeof value !== 'string') {
        return;
      }

      _this.setState(function(prev) {
        return {
          groupOptions: [
            {
              text: value,
              value: value,
              key: value,
              icon: 'add',
            },
          ].concat(prev.groupOptions),
        };
      });
    };

    _this.handleGroupChange = function(_evt, _ref2) {
      var value = _ref2.value;

      if (typeof value !== 'string') {
        return;
      }

      _this.setState({
        group: value,
        groupError: false,
      });
    };

    _this.handleColorChange = function(_evt, _ref3) {
      var value = _ref3.value;

      if (typeof value !== 'string') {
        return;
      }

      _this.setState({
        color: value,
      });
    };

    _this.handleIconChange = function(_evt, _ref4) {
      var value = _ref4.value;

      if (typeof value !== 'string') {
        return;
      }

      _this.setState({
        icon: value,
      });
    };

    _this.handleNameChange = function(_evt, _ref5) {
      var value = _ref5.value;
      var nameError =
        !!_this.state.usedNames[value.toLowerCase()] &&
        (!_this.props.values ||
          _this.props.values.name.toLowerCase() !== value.toLowerCase());

      _this.setState({
        name: value,
        nameError: nameError,
      });
    };

    _this.handleUpdateChange = function(_evt, _ref6) {
      var checked = _ref6.checked;

      if (typeof checked !== 'boolean') {
        return;
      }

      _this.setState({
        update: checked,
      });
    };

    _this.handleSubmit = function(evt) {
      evt.preventDefault();
      var _this$state = _this.state,
        group = _this$state.group,
        name = _this$state.name,
        icon = _this$state.icon,
        color = _this$state.color,
        update = _this$state.update;

      if (
        _this.state.usedNames[name] &&
        (!_this.props.values || _this.props.values.name !== name)
      ) {
        // this.setState({nameError:true});
        return;
      }

      if (group === 'No Group') {
        group = undefined;
      }

      if (icon === '') {
        icon = undefined;
      }

      if (color === '') {
        color = undefined;
      }

      if (_this.props.values) {
        var _this$props$onEditQui, _this$props;

        (_this$props$onEditQui = (_this$props = _this.props)
          .onEditQuickView) === null || _this$props$onEditQui === void 0
          ? void 0
          : _this$props$onEditQui.call(
              _this$props,
              _this.props.values.name,
              name,
              group,
              icon,
              color,
              update,
            );
      } else {
        var _this$props$onCreateQ, _this$props2;

        (_this$props$onCreateQ = (_this$props2 = _this.props)
          .onCreateQuickView) === null || _this$props$onCreateQ === void 0
          ? void 0
          : _this$props$onCreateQ.call(_this$props2, name, group, icon, color);
      }

      _this.setState({
        name: '',
        nameError: false,
        group: 'No Group',
        icon: '',
        color: '',
        update: false,
      });

      _this.props.onClose();
    };

    return _this;
  }

  QuickViewModal.getDerivedStateFromProps = function getDerivedStateFromProps(
    nextProps,
    prevState,
  ) {
    if (!nextProps.open) return null;
    var state = {};

    if (nextProps.quickViews !== prevState.quickViews && nextProps.quickViews) {
      state.quickViews = nextProps.quickViews;
      state.usedNames = nextProps.quickViews.reduce(function(opts, qv) {
        opts[qv.name.toLowerCase()] = true;
        return opts;
      }, {});
      state.groupOptions = [
        {
          text: 'No Group',
          value: 'No Group',
          key: 'No Group',
        },
      ].concat(
        Object.keys(
          nextProps.quickViews.reduce(function(opts, qv) {
            if (qv.group) {
              opts[qv.group] = true;
            }

            return opts;
          }, {}),
        ).map(function(key) {
          return {
            key: key,
            text: key,
            value: key,
          };
        }),
      );
    } else if (!nextProps.quickViews) {
      state.groupOptions = [
        {
          text: 'No Group',
          value: 'No Group',
          key: 'No Group',
        },
      ];
      state.usedNames = {};
    }

    if (nextProps.values && nextProps.values !== prevState.values) {
      state.values = nextProps.values;
      var _nextProps$values = nextProps.values,
        name = _nextProps$values.name,
        _nextProps$values$gro = _nextProps$values.group,
        group =
          _nextProps$values$gro === void 0 ? 'No Group' : _nextProps$values$gro,
        _nextProps$values$ico = _nextProps$values.icon,
        icon = _nextProps$values$ico === void 0 ? '' : _nextProps$values$ico,
        _nextProps$values$col = _nextProps$values.color,
        color = _nextProps$values$col === void 0 ? '' : _nextProps$values$col;
      state.name = name;
      state.group = group;
      state.icon = icon;
      state.color = color;
      state.nameError = false;
    } else if (!nextProps.values && prevState.values) {
      state.values = null;
      state.name = '';
      state.group = 'No Group';
      state.icon = '';
      state.color = '';
      state.nameError = false;
    }

    return state;
  };

  var _proto = QuickViewModal.prototype;

  _proto.render = function render() {
    if (!this.props.open) {
      return null;
    }

    return React__default.createElement(
      semanticUiReact.Modal,
      {
        open: this.props.open,
        onClose: this.props.onClose,
        as: semanticUiReact.Form,
        onSubmit: this.handleSubmit,
      },
      React__default.createElement(
        semanticUiReact.Modal.Header,
        null,
        this.props.header ||
          (this.props.values
            ? 'Edit QuickView: ' + this.props.values.name
            : 'Create QuickView'),
      ),
      React__default.createElement(
        semanticUiReact.Modal.Content,
        null,
        React__default.createElement(
          semanticUiReact.Form.Group,
          {
            widths: 'equal',
          },
          React__default.createElement(semanticUiReact.Form.Input, {
            label: React__default.createElement(
              'label',
              null,
              'Name',
              this.state.nameError &&
                React__default.createElement(semanticUiReact.Popup, {
                  trigger: React__default.createElement(semanticUiReact.Icon, {
                    name: 'info circle',
                    style: {
                      cursor: 'pointer',
                    },
                  }),
                  inverted: true,
                  content:
                    'Please choose another name. "' +
                    this.state.name +
                    '" is taken',
                }),
            ),
            // label="Name"
            placeholder: 'Enter QuickView Name',
            value: this.state.name,
            onChange: this.handleNameChange,
            error: this.state.nameError,
            required: true,
          }),
          React__default.createElement(semanticUiReact.Form.Dropdown, {
            allowAdditions: true,
            onChange: this.handleGroupChange,
            onAddItem: this.handleGroupAddition,
            options: this.state.groupOptions,
            value: this.state.group,
            selection: true,
            search: true,
            label: React__default.createElement(
              'label',
              null,
              'Group',
              React__default.createElement(semanticUiReact.Popup, {
                trigger: React__default.createElement(semanticUiReact.Icon, {
                  name: 'question circle',
                  style: {
                    cursor: 'pointer',
                  },
                }),
                inverted: true,
                content:
                  'Used to separate quick views into groups. Type a name to add a new group.',
              }),
            ),
            placeholder: 'Select or add a group name',
          }),
        ),
        React__default.createElement(
          semanticUiReact.Form.Group,
          {
            widths: 'equal',
          },
          React__default.createElement(semanticUiReact.Form.Select, {
            label: React__default.createElement(
              'label',
              null,
              'Color',
              React__default.createElement(semanticUiReact.Popup, {
                trigger: React__default.createElement(semanticUiReact.Icon, {
                  name: 'question circle',
                  style: {
                    cursor: 'pointer',
                  },
                }),
                inverted: true,
                content: 'Adds color to the Quick View Card in the Home Page',
              }),
            ),
            options: colorOptions,
            placeholder: 'Choose a color',
            value: this.state.color,
            onChange: this.handleColorChange,
          }),
          React__default.createElement(semanticUiReact.Form.Dropdown, {
            label: React__default.createElement(
              'label',
              null,
              'Icon',
              React__default.createElement(semanticUiReact.Popup, {
                trigger: React__default.createElement(semanticUiReact.Icon, {
                  name: 'question circle',
                  style: {
                    cursor: 'pointer',
                  },
                }),
                inverted: true,
                content: 'Adds an Icon to the Quick View Card in the Home Page',
              }),
            ),
            selection: true,
            options: iconOptions,
            placeholder: 'Choose an Icon',
            value: this.state.icon,
            onChange: this.handleIconChange,
          }),
        ),
        this.props.values &&
          React__default.createElement(semanticUiReact.Form.Checkbox, {
            label: 'Update View Settings to the Current Settings',
            inline: true,
            checked: this.state.update,
            onChange: this.handleUpdateChange,
          }),
      ),
      React__default.createElement(semanticUiReact.Modal.Actions, {
        actions: [
          {
            content: 'Cancel',
            key: 'cancel',
            negative: true,
            onClick: this.props.onClose,
            type: 'button',
          },
          {
            key: 'confirm',
            content: 'Confirm',
            positive: true,
            type: 'submit',
          },
        ],
      }),
    );
  };

  return QuickViewModal;
})(React.Component);

var stubObj = {};
var sortOrderToRightType = {
  ascending: 'asc',
  descending: 'desc',
  asc: 'asc',
  desc: 'desc',
};
function QuickViews(props) {
  var _useState = React.useState(false),
    open = _useState[0],
    setOpen = _useState[1];

  var _useState2 = React.useState(false),
    modalOpen = _useState2[0],
    setModalOpen = _useState2[1];

  var _useState3 = React.useState(undefined),
    editView = _useState3[0],
    setEditView = _useState3[1];

  var getViewRef = React.useRef(props.getView);
  getViewRef.current = props.getView;

  var _useState4 = React.useState(stubObj),
    customConfig = _useState4[0],
    setCustomConfig = _useState4[1];

  var customConfigRef = React.useRef(stubObj);
  var disableChanges = props.disableChanges || !props.id;
  React.useEffect(
    function() {
      if (disableChanges || customConfig === customConfigRef.current) {
        return;
      } // Save the quick views!

      (function() {
        try {
          var _temp3 = (function() {
            if (props.url) {
              var params = {
                quickViewsId: props.id,
                ownerId: props.ownerId,
                quickViews: JSON.stringify(customConfig),
              };

              var _temp4 = _catch(
                function() {
                  return Promise.resolve(
                    Axios.put(props.url, params),
                  ).then(function() {});
                },
                function(error) {
                  alert('Failed to save quickviews to the service');
                  console.error(error);
                },
              );

              if (_temp4 && _temp4.then) return _temp4.then(function() {});
            } else {
              var storageKey =
                process.env.REACT_APP_NAME + '.' + props.id + '.quickViews';
              localStorage.setItem(storageKey, JSON.stringify(customConfig));
            }
          })();

          return _temp3 && _temp3.then ? _temp3.then(function() {}) : void 0;
        } catch (e) {
          Promise.reject(e);
        }
      })();
    },
    [customConfig, props.ownerId, props.id, props.url, disableChanges],
  );
  var config = React.useMemo(
    function() {
      if (!props.config) {
        return customConfig;
      } else if (lodashEs.isEmpty(customConfig)) {
        return props.config || customConfig;
      } else {
        return _extends({}, props.config, customConfig);
      }
    },
    [customConfig, props.config],
  );
  var quickViews = React.useMemo(
    function() {
      return Object.entries(config).map(function(_ref) {
        var name = _ref[0],
          qv = _ref[1];
        return _extends(
          {
            name: name,
          },
          qv,
        );
      });
    },
    [config],
  );

  var _useAutoControlled = useAutoControlled({
      defaultValue: props.defaultValue,
      value: props.value,
      initialValue: '',
    }),
    value = _useAutoControlled[0],
    setValue = _useAutoControlled[1];

  var view = React.useMemo(
    function() {
      return quickViews.find(function(qv) {
        return qv.name === value;
      });
    },
    [value, quickViews],
  );
  React.useEffect(
    function() {
      var onViewChange = props.onViewChange;

      if (view) {
        onViewChange(view);
      }
    },
    [view, props.onViewChange],
  );
  React.useEffect(
    function() {
      var cancelToken;

      (function() {
        try {
          var _temp9 = function _temp9() {
            Object.values(remoteQuickViews).forEach(function(qv) {
              var _qv$view$columns;

              qv.view.grouping = qv.view.grouping.map(function(group) {
                var _group$colId;

                return {
                  colId:
                    (_group$colId = group.colId) !== null &&
                    _group$colId !== void 0
                      ? _group$colId
                      : group.col_id,
                  sortOrder: group.sortOrder,
                };
              });
              qv.view.columns =
                (_qv$view$columns = qv.view.columns) === null ||
                _qv$view$columns === void 0
                  ? void 0
                  : _qv$view$columns.map(function(col) {
                      var _col$id;

                      return {
                        id:
                          (_col$id = col.id) !== null && _col$id !== void 0
                            ? _col$id
                            : col.ID,
                        hidden: col.hidden,
                      };
                    });
              qv.view.sortOrder =
                qv.view.sortOrder && sortOrderToRightType[qv.view.sortOrder];
            });
            customConfigRef.current = remoteQuickViews;
            setCustomConfig(remoteQuickViews);
          };

          var remoteQuickViews = {};

          var _temp10 = (function() {
            if (props.id) {
              var _temp11 = (function() {
                if (props.url && props.ownerId) {
                  var params = {
                    quickViewsId: props.id,
                    ownerId: props.ownerId,
                    appName: process.env.REACT_APP_NAME,
                  };

                  var _temp12 = _catch(
                    function() {
                      return Promise.resolve(
                        Axios.get(props.url, {
                          params: params,
                          cancelToken: new Axios.CancelToken(function(c) {
                            return (cancelToken = c);
                          }),
                        }),
                      ).then(function(_Axios$get) {
                        remoteQuickViews = _Axios$get.data;
                      });
                    },
                    function(error) {
                      if (!Axios.isCancel(error)) {
                        console.error(error);
                        alert('Failed to get quickviews from the service');
                      }
                    },
                  );

                  if (_temp12 && _temp12.then)
                    return _temp12.then(function() {});
                } else {
                  var storageKey =
                    process.env.REACT_APP_NAME + '.' + props.id + '.quickViews';
                  remoteQuickViews = JSON.parse(
                    localStorage.getItem(storageKey) || '{}',
                  );
                }
              })();

              if (_temp11 && _temp11.then) return _temp11.then(function() {});
            }
          })();

          return _temp10 && _temp10.then
            ? _temp10.then(_temp9)
            : _temp9(_temp10);
        } catch (e) {
          Promise.reject(e);
        }
      })();

      return cancelToken;
    },
    [props.ownerId, props.id, props.url],
  );

  var handleChange = function handleChange(_ev, data) {
    setOpen(false);
    var qv = data['data-qv'];

    if (qv.name === value) {
      props.onViewChange(qv);
    } else {
      var _props$onChange;

      (_props$onChange = props.onChange) === null || _props$onChange === void 0
        ? void 0
        : _props$onChange.call(props, qv.name, qv);
      setValue(qv.name);
    }
  };

  var handleCreate = function handleCreate() {
    setOpen(false);
    setEditView(undefined);
    setModalOpen(true);
  };

  var handleRemove = function handleRemove(ev, data) {
    ev.stopPropagation();
    setOpen(false);
    var name = data.name;
    setCustomConfig(function(prev) {
      var config = _objectWithoutPropertiesLoose(
        prev,
        [name].map(_toPropertyKey),
      );

      return config;
    });
  };

  var handleEdit = function handleEdit(ev, data) {
    ev.stopPropagation();
    setOpen(false);
    setEditView(data['data-qv']);
    setModalOpen(true);
  };

  var handleShare = function handleShare(ev, data) {
    var _props$onShare;

    ev.stopPropagation();
    setOpen(false);
    (_props$onShare = props.onShare) === null || _props$onShare === void 0
      ? void 0
      : _props$onShare.call(props, data.name, data['data-qv']);
  };

  var handleCreateQuickView = function handleCreateQuickView(
    name,
    group,
    icon,
    color,
  ) {
    var _getViewRef$current;

    var view =
      (_getViewRef$current = getViewRef.current) === null ||
      _getViewRef$current === void 0
        ? void 0
        : _getViewRef$current.call(getViewRef);

    if (!view) {
      return;
    }

    var props = {
      custom: true,
      group: group,
      icon: icon,
      color: color,
      view: view,
    };
    setCustomConfig(function(prev) {
      var _extends2;

      return _extends(
        {},
        prev,
        ((_extends2 = {}), (_extends2[name] = props), _extends2),
      );
    });
  };

  var handleEditQuickView = function handleEditQuickView(
    name,
    newName,
    group,
    icon,
    color,
    updateData,
  ) {
    var view =
      editView === null || editView === void 0 ? void 0 : editView.view;

    if (updateData) {
      var _getViewRef$current2;

      view =
        (_getViewRef$current2 = getViewRef.current) === null ||
        _getViewRef$current2 === void 0
          ? void 0
          : _getViewRef$current2.call(getViewRef);
    }

    if (!view) {
      return;
    }

    var props = {
      custom: true,
      group: group,
      icon: icon,
      color: color,
      view: view,
    };
    setCustomConfig(function(prev) {
      var _extends3;

      var values = _objectWithoutPropertiesLoose(
        prev,
        [name].map(_toPropertyKey),
      );

      return _extends(
        {},
        values,
        ((_extends3 = {}), (_extends3[newName] = props), _extends3),
      );
    });
  };

  var quickViewGroups = React.useMemo(
    function() {
      return lodashEs.groupBy(quickViews, 'group');
    },
    [quickViews],
  );
  var quickViewMenu = Object.entries(quickViewGroups).map(function(_ref2) {
    var groupName = _ref2[0],
      qvGroup = _ref2[1];
    var items = qvGroup.map(function(qv) {
      return React__default.createElement(
        semanticUiReact.Menu.Item,
        {
          key: qv.name,
          view: qv.view,
          name: qv.name,
          'data-custom': qv.custom,
          'data-qv': qv,
          onClick: handleChange,
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          },
        },
        qv.icon &&
          React__default.createElement(semanticUiReact.Icon, {
            className: 'quickViewIcon ' + qv.color,
            name: qv.icon,
          }),
        qv.name,
        React__default.createElement(
          'div',
          null,
          qv.custom &&
            props.onShare &&
            React__default.createElement(semanticUiReact.Button, {
              title: 'Share View',
              icon: React__default.createElement(semanticUiReact.Icon, {
                name: 'share square',
                color: 'black',
              }),
              compact: true,
              size: 'mini',
              name: qv.name,
              'data-qv': qv,
              onClick: handleShare,
              className: 'QHGrid--ButtonClear',
            }),
          qv.custom &&
            !props.disableChanges &&
            React__default.createElement(semanticUiReact.Button, {
              title: 'Edit View',
              icon: React__default.createElement(semanticUiReact.Icon, {
                name: 'pencil',
                color: 'black',
              }),
              compact: true,
              size: 'mini',
              name: qv.name,
              'data-qv': qv,
              onClick: handleEdit,
              className: 'QHGrid--ButtonClear',
            }),
          qv.custom &&
            !props.disableChanges &&
            React__default.createElement(semanticUiReact.Button, {
              title: 'Delete View',
              icon: React__default.createElement(semanticUiReact.Icon, {
                name: 'remove',
                color: 'red',
              }),
              color: 'red',
              compact: true,
              size: 'mini',
              name: qv.name,
              onClick: handleRemove,
              className: 'QHGrid--ButtonClear',
            }),
        ),
      );
    });

    if (groupName !== 'undefined') {
      return React__default.createElement(
        semanticUiReact.Dropdown,
        {
          key: groupName,
          item: true,
          text: groupName,
        },
        React__default.createElement(
          semanticUiReact.Dropdown.Menu,
          null,
          items,
        ),
      );
    } else {
      return items;
    }
  });

  if (props.disableMenu || (!quickViews.length && disableChanges)) {
    return null;
  }

  return React__default.createElement(
    React__default.Fragment,
    null,
    React__default.createElement(QuickViewModal, {
      open: modalOpen,
      onClose: function onClose() {
        return setModalOpen(function(prev) {
          return !prev;
        });
      },
      quickViews: quickViews,
      onCreateQuickView: handleCreateQuickView,
      onEditQuickView: handleEditQuickView,
      values: editView,
    }),
    React__default.createElement(
      semanticUiReact.Popup,
      {
        trigger: React__default.createElement(
          semanticUiReact.Button,
          {
            inverted: true,
          },
          React__default.createElement(semanticUiReact.Icon, {
            name: 'lightning',
          }),
          'Quick Views',
        ),
        position: 'bottom center',
        on: 'click',
        open: open,
        onOpen: function onOpen() {
          return setOpen(true);
        },
        onClose: function onClose() {
          return setOpen(false);
        },
        name: 'quick',
        flowing: true,
        basic: true,
      },
      React__default.createElement(
        semanticUiReact.Menu,
        {
          vertical: true,
          fluid: true,
        },
        !disableChanges &&
          React__default.createElement(
            semanticUiReact.Menu.Item,
            {
              onClick: handleCreate,
            },
            React__default.createElement(semanticUiReact.Icon, {
              name: 'add',
              color: 'green',
            }),
            'Add Quick View',
          ),
        quickViewMenu,
      ),
    ),
  );
}

var cache$1 = {};

var EZGrid = /*#__PURE__*/ (function(_Component) {
  _inheritsLoose(EZGrid, _Component);

  function EZGrid() {
    var _this;

    _this = _Component.apply(this, arguments) || this;
    _this.state = {
      generalSearch: '',
      filters: {},
      columns: [],
      sortBy: null,
      sortOrder: null,
      grouping: [],
      itemsPerPage: 15,
      activePage: 1,
      columnsConfig: mapColumnsConfig(_this.props.columnsConfig) || [],
    };
    _this.qhGridRef = React__default.createRef();

    _this.componentDidMount = function() {
      if (
        _this.props.uniqueCacheKey &&
        !(_this.props.quickView || _this.props.defaultQuickView) &&
        cache$1[_this.props.uniqueCacheKey]
      ) {
        _this.setState(cache$1[_this.props.uniqueCacheKey]);
      } else {
        _this.setState({
          columns: _this.state.columnsConfig,
          itemsPerPage: _this.props.itemsPerPage || _this.state.itemsPerPage,
        });
      }
    };

    _this.componentDidUpdate = function(prevProps, prevState) {
      /* eslint-disable react/no-did-update-set-state */
      if (_this.props.columnsConfig !== prevProps.columnsConfig) {
        var columnsConfig = mapColumnsConfig(_this.props.columnsConfig);

        _this.setState({
          columns: columnsConfig,
          columnsConfig: columnsConfig,
        });
      }

      if (
        _this.props.itemsPerPage !== prevProps.itemsPerPage &&
        _this.props.itemsPerPage !== undefined
      ) {
        _this.setState({
          itemsPerPage: _this.props.itemsPerPage,
          activePage: 1,
        });
      }

      if (_this.props.uniqueCacheKey && _this.state !== prevState) {
        cache$1[_this.props.uniqueCacheKey] = _this.state;
      }
    };

    _this.setFilters = function(newFilters) {
      _this.setState({
        filters: newFilters,
      });
    }; // TODO test the setSort function!

    _this.setSort = function(sortBy, sortOrder) {
      _this.setState({
        sortBy: sortBy,
        sortOrder: sortOrder,
        activePage: 1,
      });
    };

    _this.handleGeneralSearch = function(generalSearch) {
      _this.setState({
        generalSearch: generalSearch,
        activePage: 1,
      });
    };

    _this.handleGroupChange = function(grouping) {
      _this.setState({
        grouping: grouping,
        activePage: 1,
      });
    };

    _this.handleSort = function(field) {
      var sortBy = field;
      var sortOrder = 'asc';

      _this.setState(function(prev) {
        if (prev.sortBy === field) {
          if (prev.sortOrder === 'asc') {
            sortOrder = 'desc';
          } else if (prev.sortOrder === 'desc') {
            sortBy = null;
            sortOrder = null;
          }
        }

        return {
          sortBy: sortBy,
          sortOrder: sortOrder,
          activePage: 1,
        };
      });
    };

    _this.handleColumnVisibilityToggle = function(colId) {
      _this.setState(function(prev) {
        return {
          columns: prev.columns.map(function(col) {
            if (col.id === colId)
              col = _extends({}, col, {
                hidden: !col.hidden,
              });
            return col;
          }),
        };
      });
    };

    _this.handleColumnReorder = function(curIdx, newIdx) {
      _this.setState(function(prev) {
        var columns = prev.columns.slice();
        columns.splice(newIdx, 0, columns.splice(curIdx, 1)[0]);
        return {
          columns: columns,
        };
      });
    };

    _this.handleFilterUpdate = function(field, type) {
      return function(value) {
        if (value === undefined) {
          _this.setState(function(prev) {
            return {
              filters: update(prev.filters, {
                $unset: [field],
              }),
              activePage: 1,
            };
          });
        } else {
          _this.setState(function(prev) {
            var _extends2;

            return {
              filters: _extends(
                {},
                prev.filters,
                ((_extends2 = {}),
                (_extends2[field] = {
                  value: value,
                  type: type,
                }),
                _extends2),
              ),
              activePage: 1,
            };
          });
        }
      };
    };

    _this.handleItemsPerPageChange = function(itemsPerPage) {
      var _this$props$onItemsPe, _this$props;

      (_this$props$onItemsPe = (_this$props = _this.props)
        .onItemsPerPageChange) === null || _this$props$onItemsPe === void 0
        ? void 0
        : _this$props$onItemsPe.call(_this$props, itemsPerPage);

      _this.setState({
        itemsPerPage: itemsPerPage,
        activePage: 1,
      });
    };

    _this.handlePageChange = function(activePage) {
      _this.setState({
        activePage: activePage,
      });
    };

    _this.getView = function() {
      var _this$state = _this.state,
        grouping = _this$state.grouping,
        sortBy = _this$state.sortBy,
        sortOrder = _this$state.sortOrder,
        generalSearch = _this$state.generalSearch,
        activePage = _this$state.activePage,
        itemsPerPage = _this$state.itemsPerPage,
        filters = _this$state.filters,
        columnsConfig = _this$state.columns;
      var columns = columnsConfig.map(function(col) {
        return {
          id: col.id,
          hidden: col.hidden,
        };
      });
      return {
        grouping: grouping,
        sortBy: sortBy,
        sortOrder: sortOrder,
        generalSearch: generalSearch,
        activePage: activePage,
        itemsPerPage: itemsPerPage,
        filters: filters,
        columns: columns,
      };
    };

    _this.handleQuickViewChange = function(quickView) {
      var viewColumns = quickView.view.columns;
      var columnsConfig = _this.state.columnsConfig;

      if (
        !(viewColumns === null || viewColumns === void 0
          ? void 0
          : viewColumns.length)
      ) {
        return _this.setState(
          _extends({}, quickView.view, {
            columns: columnsConfig,
          }),
        );
      }

      var colMap = lodashEs.keyBy(columnsConfig, 'id');
      var viewColumnMap = lodashEs.groupBy(viewColumns, 'id');
      var newColumns = columnsConfig.filter(function(col) {
        return !viewColumnMap[col.id];
      });
      var columns = viewColumns
        .reduce(function(result, col) {
          var validCol = colMap[col.id];

          if (validCol) {
            result.push(
              _extends({}, validCol, {
                hidden: col.hidden,
              }),
            );
          }

          return result;
        }, [])
        .concat(newColumns);

      _this.setState(
        _extends({}, quickView.view, {
          columns: columns,
        }),
      );
    };

    return _this;
  }

  var _proto = EZGrid.prototype;

  _proto.render = function render() {
    var _this$state2 = this.state,
      generalSearch = _this$state2.generalSearch,
      filters = _this$state2.filters,
      columns = _this$state2.columns,
      columnsConfig = _this$state2.columnsConfig,
      sortBy = _this$state2.sortBy,
      sortOrder = _this$state2.sortOrder,
      grouping = _this$state2.grouping,
      itemsPerPage = _this$state2.itemsPerPage,
      activePage = _this$state2.activePage;
    var _this$props2 = this.props,
      data = _this$props2.data,
      exportBaseName = _this$props2.exportBaseName,
      loading = _this$props2.loading,
      loadingMessage = _this$props2.loadingMessage,
      additionalTemplateInfo = _this$props2.additionalTemplateInfo,
      rowLevelStyleCalc = _this$props2.rowLevelStyleCalc,
      rowLevelPropsCalc = _this$props2.rowLevelPropsCalc,
      onRowClick = _this$props2.onRowClick,
      reloadData = _this$props2.fetchData,
      emptyMessage = _this$props2.emptyMessage,
      height = _this$props2.height,
      generalSearchDebounceTime = _this$props2.generalSearchDebounceTime;
    var extraHeaderItem = React__default.createElement(
      React__default.Fragment,
      null,
      React__default.createElement(QuickViews, {
        id: this.props.quickViewsId,
        config: this.props.quickViews,
        defaultValue: this.props.defaultQuickView,
        disableChanges: this.props.disableQuickViewEditing,
        onChange: this.props.onQuickViewChange,
        onShare: this.props.onQuickViewShare,
        ownerId: this.props.ownerId,
        url: this.props.quickViewsURL,
        value: this.props.quickView,
        onViewChange: this.handleQuickViewChange,
        getView: this.getView,
        disableMenu: this.props.disableQuickViewMenu,
      }),
      this.props.legend &&
        React__default.createElement(semanticUiReact.Popup, {
          flowing: true,
          trigger: React__default.createElement(semanticUiReact.Button, {
            icon: 'info circle',
            content: 'Legend',
            inverted: true,
          }),
          children: this.props.legend,
        }),
      this.props.extraHeaderItem,
    );
    var props = {
      generalSearch: generalSearch,
      filters: filters,
      columns: columns,
      sortBy: sortBy,
      sortOrder: sortOrder,
      grouping: grouping,
      data: data,
      exportBaseName: exportBaseName,
      loading: loading,
      loadingMessage: loadingMessage,
      additionalTemplateInfo: additionalTemplateInfo,
      rowLevelStyleCalc: rowLevelStyleCalc,
      rowLevelPropsCalc: rowLevelPropsCalc,
      onRowClick: onRowClick,
      onReloadData: reloadData,
      emptyMessage: emptyMessage,
      extraHeaderItem: extraHeaderItem,
      columnsConfig: columnsConfig,
      itemsPerPage: itemsPerPage,
      onItemsPerPageChange: this.handleItemsPerPageChange,
      height: height,
      generalSearchDebounceTime: generalSearchDebounceTime,
      activePage: activePage,
      onPageChange: this.handlePageChange,
    };
    if (!this.props.disableGeneralSearch)
      props.onGeneralSearch = this.handleGeneralSearch;

    if (!this.props.disableGrouping) {
      props.onGroupChange = this.handleGroupChange;
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

    return React__default.createElement(
      QHGrid,
      Object.assign({}, props, {
        qhGridRef: this.qhGridRef,
      }),
    );
  };

  return EZGrid;
})(React.Component);
EZGrid.defaultProps = {
  showError: function showError() {},
  itemsPerPage: 15,
};

function mapColumnsConfig(columns) {
  if (columns === void 0) {
    columns = [];
  }

  return columns.map(function(column) {
    var id = column.id || '' + getField(column.field);
    return _extends({}, column, {
      id: id,
      hidden: !!column.hidden,
    });
  });
}

var cache$2 = {};

var EZNetworkGrid = /*#__PURE__*/ (function(_PureComponent) {
  _inheritsLoose(EZNetworkGrid, _PureComponent);

  function EZNetworkGrid() {
    var _this;

    _this = _PureComponent.apply(this, arguments) || this;
    _this.state = {
      generalSearch: '',
      filters: {},
      columns: [],
      sortBy: null,
      sortOrder: null,
      grouping: [],
      itemsPerPage: 15,
      activePage: 1,
      columnsConfig: mapColumnsConfig$1(_this.props.columnsConfig) || [],
    };
    _this.qhGridRef = React__default.createRef();

    _this.componentDidMount = function() {
      if (
        _this.props.uniqueCacheKey &&
        !(_this.props.quickView || _this.props.defaultQuickView) &&
        cache$2[_this.props.uniqueCacheKey]
      ) {
        _this.setState(cache$2[_this.props.uniqueCacheKey]);
      } else {
        // const columnsConfig = mapColumnsConfig(this.props.columnsConfig);
        _this.setState({
          columns: _this.state.columnsConfig,
          itemsPerPage: _this.props.itemsPerPage || _this.state.itemsPerPage,
        });

        _this.fetchData();
      }
    };

    _this.componentDidUpdate = function(prevProps, prevState) {
      /* eslint-disable react/no-did-update-set-state */
      if (_this.props.columnsConfig !== prevProps.columnsConfig) {
        var columnsConfig = mapColumnsConfig$1(_this.props.columnsConfig);

        _this.setState({
          columns: columnsConfig,
          columnsConfig: columnsConfig,
        });
      }

      if (
        _this.props.itemsPerPage !== prevProps.itemsPerPage &&
        _this.props.itemsPerPage !== undefined
      ) {
        _this.setState({
          itemsPerPage: _this.props.itemsPerPage,
          activePage: 1,
        });
      }

      if (
        _this.state.columnsConfig !== prevState.columnsConfig ||
        _this.state.itemsPerPage !== prevState.itemsPerPage ||
        _this.state.generalSearch !== prevState.generalSearch ||
        _this.state.grouping !== prevState.grouping ||
        _this.state.sortBy !== prevState.sortBy ||
        _this.state.sortOrder !== prevState.sortOrder ||
        _this.state.filters !== prevState.filters ||
        _this.state.activePage !== prevState.activePage
      ) {
        _this.fetchData();
      }

      if (_this.props.uniqueCacheKey && _this.state !== prevState) {
        cache$2[_this.props.uniqueCacheKey] = _this.state;
      }
    };

    _this.setFilters = function(newFilters) {
      _this.setState({
        filters: newFilters,
        activePage: 1,
      });
    }; // TODO test the setSort function!

    _this.setSort = function(sortBy, sortOrder) {
      _this.setState({
        sortBy: sortBy,
        sortOrder: sortOrder,
        activePage: 1,
      });
    };

    _this.handleGeneralSearch = function(generalSearch) {
      _this.setState({
        generalSearch: generalSearch,
        activePage: 1,
      });
    };

    _this.handleGroupChange = function(grouping) {
      _this.setState({
        grouping: grouping,
        activePage: 1,
      });
    };

    _this.handleSort = function(field) {
      var sortBy = field;
      var sortOrder = 'asc';

      _this.setState(function(prev) {
        if (prev.sortBy === field) {
          if (prev.sortOrder === 'asc') {
            sortOrder = 'desc';
          } else if (prev.sortOrder === 'desc') {
            sortBy = null;
            sortOrder = null;
          }
        }

        return {
          sortBy: sortBy,
          sortOrder: sortOrder,
          activePage: 1,
        };
      });
    };

    _this.handleColumnVisibilityToggle = function(colId) {
      _this.setState(function(prev) {
        return {
          columns: prev.columns.map(function(col) {
            if (col.id === colId)
              col = _extends({}, col, {
                hidden: !col.hidden,
              });
            return col;
          }),
        };
      });
    };

    _this.handleColumnReorder = function(curIdx, newIdx) {
      _this.setState(function(prev) {
        var columns = prev.columns.slice();
        columns.splice(newIdx, 0, columns.splice(curIdx, 1)[0]);
        return {
          columns: columns,
        };
      });
    };

    _this.handleFilterUpdate = function(field, type) {
      return function(value) {
        if (value === undefined) {
          _this.setState(function(prev) {
            return {
              filters: update(prev.filters, {
                $unset: [field],
              }),
              activePage: 1,
            };
          });
        } else {
          _this.setState(function(prev) {
            var _extends2;

            return {
              filters: _extends(
                {},
                prev.filters,
                ((_extends2 = {}),
                (_extends2[field] = {
                  value: value,
                  type: type,
                }),
                _extends2),
              ),
              activePage: 1,
            };
          });
        }
      };
    };

    _this.getView = function() {
      var _this$state = _this.state,
        grouping = _this$state.grouping,
        sortBy = _this$state.sortBy,
        sortOrder = _this$state.sortOrder,
        generalSearch = _this$state.generalSearch,
        activePage = _this$state.activePage,
        itemsPerPage = _this$state.itemsPerPage,
        filters = _this$state.filters,
        columnsConfig = _this$state.columns;
      var columns = columnsConfig.map(function(col) {
        return {
          id: col.id,
          hidden: col.hidden,
        };
      });
      return {
        grouping: grouping,
        sortBy: sortBy,
        sortOrder: sortOrder,
        generalSearch: generalSearch,
        activePage: activePage,
        itemsPerPage: itemsPerPage,
        filters: filters,
        columns: columns,
      };
    };

    _this.handleQuickViewChange = function(quickView) {
      var viewColumns = quickView.view.columns;
      var columnsConfig = _this.state.columnsConfig;

      if (
        !(viewColumns === null || viewColumns === void 0
          ? void 0
          : viewColumns.length)
      ) {
        return _this.setState(
          _extends({}, quickView.view, {
            columns: columnsConfig,
          }),
        );
      }

      var colMap = lodashEs.keyBy(columnsConfig, 'id');
      var viewColumnMap = lodashEs.groupBy(viewColumns, 'id');
      var newColumns = columnsConfig.filter(function(col) {
        return !viewColumnMap[col.id];
      });
      var columns = viewColumns
        .reduce(function(result, col) {
          var validCol = colMap[col.id];

          if (validCol) {
            result.push(
              _extends({}, validCol, {
                hidden: col.hidden,
              }),
            );
          }

          return result;
        }, [])
        .concat(newColumns);

      _this.setState(
        _extends({}, quickView.view, {
          columns: columns,
        }),
      );
    };

    _this.handleItemsPerPageChange = function(itemsPerPage) {
      var _this$props$onItemsPe, _this$props;

      (_this$props$onItemsPe = (_this$props = _this.props)
        .onItemsPerPageChange) === null || _this$props$onItemsPe === void 0
        ? void 0
        : _this$props$onItemsPe.call(_this$props, itemsPerPage);

      _this.setState({
        itemsPerPage: itemsPerPage,
        activePage: 1,
      });
    };

    _this.handlePageChange = function(activePage) {
      _this.setState({
        activePage: activePage,
      });
    };

    _this.fetchData = function() {
      var _this$state2 = _this.state,
        sortBy = _this$state2.sortBy,
        sortOrder = _this$state2.sortOrder,
        filters = _this$state2.filters,
        activePage = _this$state2.activePage,
        itemsPerPage = _this$state2.itemsPerPage,
        grouping = _this$state2.grouping,
        generalSearch = _this$state2.generalSearch,
        columnsConfig = _this$state2.columnsConfig;
      _this.props.fetchData &&
        _this.props.fetchData(
          {
            sortBy: sortBy,
            sortOrder: sortOrder,
            filters: filters,
            activePage: activePage,
            itemsPerPage: itemsPerPage,
            grouping: grouping,
            generalSearch: generalSearch,
            columns: columnsConfig,
          },
          _this.props,
        );
    };

    _this.fetchReportData = function() {
      var _this$props$fetchRepo, _this$props$fetchRepo2, _this$props2;

      var _this$state3 = _this.state,
        sortBy = _this$state3.sortBy,
        sortOrder = _this$state3.sortOrder,
        filters = _this$state3.filters,
        activePage = _this$state3.activePage,
        itemsPerPage = _this$state3.itemsPerPage,
        grouping = _this$state3.grouping,
        generalSearch = _this$state3.generalSearch,
        columnsConfig = _this$state3.columnsConfig;
      return (_this$props$fetchRepo =
        (_this$props$fetchRepo2 = (_this$props2 = _this.props)
          .fetchReportData) === null || _this$props$fetchRepo2 === void 0
          ? void 0
          : _this$props$fetchRepo2.call(
              _this$props2,
              {
                sortBy: sortBy,
                sortOrder: sortOrder,
                filters: filters,
                activePage: activePage,
                itemsPerPage: itemsPerPage,
                grouping: grouping,
                generalSearch: generalSearch,
                columns: columnsConfig,
              },
              _this.props,
            )) !== null && _this$props$fetchRepo !== void 0
        ? _this$props$fetchRepo
        : [];
    };

    return _this;
  }

  var _proto = EZNetworkGrid.prototype;

  _proto.render = function render() {
    var _this$state4 = this.state,
      generalSearch = _this$state4.generalSearch,
      filters = _this$state4.filters,
      columns = _this$state4.columns,
      columnsConfig = _this$state4.columnsConfig,
      sortBy = _this$state4.sortBy,
      sortOrder = _this$state4.sortOrder,
      grouping = _this$state4.grouping,
      itemsPerPage = _this$state4.itemsPerPage,
      activePage = _this$state4.activePage;
    var _this$props3 = this.props,
      data = _this$props3.data,
      exportBaseName = _this$props3.exportBaseName,
      loading = _this$props3.loading,
      loadingMessage = _this$props3.loadingMessage,
      additionalTemplateInfo = _this$props3.additionalTemplateInfo,
      rowLevelStyleCalc = _this$props3.rowLevelStyleCalc,
      rowLevelPropsCalc = _this$props3.rowLevelPropsCalc,
      onRowClick = _this$props3.onRowClick,
      emptyMessage = _this$props3.emptyMessage,
      height = _this$props3.height,
      totalRows = _this$props3.totalRows; // const includeHeaderItems =
    //   this.props.legend ||
    //   this.props.extraHeaderItem ||
    //   !this.props.disableQuickViewEditing
    //   || ;

    var extraHeaderItem = React__default.createElement(
      React__default.Fragment,
      null,
      React__default.createElement(QuickViews, {
        id: this.props.quickViewsId,
        config: this.props.quickViews,
        defaultValue: this.props.defaultQuickView,
        disableChanges: this.props.disableQuickViewEditing,
        onChange: this.props.onQuickViewChange,
        onShare: this.props.onQuickViewShare,
        ownerId: this.props.ownerId,
        url: this.props.quickViewsURL,
        value: this.props.quickView,
        onViewChange: this.handleQuickViewChange,
        getView: this.getView,
        disableMenu: this.props.disableQuickViewMenu,
      }),
      this.props.legend &&
        React__default.createElement(semanticUiReact.Popup, {
          flowing: true,
          trigger: React__default.createElement(semanticUiReact.Button, {
            icon: 'info circle',
            content: 'Legend',
            inverted: true,
          }),
          children: this.props.legend,
        }),
      this.props.extraHeaderItem,
    );
    var props = {
      generalSearch: generalSearch,
      filters: filters,
      columns: columns,
      sortBy: sortBy,
      sortOrder: sortOrder,
      grouping: grouping,
      data: data,
      exportBaseName: exportBaseName,
      loading: loading,
      loadingMessage: loadingMessage,
      additionalTemplateInfo: additionalTemplateInfo,
      rowLevelStyleCalc: rowLevelStyleCalc,
      rowLevelPropsCalc: rowLevelPropsCalc,
      onRowClick: onRowClick,
      onReloadData: this.props.fetchData && this.fetchData,
      getExportData: this.props.fetchReportData && this.fetchReportData,
      emptyMessage: emptyMessage,
      extraHeaderItem: extraHeaderItem,
      columnsConfig: columnsConfig,
      itemsPerPage: itemsPerPage,
      activePage: activePage,
      height: height,
      totalRows: totalRows,
      onPageChange: this.handlePageChange,
      onItemsPerPageChange: this.handleItemsPerPageChange,
      isPaginated: true,
    };
    if (!this.props.disableGeneralSearch)
      props.onGeneralSearch = this.handleGeneralSearch;

    if (!this.props.disableGrouping) {
      props.onGroupChange = this.handleGroupChange;
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

    return React__default.createElement(
      QHGrid,
      Object.assign({}, props, {
        qhGridRef: this.qhGridRef,
      }),
    );
  };

  return EZNetworkGrid;
})(React.PureComponent);
EZNetworkGrid.defaultProps = {
  showError: function showError() {},
  itemsPerPage: 15,
};

function mapColumnsConfig$1(columns) {
  if (columns === void 0) {
    columns = [];
  }

  return columns.map(function(column) {
    var id = column.id || '' + getField(column.field);
    return _extends({}, column, {
      id: id,
      hidden: !!column.hidden,
    });
  });
}

exports.EZGrid = EZGrid;
exports.EZNetworkGrid = EZNetworkGrid;
exports.QHGrid = QHGrid;
exports.QuickViewModal = QuickViewModal;
exports.QuickViews = QuickViews;
exports.filterTypes = filterTypes;
exports.getField = getField;
exports.getFieldValue = getFieldValue;
exports.typeMap = typeMap;
//# sourceMappingURL=qhgrid.cjs.development.js.map
