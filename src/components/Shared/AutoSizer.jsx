import React, { Component } from 'react';
import ResizeObserver from 'resize-observer-polyfill';

class AutoSizer extends Component {
  state = { width: 0, height: 0 };

  _node = null;
  _ro = null;
  _raf = null;
  _t = null;
  _pending = null;

  componentDidMount() {
    if (!this._node) return;

    try {
      this._ro = new ResizeObserver((entries) => {
        try {
          const entry = entries?.[0];
          if (!entry) return;

          const { width, height } = entry.contentRect || {};
          this._pending = {
            width: Math.floor(width || 0),
            height: Math.floor(height || 0),
          };

          if (this.props.freeze) return;
          this.scheduleCommit();
        } catch (e) {
          // don’t hard-crash if an edge case happens
          // eslint-disable-next-line no-console
          console.warn('AutoSizer: resize callback failed', e);
        }
      });

      this._ro.observe(this._node);
      this.measureNow();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('AutoSizer: ResizeObserver setup failed', e);
      this.measureNow();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.freeze && !this.props.freeze) {
      this.scheduleCommit(true);
    }
  }

  componentWillUnmount() {
    if (this._ro) this._ro.disconnect();
    if (this._raf) cancelAnimationFrame(this._raf);
    if (this._t) clearTimeout(this._t);
    this._pending = null;
    this._node = null;
  }

  setNode = (el) => {
    this._node = el;
  };

  measureNow = () => {
    if (!this._node) return;
    const r = this._node.getBoundingClientRect();
    this._pending = {
      width: Math.floor(r.width),
      height: Math.floor(r.height),
    };
    if (!this.props.freeze) this.commit();
  };

  scheduleCommit = (force = false) => {
    const { debounceMs = 0 } = this.props;

    if (debounceMs > 0 && !force) {
      if (this._t) clearTimeout(this._t);
      this._t = setTimeout(() => this.commit(), debounceMs);
      return;
    }

    if (this._raf) cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(() => this.commit());
  };

  commit = () => {
    const {
      minWidth = 0,
      minHeight = 0,
      disableWidth = false,
      disableHeight = false,
    } = this.props;

    const p = this._pending;
    if (!p) return;

    const next = {
      width: disableWidth ? this.state.width : Math.max(minWidth, p.width || 0),
      height: disableHeight
        ? this.state.height
        : Math.max(minHeight, p.height || 0),
    };

    if (next.width === this.state.width && next.height === this.state.height)
      return;
    this.setState(next);
  };

  render() {
    const { children, className, style } = this.props;
    const { width, height } = this.state;

    return (
      <div
        ref={this.setNode}
        className={className}
        style={{ width: '100%', height: '100%', minHeight: 0, ...style }}
      >
        {typeof children === 'function'
          ? children({ width, height })
          : children}
      </div>
    );
  }
}

export default AutoSizer;
