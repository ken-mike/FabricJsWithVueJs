import { fabric } from 'fabric';
import Vue from 'vue';

/**
 * Override the initialize function for the _historyInit();
 */
fabric.Canvas.prototype.initialize = (function (originalFn) {
  return function (...args) {
    originalFn.call(this, ...args);
    this._historyInit();
    return this;
  };
})(fabric.Canvas.prototype.initialize);

/**
 * Override the dispose function for the existing one
 */
fabric.Canvas.prototype.dispose = (function (originalFn) {
  return function (...args) {
    originalFn.call(this, ...args);
    this._historyDispose();
    return this;
  };
})(fabric.Canvas.prototype.dispose);

/**
 * Manage canvas state histories
 */
fabric.Canvas.prototype._historyNext = function () {
  return JSON.stringify(this.toDatalessJSON(this.extraProps));
};

/**
 * Map events
 */
fabric.Canvas.prototype._historyEvents = function () {
  return {
    "object:added": this._historySaveAction,
    "object:removed": this._historySaveAction,
    "object:modified": this._historySaveAction,
    "object:skewing": this._historySaveAction,
  };
};

/**
 * Initialize the plugin
 */
fabric.Canvas.prototype._historyInit = function () {
  this.historyUndo = [];
  this.historyRedo = [];
  this.extraProps = ["selectable"];
  this.historyNextState = this._historyNext();

  this.on(this._historyEvents());
};

fabric.Canvas.prototype._historyDispose = function () {
  this.off(this._historyEvents());
};

fabric.Canvas.prototype._historySaveAction = function () {
  if (this.historyProcessing) return;

  const json = this.historyNextState;
  this.historyUndo.push(json);
  this.historyNextState = this._historyNext();
  this.fire("history:append", { json });
};

fabric.Canvas.prototype.undo = function (callback) {
  this.historyProcessing = true;

  const history = this.historyUndo.pop();
  if (history) {
    this.historyRedo.push(this._historyNext());
    this.historyNextState = history;
    this._loadHistory(history, "history:undo", callback);
  } else {
    this.historyProcessing = false;
  }
};

fabric.Canvas.prototype.redo = function (callback) {
  this.historyProcessing = true;
  const history = this.historyRedo.pop();
  if (history) {
    this.historyUndo.push(this._historyNext());
    this.historyNextState = history;
    this._loadHistory(history, "history:redo", callback);
  } else {
    this.historyProcessing = false;
  }
};

fabric.Canvas.prototype._loadHistory = function (history, event, callback) {
  const that = this;

  this.loadFromJSON(history, function () {
    that.renderAll();
    that.fire(event);
    that.historyProcessing = false;

    if (callback && typeof callback === "function") callback();
  });
};

fabric.Canvas.prototype.clearHistory = function () {
  this.historyUndo = [];
  this.historyRedo = [];
  this.fire("history:clear");
};

fabric.Canvas.prototype.offHistory = function () {
  this.historyProcessing = true;
};

fabric.Canvas.prototype.onHistory = function () {
  this.historyProcessing = false;

  this._historySaveAction();
};

Vue.use(fabric);
