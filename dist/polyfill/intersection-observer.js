import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { throttle } from "../utils/lodash.js";
import "../utils/index.js";

//#region src/polyfill/intersection-observer.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
function handleIntersectionObserverPolyfill() {
	if ("IntersectionObserver" in window && "IntersectionObserverEntry" in window && "intersectionRatio" in window.IntersectionObserverEntry.prototype) {
		if (!("isIntersecting" in window.IntersectionObserverEntry.prototype)) {
			Object.defineProperty(window.IntersectionObserverEntry.prototype, "isIntersecting", { get: function() {
				return this.intersectionRatio > 0;
			} });
		}
	} else {
		handleIntersectionObserverObjectPolyfill();
	}
}
function handleIntersectionObserverObjectPolyfill() {
	const document = window.document;
	/**
	* An IntersectionObserver registry. This registry exists to hold a strong
	* reference to IntersectionObserver instances currently observing a target
	* element. Without this registry, instances without another reference may be
	* garbage collected.
	*/
	const registry = [];
	/**
	* Creates the global IntersectionObserverEntry constructor.
	* https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
	* @param {Object} entry A dictionary of instance properties.
	* @constructor
	*/
	function IntersectionObserverEntry(entry) {
		this.time = entry.time;
		this.target = entry.target;
		this.rootBounds = entry.rootBounds;
		this.boundingClientRect = entry.boundingClientRect;
		this.intersectionRect = entry.intersectionRect || getEmptyRect();
		this.isIntersecting = !!entry.intersectionRect;
		const targetRect = this.boundingClientRect;
		const targetArea = targetRect.width * targetRect.height;
		const intersectionRect = this.intersectionRect;
		const intersectionArea = intersectionRect.width * intersectionRect.height;
		if (targetArea) {
			this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
		} else {
			this.intersectionRatio = this.isIntersecting ? 1 : 0;
		}
	}
	/**
	* Creates the global IntersectionObserver constructor.
	* https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
	* @param {Function} callback The function to be invoked after intersection
	*     changes have queued. The function is not invoked if the queue has
	*     been emptied by calling the `takeRecords` method.
	* @param {Object=} opt_options Optional configuration options.
	* @constructor
	*/
	function IntersectionObserver(callback, options = {}) {
		if (!(0, import_index_cjs.isFunction)(callback)) {
			throw new Error("callback must be a function");
		}
		if (options.root && options.root.nodeType != 1) {
			throw new Error("root must be an Element");
		}
		this._checkForIntersections = throttle(this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);
		this._callback = callback;
		this._observationTargets = [];
		this._queuedEntries = [];
		this._rootMarginValues = this._parseRootMargin(options.rootMargin);
		this.thresholds = this._initThresholds(options.threshold);
		this.root = options.root || null;
		this.rootMargin = this._rootMarginValues.map((margin) => margin.value + margin.unit).join(" ");
	}
	/**
	* The minimum interval within which the document will be checked for
	* intersection changes.
	*/
	IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;
	/**
	* The frequency in which the polyfill polls for intersection changes.
	* this can be updated on a per instance basis and must be set prior to
	* calling `observe` on the first target.
	*/
	IntersectionObserver.prototype.POLL_INTERVAL = null;
	/**
	* Use a mutation observer on the root element
	* to detect intersection changes.
	*/
	IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;
	/**
	* Starts observing a target element for intersection changes based on
	* the thresholds values.
	* @param {Element} target The DOM element to observe.
	*/
	IntersectionObserver.prototype.observe = function(target) {
		const isTargetAlreadyObserved = this._observationTargets.some((item) => item.element == target);
		if (isTargetAlreadyObserved) return;
		if (!(target && target.nodeType == 1)) {
			throw new Error("target must be an Element");
		}
		this._registerInstance();
		this._observationTargets.push({
			element: target,
			entry: null
		});
		this._monitorIntersections();
		this._checkForIntersections();
	};
	/**
	* Stops observing a target element for intersection changes.
	* @param {Element} target The DOM element to observe.
	*/
	IntersectionObserver.prototype.unobserve = function(target) {
		this._observationTargets = this._observationTargets.filter((item) => item.element != target);
		if (!this._observationTargets.length) {
			this._unmonitorIntersections();
			this._unregisterInstance();
		}
	};
	/**
	* Stops observing all target elements for intersection changes.
	*/
	IntersectionObserver.prototype.disconnect = function() {
		this._observationTargets = [];
		this._unmonitorIntersections();
		this._unregisterInstance();
	};
	/**
	* Returns any queue entries that have not yet been reported to the
	* callback and clears the queue. This can be used in conjunction with the
	* callback to obtain the absolute most up-to-date intersection information.
	* @return {Array} The currently queued entries.
	*/
	IntersectionObserver.prototype.takeRecords = function() {
		const records = this._queuedEntries.slice();
		this._queuedEntries = [];
		return records;
	};
	/**
	* Accepts the threshold value from the user configuration object and
	* returns a sorted array of unique threshold values. If a value is not
	* between 0 and 1 and error is thrown.
	* @private
	* @param {Array|number=} opt_threshold An optional threshold value or
	*     a list of threshold values, defaulting to [0].
	* @return {Array} A sorted list of unique and valid threshold values.
	*/
	IntersectionObserver.prototype._initThresholds = (opt_threshold) => {
		let threshold = opt_threshold || [0];
		if (!Array.isArray(threshold)) threshold = [threshold];
		return threshold.sort().filter((t, i, a) => {
			if (!(0, import_index_cjs.isNumber)(t) || isNaN(t) || t < 0 || t > 1) {
				throw new Error("threshold must be a number between 0 and 1 inclusively");
			}
			return t !== a[i - 1];
		});
	};
	/**
	* Accepts the rootMargin value from the user configuration object
	* and returns an array of the four margin values as an object containing
	* the value and unit properties. If any of the values are not properly
	* formatted or use a unit other than px or %, and error is thrown.
	* @private
	* @param {string=} opt_rootMargin An optional rootMargin value,
	*     defaulting to '0px'.
	* @return {Array<Object>} An array of margin objects with the keys
	*     value and unit.
	*/
	IntersectionObserver.prototype._parseRootMargin = (opt_rootMargin) => {
		const marginString = opt_rootMargin || "0px";
		const margins = marginString.split(/\s+/).map((margin) => {
			const parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
			if (!parts) {
				throw new Error("rootMargin must be specified in pixels or percent");
			}
			return {
				value: Number.parseFloat(parts[1]),
				unit: parts[2]
			};
		});
		margins[1] = margins[1] || margins[0];
		margins[2] = margins[2] || margins[0];
		margins[3] = margins[3] || margins[1];
		return margins;
	};
	/**
	* Starts polling for intersection changes if the polling is not already
	* happening, and if the page's visibility state is visible.
	* @private
	*/
	IntersectionObserver.prototype._monitorIntersections = function() {
		if (!this._monitoringIntersections) {
			this._monitoringIntersections = true;
			if (this.POLL_INTERVAL) {
				this._monitoringInterval = setInterval(this._checkForIntersections, this.POLL_INTERVAL);
			} else {
				addEvent(window, "resize", this._checkForIntersections, true);
				addEvent(document, "scroll", this._checkForIntersections, true);
				if (this.USE_MUTATION_OBSERVER && "MutationObserver" in window) {
					this._domObserver = new MutationObserver(this._checkForIntersections);
					this._domObserver.observe(document, {
						attributes: true,
						childList: true,
						characterData: true,
						subtree: true
					});
				}
			}
		}
	};
	/**
	* Stops polling for intersection changes.
	* @private
	*/
	IntersectionObserver.prototype._unmonitorIntersections = function() {
		if (this._monitoringIntersections) {
			this._monitoringIntersections = false;
			clearInterval(this._monitoringInterval);
			this._monitoringInterval = null;
			removeEvent(window, "resize", this._checkForIntersections, true);
			removeEvent(document, "scroll", this._checkForIntersections, true);
			if (this._domObserver) {
				this._domObserver.disconnect();
				this._domObserver = null;
			}
		}
	};
	/**
	* Scans each observation target for intersection changes and adds them
	* to the internal entries queue. If new entries are found, it
	* schedules the callback to be invoked.
	* @private
	*/
	IntersectionObserver.prototype._checkForIntersections = function() {
		const rootIsInDom = this._rootIsInDom();
		const rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();
		this._observationTargets.forEach(function(item) {
			const target = item.element;
			const targetRect = getBoundingClientRect(target);
			const rootContainsTarget = this._rootContainsTarget(target);
			const oldEntry = item.entry;
			const intersectionRect = rootIsInDom && rootContainsTarget && this._computeTargetAndRootIntersection(target, rootRect);
			const newEntry = item.entry = new IntersectionObserverEntry({
				time: now(),
				target,
				boundingClientRect: targetRect,
				rootBounds: rootRect,
				intersectionRect,
				intersectionRatio: -1,
				isIntersecting: false
			});
			if (!oldEntry) {
				this._queuedEntries.push(newEntry);
			} else if (rootIsInDom && rootContainsTarget) {
				if (this._hasCrossedThreshold(oldEntry, newEntry)) {
					this._queuedEntries.push(newEntry);
				}
			} else {
				if (oldEntry && oldEntry.isIntersecting) {
					this._queuedEntries.push(newEntry);
				}
			}
		}, this);
		if (this._queuedEntries.length) {
			this._callback(this.takeRecords(), this);
		}
	};
	/**
	* Accepts a target and root rect computes the intersection between then
	* following the algorithm in the spec.
	* TODO(philipwalton): at this time clip-path is not considered.
	* https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
	* @param {Element} target The target DOM element
	* @param {Object} rootRect The bounding rect of the root after being
	*     expanded by the rootMargin value.
	* @return {?Object} The final intersection rect object or undefined if no
	*     intersection is found.
	* @private
	*/
	IntersectionObserver.prototype._computeTargetAndRootIntersection = function(target, rootRect) {
		if (window.getComputedStyle(target).display === "none") return;
		const targetRect = getBoundingClientRect(target);
		let intersectionRect = targetRect;
		let parent = getParentNode(target);
		let atRoot = false;
		while (!atRoot) {
			let parentRect = null;
			const parentComputedStyle = parent.nodeType == 1 ? window.getComputedStyle(parent) : {};
			if (parentComputedStyle.display === "none") return;
			if (parent == this.root || parent == document) {
				atRoot = true;
				parentRect = rootRect;
			} else {
				if (parent != document.body && parent != document.documentElement && parentComputedStyle.overflow != "visible") {
					parentRect = getBoundingClientRect(parent);
				}
			}
			if (parentRect) {
				intersectionRect = computeRectIntersection(parentRect, intersectionRect);
				if (!intersectionRect) break;
			}
			parent = getParentNode(parent);
		}
		return intersectionRect;
	};
	/**
	* Returns the root rect after being expanded by the rootMargin value.
	* @return {Object} The expanded root rect.
	* @private
	*/
	IntersectionObserver.prototype._getRootRect = function() {
		let rootRect;
		if (this.root) {
			rootRect = getBoundingClientRect(this.root);
		} else {
			const html = document.documentElement;
			const body = document.body;
			rootRect = {
				top: 0,
				left: 0,
				right: html.clientWidth || body.clientWidth,
				width: html.clientWidth || body.clientWidth,
				bottom: html.clientHeight || body.clientHeight,
				height: html.clientHeight || body.clientHeight
			};
		}
		return this._expandRectByRootMargin(rootRect);
	};
	/**
	* Accepts a rect and expands it by the rootMargin value.
	* @param {Object} rect The rect object to expand.
	* @return {Object} The expanded rect.
	* @private
	*/
	IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
		const margins = this._rootMarginValues.map((margin, i) => margin.unit === "px" ? margin.value : margin.value * (i % 2 ? rect.width : rect.height) / 100);
		const newRect = {
			top: rect.top - margins[0],
			right: rect.right + margins[1],
			bottom: rect.bottom + margins[2],
			left: rect.left - margins[3]
		};
		newRect.width = newRect.right - newRect.left;
		newRect.height = newRect.bottom - newRect.top;
		return newRect;
	};
	/**
	* Accepts an old and new entry and returns true if at least one of the
	* threshold values has been crossed.
	* @param {?IntersectionObserverEntry} oldEntry The previous entry for a
	*    particular target element or null if no previous entry exists.
	* @param {IntersectionObserverEntry} newEntry The current entry for a
	*    particular target element.
	* @return {boolean} Returns true if a any threshold has been crossed.
	* @private
	*/
	IntersectionObserver.prototype._hasCrossedThreshold = function(oldEntry, newEntry) {
		const oldRatio = oldEntry && oldEntry.isIntersecting ? oldEntry.intersectionRatio || 0 : -1;
		const newRatio = newEntry.isIntersecting ? newEntry.intersectionRatio || 0 : -1;
		if (oldRatio === newRatio) return;
		for (let i = 0; i < this.thresholds.length; i++) {
			const threshold = this.thresholds[i];
			if (threshold == oldRatio || threshold == newRatio || threshold < oldRatio !== threshold < newRatio) {
				return true;
			}
		}
	};
	/**
	* Returns whether or not the root element is an element and is in the DOM.
	* @return {boolean} True if the root element is an element and is in the DOM.
	* @private
	*/
	IntersectionObserver.prototype._rootIsInDom = function() {
		return !this.root || containsDeep(document, this.root);
	};
	/**
	* Returns whether or not the target element is a child of root.
	* @param {Element} target The target element to check.
	* @return {boolean} True if the target element is a child of root.
	* @private
	*/
	IntersectionObserver.prototype._rootContainsTarget = function(target) {
		return containsDeep(this.root || document, target);
	};
	/**
	* Adds the instance to the global IntersectionObserver registry if it isn't
	* already present.
	* @private
	*/
	IntersectionObserver.prototype._registerInstance = function() {
		if (registry.indexOf(this) < 0) {
			registry.push(this);
		}
	};
	/**
	* Removes the instance from the global IntersectionObserver registry.
	* @private
	*/
	IntersectionObserver.prototype._unregisterInstance = function() {
		const index = registry.indexOf(this);
		if (index != -1) registry.splice(index, 1);
	};
	/**
	* Returns the result of the performance.now() method or null in browsers
	* that don't support the API.
	* @return {number} The elapsed time since the page was requested.
	*/
	function now() {
		return window.performance && performance.now && performance.now();
	}
	/**
	* Adds an event handler to a DOM node ensuring cross-browser compatibility.
	* @param {Node} node The DOM node to add the event handler to.
	* @param {string} event The event name.
	* @param {Function} fn The event handler to add.
	* @param {boolean} opt_useCapture Optionally adds the even to the capture
	*     phase. Note: this only works in modern browsers.
	*/
	function addEvent(node, event, fn, opt_useCapture) {
		if ((0, import_index_cjs.isFunction)(node.addEventListener)) {
			node.addEventListener(event, fn, opt_useCapture || false);
		} else if ((0, import_index_cjs.isFunction)(node.attachEvent)) {
			node.attachEvent("on" + event, fn);
		}
	}
	/**
	* Removes a previously added event handler from a DOM node.
	* @param {Node} node The DOM node to remove the event handler from.
	* @param {string} event The event name.
	* @param {Function} fn The event handler to remove.
	* @param {boolean} opt_useCapture If the event handler was added with this
	*     flag set to true, it should be set to true here in order to remove it.
	*/
	function removeEvent(node, event, fn, opt_useCapture) {
		if ((0, import_index_cjs.isFunction)(node.removeEventListener)) {
			node.removeEventListener(event, fn, opt_useCapture || false);
		} else if ((0, import_index_cjs.isFunction)(node.detatchEvent)) {
			node.detatchEvent("on" + event, fn);
		}
	}
	/**
	* Returns the intersection between two rect objects.
	* @param {Object} rect1 The first rect.
	* @param {Object} rect2 The second rect.
	* @return {?Object} The intersection rect or undefined if no intersection
	*     is found.
	*/
	function computeRectIntersection(rect1, rect2) {
		const top = Math.max(rect1.top, rect2.top);
		const bottom = Math.min(rect1.bottom, rect2.bottom);
		const left = Math.max(rect1.left, rect2.left);
		const right = Math.min(rect1.right, rect2.right);
		const width = right - left;
		const height = bottom - top;
		return width >= 0 && height >= 0 && {
			top,
			bottom,
			left,
			right,
			width,
			height
		};
	}
	/**
	* Shims the native getBoundingClientRect for compatibility with older IE.
	* @param {Element} el The element whose bounding rect to get.
	* @return {Object} The (possibly shimmed) rect of the element.
	*/
	function getBoundingClientRect(el) {
		let rect;
		try {
			rect = el.getBoundingClientRect();
		} catch (err) {}
		if (!rect) return getEmptyRect();
		if (!(rect.width && rect.height)) {
			rect = {
				top: rect.top,
				right: rect.right,
				bottom: rect.bottom,
				left: rect.left,
				width: rect.right - rect.left,
				height: rect.bottom - rect.top
			};
		}
		return rect;
	}
	/**
	* Returns an empty rect object. An empty rect is returned when an element
	* is not in the DOM.
	* @return {Object} The empty rect.
	*/
	function getEmptyRect() {
		return {
			top: 0,
			bottom: 0,
			left: 0,
			right: 0,
			width: 0,
			height: 0
		};
	}
	/**
	* Checks to see if a parent element contains a child element (including inside
	* shadow DOM).
	* @param {Node} parent The parent element.
	* @param {Node} child The child element.
	* @return {boolean} True if the parent node contains the child node.
	*/
	function containsDeep(parent, child) {
		let node = child;
		while (node) {
			if (node == parent) return true;
			node = getParentNode(node);
		}
		return false;
	}
	/**
	* Gets the parent node of an element or its host element if the parent node
	* is a shadow root.
	* @param {Node} node The node whose parent to get.
	* @return {Node|null} The parent node or null if no parent exists.
	*/
	function getParentNode(node) {
		const parent = node.parentNode;
		if (parent && parent.nodeType == 11 && parent.host) {
			return parent.host;
		}
		if (parent && parent.assignedSlot) {
			return parent.assignedSlot.parentNode;
		}
		return parent;
	}
	window.IntersectionObserver = IntersectionObserver;
	window.IntersectionObserverEntry = IntersectionObserverEntry;
}

//#endregion
export { handleIntersectionObserverPolyfill };
//# sourceMappingURL=intersection-observer.js.map