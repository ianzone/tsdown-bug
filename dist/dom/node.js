import { __toESM } from "../_virtual/rolldown_runtime.js";
import { require_index_cjs } from "../node_modules/.pnpm/@tarojs_shared@4.1.2/node_modules/@tarojs/shared/dist/index.cjs.js";
import { DOCUMENT_FRAGMENT } from "../constants/index.js";
import { MutationRecordType } from "../dom-external/mutation-observer/record.js";
import { MutationObserver } from "../dom-external/mutation-observer/index.js";
import { NodeType } from "./node_types.js";
import env_default from "../env.js";
import { extend, incrementId, isComment } from "../utils/index.js";
import { eventSource } from "./event-source.js";
import { hydrate } from "../hydrate.js";
import { TaroEventTarget } from "./event-target.js";

//#region src/dom/node.ts
var import_index_cjs = __toESM(require_index_cjs(), 1);
const CHILDNODES = import_index_cjs.Childnodes;
const nodeId = incrementId();
var TaroNode = class TaroNode extends TaroEventTarget {
	uid;
	sid;
	nodeType;
	nodeName;
	parentNode = null;
	childNodes = [];
	constructor() {
		super();
		this.uid = "_" + nodeId();
		this.sid = this.uid;
		eventSource.set(this.sid, this);
	}
	hydrate = (node) => () => hydrate(node);
	updateChildNodes(isClean) {
		const cleanChildNodes = () => [];
		const rerenderChildNodes = () => {
			const childNodes = this.childNodes.filter((node) => !isComment(node));
			return childNodes.map(hydrate);
		};
		this.enqueueUpdate({
			path: `${this._path}.${CHILDNODES}`,
			value: isClean ? cleanChildNodes : rerenderChildNodes
		});
	}
	updateSingleChild(index) {
		this.childNodes.forEach((child, childIndex) => {
			if (isComment(child)) return;
			if (index && childIndex < index) return;
			this.enqueueUpdate({
				path: child._path,
				value: this.hydrate(child)
			});
		});
	}
	get _root() {
		return this.parentNode?._root || null;
	}
	findIndex(refChild) {
		const index = this.childNodes.indexOf(refChild);
		(0, import_index_cjs.ensure)(index !== -1, "The node to be replaced is not a child of this node.");
		return index;
	}
	get _path() {
		const parentNode = this.parentNode;
		if (parentNode) {
			const list = parentNode.childNodes.filter((node) => !isComment(node));
			const indexOfNode = list.indexOf(this);
			const index = import_index_cjs.call("getPathIndex", indexOfNode);
			return `${parentNode._path}.${CHILDNODES}.${index}`;
		}
		return "";
	}
	get nextSibling() {
		const parentNode = this.parentNode;
		return parentNode?.childNodes[parentNode.findIndex(this) + 1] || null;
	}
	get previousSibling() {
		const parentNode = this.parentNode;
		return parentNode?.childNodes[parentNode.findIndex(this) - 1] || null;
	}
	get parentElement() {
		const parentNode = this.parentNode;
		if (parentNode?.nodeType === NodeType.ELEMENT_NODE) {
			return parentNode;
		}
		return null;
	}
	get firstChild() {
		return this.childNodes[0] || null;
	}
	get lastChild() {
		const childNodes = this.childNodes;
		return childNodes[childNodes.length - 1] || null;
	}
	/**
	* @textContent 目前只能置空子元素
	* @TODO 等待完整 innerHTML 实现
	*/
	set textContent(text) {
		const removedNodes = this.childNodes.slice();
		const addedNodes = [];
		while (this.firstChild) {
			this.removeChild(this.firstChild, { doUpdate: false });
		}
		if (text === "") {
			this.updateChildNodes(true);
		} else {
			const newText = env_default.document.createTextNode(text);
			addedNodes.push(newText);
			this.appendChild(newText);
			this.updateChildNodes();
		}
		MutationObserver.record({
			type: MutationRecordType.CHILD_LIST,
			target: this,
			removedNodes,
			addedNodes
		});
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/insertBefore
	* @scenario
	* [A,B,C]
	*   1. insert D before C, D has no parent
	*   2. insert D before C, D has the same parent of C
	*   3. insert D before C, D has the different parent of C
	*/
	insertBefore(newChild, refChild, isReplace) {
		if (newChild.nodeName === DOCUMENT_FRAGMENT) {
			newChild.childNodes.reduceRight((previousValue, currentValue) => {
				this.insertBefore(currentValue, previousValue);
				return currentValue;
			}, refChild);
			return newChild;
		}
		newChild.remove({ cleanRef: false });
		let index = 0;
		newChild.parentNode = this;
		if (refChild) {
			index = this.findIndex(refChild);
			this.childNodes.splice(index, 0, newChild);
		} else {
			this.childNodes.push(newChild);
		}
		const childNodesLength = this.childNodes.length;
		if (this._root) {
			if (!refChild) {
				const isOnlyChild = childNodesLength === 1;
				if (isOnlyChild) {
					this.updateChildNodes();
				} else {
					this.enqueueUpdate({
						path: newChild._path,
						value: this.hydrate(newChild)
					});
				}
			} else if (isReplace) {
				this.enqueueUpdate({
					path: newChild._path,
					value: this.hydrate(newChild)
				});
			} else {
				const mark = childNodesLength * 2 / 3;
				if (mark > index) {
					this.updateChildNodes();
				} else {
					this.updateSingleChild(index);
				}
			}
		}
		MutationObserver.record({
			type: MutationRecordType.CHILD_LIST,
			target: this,
			addedNodes: [newChild],
			removedNodes: isReplace ? [refChild] : [],
			nextSibling: isReplace ? refChild.nextSibling : refChild || null,
			previousSibling: newChild.previousSibling
		});
		return newChild;
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/appendChild
	* @scenario
	* [A,B,C]
	*   1. append C, C has no parent
	*   2. append C, C has the same parent of B
	*   3. append C, C has the different parent of B
	*/
	appendChild(newChild) {
		return this.insertBefore(newChild);
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/replaceChild
	* @scenario
	* [A,B,C]
	*   1. replace B with C, C has no parent
	*   2. replace B with C, C has no parent, C has the same parent of B
	*   3. replace B with C, C has no parent, C has the different parent of B
	*/
	replaceChild(newChild, oldChild) {
		if (oldChild.parentNode !== this) return;
		this.insertBefore(newChild, oldChild, true);
		oldChild.remove({ doUpdate: false });
		return oldChild;
	}
	/**
	* @doc https://developer.mozilla.org/zh-CN/docs/Web/API/Node/removeChild
	* @scenario
	* [A,B,C]
	*   1. remove A or B
	*   2. remove C
	*/
	removeChild(child, options = {}) {
		const { cleanRef, doUpdate } = options;
		if (cleanRef !== false && doUpdate !== false) {
			MutationObserver.record({
				type: MutationRecordType.CHILD_LIST,
				target: this,
				removedNodes: [child],
				nextSibling: child.nextSibling,
				previousSibling: child.previousSibling
			});
		}
		const index = this.findIndex(child);
		this.childNodes.splice(index, 1);
		child.parentNode = null;
		if (cleanRef !== false) {
			eventSource.removeNodeTree(child);
		}
		if (this._root && doUpdate !== false) {
			this.updateChildNodes();
		}
		return child;
	}
	remove(options) {
		this.parentNode?.removeChild(this, options);
	}
	hasChildNodes() {
		return this.childNodes.length > 0;
	}
	enqueueUpdate(payload) {
		this._root?.enqueueUpdate(payload);
	}
	get ownerDocument() {
		return env_default.document;
	}
	static extend(methodName, options) {
		extend(TaroNode, methodName, options);
	}
};

//#endregion
export { TaroNode };
//# sourceMappingURL=node.js.map