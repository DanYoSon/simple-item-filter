'use strict';

/*
 * simple-item-filter
 * @version 1.0.0
 * Copyright (C) 2017  Daniel Idzerda
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

/**
 * Constructor for the SimpleItemFilter
 * @constructor
 * @param {string} group   The name of the group of items being filtered
 * @param {object} options Configuration options, all are optional defaults are shown below
 * @param {string} options.prefix The CSS class prefix.
 *                                Default: `sf`
 * @param {string} options.activeClass CSS class applied to active button(s).
 *                                     Default: `${prefix}-active`
 * @param {string} options.hiddenClass CSS class applied to hidden item(s).
 *                                     Default: `${prefix}-hidden`
 * @param {boolean} options.multiselect If true enables multiselect for primary and
 *                                      secondary filters. Default: `false`
 * @param {boolean} options.fade adds fade class to buttons not selected, unless no buttons
 *                               are selected. Default: `false`
 * @param {string} options.fadeClass class that is added to non-selected buttons when not selected.
 *                                   Default: `${prefix}-fade`
 * @param {boolean} options.toggle toggles buttons when they are clicked
 *                                   Default: true
 * @param {function} options.btnFn function that is called on click events to determine
 *                                 if the event.target is correct. Used when the event handler is
 *                                 attached to a element up the tree from the element being clicked.
 *                                 Returns `true` if the event is to be processed or `false` if not.
 */

function SimpleItemFilter(group) {
  var _this = this;

  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  // eslint-disable-line no-unused-vars
  var elements = [];
  var activePrimaryFilters = [];
  var activeSecondaryFilters = [];

  /**
   * The group name used in the CSS
   * @type {string}
   */
  Object.defineProperty(this, 'group', { value: group });

  /**
   * The prefix for the CSS classes
   * @type {sting}
   */
  Object.defineProperty(this, 'prefix', { value: 'prefix' in options ? options.prefix : 'sf' });

  /**
   * The class that is added to buttons that are active
   * @type {string}
   */
  Object.defineProperty(this, 'activeClass', { value: 'activeClass' in options ? options.activeClass : this.prefix + '-active' });

  /**
   * The class that is added to items that are hidden
   * @type {string}
   */
  Object.defineProperty(this, 'hiddenClass', { value: 'hiddenClass' in options ? options.hiddenClass : this.prefix + '-hidden' });

  /**
   * Indicates whether multiselect is active or not
   * @type {boolean}
   */
  Object.defineProperty(this, 'multiselect', { value: 'multiselect' in options ? options.multiselect : false });

  /**
   * Sets whether fading class is added to buttons that are not selected
   * @type {boolean}
   */
  Object.defineProperty(this, 'fade', { value: 'fade' in options ? options.fade : false });

  /**
   * The class that is added to buttons that are faded
   * @type {string}
   */
  Object.defineProperty(this, 'fadeClass', { value: 'fadeClass' in options ? options.fadeClass : this.prefix + '-fade' });

  /**
   * Sets whether buttons are able to be toggled
   * @type {boolean}
   */
  Object.defineProperty(this, 'toggle', { value: 'toggle' in options ? options.toggle : true });

  /**
   * The function that is called to check whether a click event is to be handled
   * @type {function}
   */
  Object.defineProperty(this, 'btnFn', { value: 'btnFn' in options ? options.btnFn : undefined });

  /**
   * Primary button class derived from the prefix
   * @private
   * @const
   * @type {string}
   */
  var btnPriClass = this.prefix + '-btn-primary';

  /**
   * Secondary button class derived from the prefix
   * @private
   * @const
   * @type {string}
   */
  var btnSecClass = this.prefix + '-btn-secondary';

  /**
   * Function to get a group of elements from a given array of elements, by their class
   * @private
   * @param  {string} cssClass class being searched for
   * @param  {array} elmts    elements being searched
   * @return {array}          array of elements with cssClass
   */
  var getElementsByClass = function getElementsByClass(cssClass, elementsList) {
    var output = [];
    var classes = '';
    elementsList.forEach(function (element) {
      classes = element.attributes.class.value.split(/\s+/);
      if (classes.includes(cssClass)) output.push(element);
    });
    return output;
  };

  /**
   * gets class starting with the given string
   * @private
   * @param  {string} start   string that the class being searched for starts with
   * @param  {array} classes array of classes
   * @return {string}         class matching search or none
   */
  var getClassStaringWith = function getClassStaringWith(start, classes) {
    var out = '';
    classes.forEach(function (i) {
      if (i.startsWith(start)) out = i;
    });
    return out;
  };

  // source: http://www.avoid.org/?p=78
  function hasClass(el, name) {
    return new RegExp('(\\s|^)' + name + '(\\s|$)').test(el.className);
  }

  function addClass(el, name) {
    if (!hasClass(el, name)) {
      el.className += (el.className ? ' ' : '') + name;
    } // eslint-disable-line no-param-reassign
  }

  function removeClass(el, name) {
    if (hasClass(el, name)) {
      el.className = el.className.replace(new RegExp('(\\s|^)' + name + '(\\s|$)'), ' ').replace(/^\s+|\s+$/g, ''); // eslint-disable-line no-param-reassign
    }
  }

  /**
   * the main logic loop that is called to do the heavy lifting
   * @private
   * @param  {ClickEvent} e       event object
   * @param  {string} btnType the type of button from {@link SimpleItemFilter#clickHandler}
   */
  var mainLoop = function mainLoop(e, btnType) {
    var primaryButtons = getElementsByClass(btnPriClass, elements);
    var secondaryButtons = getElementsByClass(btnSecClass, elements);
    var items = getElementsByClass(_this.prefix + '-item', elements);

    var activePrimaryButtons = getElementsByClass(_this.activeClass, primaryButtons);
    var activeSecondaryButtons = getElementsByClass(_this.activeClass, secondaryButtons);

    // Get currently active filters
    activePrimaryButtons.forEach(function (element) {
      if (_this.activeClass in element.classList) {
        activePrimaryFilters.push(getClassStaringWith(_this.prefix + '-f-'));
      }
    });
    activeSecondaryButtons.forEach(function (element) {
      if (_this.activeClass in element.classList) {
        activeSecondaryFilters.push(getClassStaringWith(_this.prefix + '-f-'));
      }
    });
    // Get info for the button that was just clicked
    var btnFilter = getClassStaringWith(_this.prefix + '-f-', e.currentTarget.classList);
    var btnAll = btnFilter === _this.prefix + '-f-all';

    // Build filter list
    if (btnAll) {
      if (btnType === 'primary') {
        activePrimaryFilters = [];
      } else if (btnType === 'secondary') {
        activeSecondaryFilters = [];
      }
    } else if (btnType === 'primary') {
      if (_this.toggle) {
        if (activePrimaryFilters.includes(btnFilter)) {
          activePrimaryFilters.splice(activePrimaryFilters.lastIndexOf(btnFilter), 1);
        } else {
          if (!_this.multiselect) {
            activePrimaryFilters = [];
          }
          activePrimaryFilters.push(btnFilter);
        }
      } else {
        if (!_this.multiselect) {
          activePrimaryFilters = [];
        }
        if (!activePrimaryFilters.includes(btnFilter)) {
          activePrimaryFilters.push(btnFilter);
        }
      }
    } else if (btnType === 'secondary') {
      if (_this.toggle) {
        if (activeSecondaryFilters.includes(btnFilter)) {
          activeSecondaryFilters[activeSecondaryFilters.lastIndexOf(btnFilter)] = undefined;
          activeSecondaryFilters.sort().pop();
        } else {
          if (!_this.multiselect) {
            activeSecondaryFilters = [];
          }
          activeSecondaryFilters.push(btnFilter);
        }
      } else {
        if (!_this.multiselect) {
          activeSecondaryFilters = [];
        }
        if (!activeSecondaryFilters.includes(btnFilter)) {
          activeSecondaryFilters.push(btnFilter);
        }
      }
    }
    var primaryFilterAll = activePrimaryFilters.length === 0;
    var secondaryFilterAll = activeSecondaryFilters.length === 0;
    // Update Classes on Btns
    primaryButtons.forEach(function (i) {
      removeClass(i, _this.activeClass);
      if (_this.fade) {
        addClass(i, _this.fadeClass);
      }
      if (primaryFilterAll) {
        removeClass(i, _this.fadeClass);
      } else {
        var classes = getClassStaringWith(_this.prefix + '-f-', i.classList);
        activePrimaryFilters.forEach(function (j) {
          if (classes.includes(j)) {
            addClass(i, _this.activeClass);
            removeClass(i, _this.fadeClass);
          }
        });
      }
    });
    secondaryButtons.forEach(function (i) {
      removeClass(i, _this.activeClass);
      if (_this.fade) {
        addClass(i, _this.fadeClass);
      }
      if (secondaryFilterAll) {
        removeClass(i, _this.fadeClass);
      } else {
        var classes = getClassStaringWith(_this.prefix + '-f-', i.classList);
        activeSecondaryFilters.forEach(function (j) {
          if (classes.includes(j)) {
            addClass(i, _this.activeClass);
            removeClass(i, _this.fadeClass);
          }
        });
      }
    });
    // Update Classes on Items
    items.forEach(function (item) {
      addClass(item, _this.hiddenClass);
    });
    items.forEach(function (item) {
      item.classList.forEach(function (cls1) {
        if (activePrimaryFilters.includes(cls1) || primaryFilterAll) {
          item.classList.forEach(function (cls2) {
            if (activeSecondaryFilters.includes(cls2) || secondaryFilterAll) {
              removeClass(item, _this.hiddenClass);
            }
          });
        }
      });
    });
  };

  /**
   * handles clicks to elements passing the btn type to the function handling the click
   * @private
   * @param  {string} btnType either `primary` or `secondary`
   * @return {function} anonymousFunction function that actually calls the main loop if the
   *                                      correct button is clicked
   */
  var clickHandler = function clickHandler(btnType) {
    return function (e) {
      if (_this.btnFn !== undefined) {
        if (_this.btnFn(e)) mainLoop(e, btnType);
      } else {
        mainLoop(e, btnType);
      }
    };
  };

  // Get elements in the group and convert the NodeList to an Array
  elements = Array.prototype.slice.call(document.querySelectorAll('.' + this.prefix + '-g-' + this.group));
  // Get buttons
  var primaryButtons = getElementsByClass(btnPriClass, elements);
  var secondaryButtons = getElementsByClass(btnSecClass, elements);
  // Add event handlers
  primaryButtons.forEach(function (element) {
    element.addEventListener('click', clickHandler('primary'), false);
  });
  secondaryButtons.forEach(function (element) {
    element.addEventListener('click', clickHandler('secondary'), false);
  });
}