import { MutationRecordType } from "./record.js";

//#region src/dom-external/mutation-observer/implements.ts
const observers = [];
/**
* The MutationObserver provides the ability
* to watch for changes being made to the DOM tree.
* It will invoke a specified callback function
* when DOM changes occur.
* @see https://dom.spec.whatwg.org/#mutationobserver
* @see https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
*/
var MutationObserverImpl = class {
	callback;
	target;
	options;
	records = [];
	constructor(callback) {
		this.callback = callback;
	}
	/**
	* Configures the MutationObserver
	* to begin receiving notifications
	* through its callback function
	* when DOM changes matching the given options occur.
	*
	* Options matching is to be implemented.
	*/
	observe(target, options) {
		this.disconnect();
		this.target = target;
		this.options = options || {};
		observers.push(this);
	}
	/**
	* Stop the MutationObserver instance
	* from receiving further notifications
	* until and unless observe() is called again.
	*/
	disconnect() {
		this.target = null;
		const index = observers.indexOf(this);
		if (index >= 0) {
			observers.splice(index, 1);
		}
	}
	/**
	* Removes all pending notifications
	* from the MutationObserver's notification queue
	* and returns them in a new Array of MutationRecord objects.
	*/
	takeRecords() {
		return this.records.splice(0, this.records.length);
	}
};
/** Match two TaroNodes by sid. */
const sidMatches = (observerTarget, target) => {
	return !!observerTarget && observerTarget.sid === target?.sid;
};
const isConcerned = (record, options) => {
	const { characterData, characterDataOldValue, attributes, attributeOldValue, childList } = options;
	switch (record.type) {
		case MutationRecordType.CHARACTER_DATA:
			if (characterData) {
				if (!characterDataOldValue) record.oldValue = null;
				return true;
			}
			return false;
		case MutationRecordType.ATTRIBUTES:
			if (attributes) {
				if (!attributeOldValue) record.oldValue = null;
				return true;
			}
			return false;
		case MutationRecordType.CHILD_LIST:
			if (childList) {
				return true;
			}
			return false;
	}
};
let pendingMuatations = false;
function logMutation(observer, record) {
	observer.records.push(record);
	if (!pendingMuatations) {
		pendingMuatations = true;
		Promise.resolve().then(() => {
			pendingMuatations = false;
			observers.forEach((observer$1) => {
				return observer$1.callback(observer$1.takeRecords());
			});
		});
	}
}
function recordMutation(record) {
	observers.forEach((observer) => {
		const { options } = observer;
		for (let t = record.target; t; t = t.parentNode) {
			if (sidMatches(observer.target, t) && isConcerned(record, options)) {
				logMutation(observer, record);
				break;
			}
			if (!options.subtree) break;
		}
	});
}

//#endregion
export { MutationObserverImpl, recordMutation };
//# sourceMappingURL=implements.js.map