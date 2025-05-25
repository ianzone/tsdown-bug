//#region src/dom/event-source.ts
var EventSource = class extends Map {
	removeNode(child) {
		const { sid, uid } = child;
		this.delete(sid);
		if (uid !== sid && uid) this.delete(uid);
	}
	removeNodeTree(child) {
		this.removeNode(child);
		const { childNodes } = child;
		childNodes.forEach((node) => this.removeNodeTree(node));
	}
};
const eventSource = new EventSource();

//#endregion
export { eventSource };
//# sourceMappingURL=event-source.js.map