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

function SimpleItemFilter(group, options = {}) { // eslint-disable-line no-unused-vars
  let elements = [];
  let activePrimaryFilters = [];
  let activeSecondaryFilters = [];

  /**
   * The group name used in the CSS
   * @type {string}
   */
  Object.defineProperty(this, 'group', { value: group });

  /**
   * The prefix for the CSS classes
   * @type {sting}
   */
  Object.defineProperty(this, 'prefix', { value: ('prefix' in options) ? options.prefix : 'sf' });

  /**
   * The class that is added to buttons that are active
   * @type {string}
   */
  Object.defineProperty(this, 'activeClass', { value: ('activeClass' in options) ? options.activeClass : `${this.prefix}-active` });

  /**
   * The class that is added to items that are hidden
   * @type {string}
   */
  Object.defineProperty(this, 'hiddenClass', { value: ('hiddenClass' in options) ? options.hiddenClass : `${this.prefix}-hidden` });

  /**
   * Indicates whether multiselect is active or not
   * @type {boolean}
   */
  Object.defineProperty(this, 'multiselect', { value: ('multiselect' in options) ? options.multiselect : false });

  /**
   * Sets whether fading class is added to buttons that are not selected
   * @type {boolean}
   */
  Object.defineProperty(this, 'fade', { value: ('fade' in options) ? options.fade : false });

  /**
   * The class that is added to buttons that are faded
   * @type {string}
   */
  Object.defineProperty(this, 'fadeClass', { value: ('fadeClass' in options) ? options.fadeClass : `${this.prefix}-fade` });

  /**
   * Sets whether buttons are able to be toggled
   * @type {boolean}
   */
  Object.defineProperty(this, 'toggle', { value: ('toggle' in options) ? options.toggle : true });

  /**
   * The function that is called to check whether a click event is to be handled
   * @type {function}
   */
  Object.defineProperty(this, 'btnFn', { value: ('btnFn' in options) ? options.btnFn : undefined });

  /**
   * Primary button class derived from the prefix
   * @private
   * @const
   * @type {string}
   */
  const btnPriClass = `${this.prefix}-btn-primary`;

  /**
   * Secondary button class derived from the prefix
   * @private
   * @const
   * @type {string}
   */
  const btnSecClass = `${this.prefix}-btn-secondary`;

  /**
   * Function to get a group of elements from a given array of elements, by their class
   * @private
   * @param  {string} cssClass class being searched for
   * @param  {array} elmts    elements being searched
   * @return {array}          array of elements with cssClass
   */
  const getElementsByClass = (cssClass, elementsList) => {
    const output = [];
    let classes = '';
    elementsList.forEach((element) => {
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
  const getClassStaringWith = (start, classes) => {
    let out = '';
    classes.forEach((i) => {
      if (i.startsWith(start)) out = i;
    });
    return out;
  };

  // source: http://www.avoid.org/?p=78
  function hasClass(el, name) {
    return new RegExp(`(\\s|^)${name}(\\s|$)`).test(el.className);
  }

  function addClass(el, name) {
    if (!hasClass(el, name)) { el.className += (el.className ? ' ' : '') + name; } // eslint-disable-line no-param-reassign
  }

  function removeClass(el, name) {
    if (hasClass(el, name)) {
      el.className = el.className.replace(new RegExp(`(\\s|^)${name}(\\s|$)`), ' ').replace(/^\s+|\s+$/g, ''); // eslint-disable-line no-param-reassign
    }
  }

  /**
   * the main logic loop that is called to do the heavy lifting
   * @private
   * @param  {ClickEvent} e       event object
   * @param  {string} btnType the type of button from {@link SimpleItemFilter#clickHandler}
   */
  const mainLoop = (e, btnType) => {
    const primaryButtons = getElementsByClass(btnPriClass, elements);
    const secondaryButtons = getElementsByClass(btnSecClass, elements);
    const items = getElementsByClass(`${this.prefix}-item`, elements);

    const activePrimaryButtons = getElementsByClass(this.activeClass, primaryButtons);
    const activeSecondaryButtons = getElementsByClass(this.activeClass, secondaryButtons);

    // Get currently active filters
    activePrimaryButtons.forEach((element) => {
      if (this.activeClass in element.classList) {
        activePrimaryFilters.push(getClassStaringWith(`${this.prefix}-f-`));
      }
    });
    activeSecondaryButtons.forEach((element) => {
      if (this.activeClass in element.classList) {
        activeSecondaryFilters.push(getClassStaringWith(`${this.prefix}-f-`));
      }
    });
    // Get info for the button that was just clicked
    const btnFilter = getClassStaringWith(`${this.prefix}-f-`, e.currentTarget.classList);
    const btnAll = (btnFilter === `${this.prefix}-f-all`);

    // Build filter list
    if (btnAll) {
      if (btnType === 'primary') {
        activePrimaryFilters = [];
      } else if (btnType === 'secondary') {
        activeSecondaryFilters = [];
      }
    } else if (btnType === 'primary') {
      if (this.toggle) {
        if (activePrimaryFilters.includes(btnFilter)) {
          activePrimaryFilters.splice(activePrimaryFilters.lastIndexOf(btnFilter), 1);
        } else {
          if (!this.multiselect) {
            activePrimaryFilters = [];
          }
          activePrimaryFilters.push(btnFilter);
        }
      } else {
        if (!this.multiselect) {
          activePrimaryFilters = [];
        }
        if (!activePrimaryFilters.includes(btnFilter)) {
          activePrimaryFilters.push(btnFilter);
        }
      }
    } else if (btnType === 'secondary') {
      if (this.toggle) {
        if (activeSecondaryFilters.includes(btnFilter)) {
          activeSecondaryFilters[activeSecondaryFilters.lastIndexOf(btnFilter)] = undefined;
          activeSecondaryFilters.sort().pop();
        } else {
          if (!this.multiselect) {
            activeSecondaryFilters = [];
          }
          activeSecondaryFilters.push(btnFilter);
        }
      } else {
        if (!this.multiselect) {
          activeSecondaryFilters = [];
        }
        if (!activeSecondaryFilters.includes(btnFilter)) {
          activeSecondaryFilters.push(btnFilter);
        }
      }
    }
    const primaryFilterAll = (activePrimaryFilters.length === 0);
    const secondaryFilterAll = (activeSecondaryFilters.length === 0);
    // Update Classes on Btns
    primaryButtons.forEach((i) => {
      removeClass(i, this.activeClass);
      if (this.fade) {
        addClass(i, this.fadeClass);
      }
      if (primaryFilterAll) {
        removeClass(i, this.fadeClass);
      } else {
        const classes = getClassStaringWith(`${this.prefix}-f-`, i.classList);
        activePrimaryFilters.forEach((j) => {
          if (classes.includes(j)) {
            addClass(i, this.activeClass);
            removeClass(i, this.fadeClass);
          }
        });
      }
    });
    secondaryButtons.forEach((i) => {
      removeClass(i, this.activeClass);
      if (this.fade) {
        addClass(i, this.fadeClass);
      }
      if (secondaryFilterAll) {
        removeClass(i, this.fadeClass);
      } else {
        const classes = getClassStaringWith(`${this.prefix}-f-`, i.classList);
        activeSecondaryFilters.forEach((j) => {
          if (classes.includes(j)) {
            addClass(i, this.activeClass);
            removeClass(i, this.fadeClass);
          }
        });
      }
    });
    // Update Classes on Items
    items.forEach((item) => {
      addClass(item, this.hiddenClass);
    });
    items.forEach((item) => {
      item.classList.forEach((cls1) => {
        if (activePrimaryFilters.includes(cls1) || primaryFilterAll) {
          item.classList.forEach((cls2) => {
            if (activeSecondaryFilters.includes(cls2) || secondaryFilterAll) {
              removeClass(item, this.hiddenClass);
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
  const clickHandler = btnType => (e) => {
    if (this.btnFn !== undefined) {
      if (this.btnFn(e)) mainLoop(e, btnType);
    } else {
      mainLoop(e, btnType);
    }
  };

  // Get elements in the group and convert the NodeList to an Array
  elements = Array.prototype.slice.call(document.querySelectorAll(`.${this.prefix}-g-${this.group}`));
  // Get buttons
  const primaryButtons = getElementsByClass(btnPriClass, elements);
  const secondaryButtons = getElementsByClass(btnSecClass, elements);
  // Add event handlers
  primaryButtons.forEach((element) => {
    element.addEventListener('click', clickHandler('primary'), false);
  });
  secondaryButtons.forEach((element) => {
    element.addEventListener('click', clickHandler('secondary'), false);
  });
}
