import { NodeType } from "./node_types.js";

//#region src/dom/tree.ts
function returnTrue() {
	return true;
}
function treeToArray(root, predict) {
	const array = [];
	const filter = predict ?? returnTrue;
	let object = root;
	while (object) {
		if (object.nodeType === NodeType.ELEMENT_NODE && filter(object)) {
			array.push(object);
		}
		object = following(object, root);
	}
	return array;
}
function following(el, root) {
	const firstChild = el.firstChild;
	const isElmentTypeValid = el.nodeType === NodeType.ELEMENT_NODE || el.nodeType === NodeType.DOCUMENT_NODE;
	if (firstChild && isElmentTypeValid) {
		return firstChild;
	}
	let current = el;
	do {
		if (current === root) {
			return null;
		}
		const nextSibling = current.nextSibling;
		if (nextSibling) {
			return nextSibling;
		}
		current = current.parentElement;
	} while (current);
	return null;
}

//#endregion
export { treeToArray };
//# sourceMappingURL=tree.js.map