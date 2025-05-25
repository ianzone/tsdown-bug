import { parseUrl } from "../bom/URL.js";
import { TaroElement } from "./element.js";

//#region src/dom/anchor-element.ts
var AnchorElementAttrs = /* @__PURE__ */ function(AnchorElementAttrs$1) {
	AnchorElementAttrs$1["HREF"] = "href";
	AnchorElementAttrs$1["PROTOCOL"] = "protocol";
	AnchorElementAttrs$1["HOST"] = "host";
	AnchorElementAttrs$1["SEARCH"] = "search";
	AnchorElementAttrs$1["HASH"] = "hash";
	AnchorElementAttrs$1["HOSTNAME"] = "hostname";
	AnchorElementAttrs$1["PORT"] = "port";
	AnchorElementAttrs$1["PATHNAME"] = "pathname";
	return AnchorElementAttrs$1;
}(AnchorElementAttrs || {});
var AnchorElement = class extends TaroElement {
	get href() {
		return this.props[AnchorElementAttrs.HREF] ?? "";
	}
	set href(val) {
		this.setAttribute(AnchorElementAttrs.HREF, val);
	}
	get protocol() {
		return this.props[AnchorElementAttrs.PROTOCOL] ?? "";
	}
	get host() {
		return this.props[AnchorElementAttrs.HOST] ?? "";
	}
	get search() {
		return this.props[AnchorElementAttrs.SEARCH] ?? "";
	}
	get hash() {
		return this.props[AnchorElementAttrs.HASH] ?? "";
	}
	get hostname() {
		return this.props[AnchorElementAttrs.HOSTNAME] ?? "";
	}
	get port() {
		return this.props[AnchorElementAttrs.PORT] ?? "";
	}
	get pathname() {
		return this.props[AnchorElementAttrs.PATHNAME] ?? "";
	}
	setAttribute(qualifiedName, value) {
		if (qualifiedName === AnchorElementAttrs.HREF) {
			const willSetAttr = parseUrl(value);
			for (const k in willSetAttr) super.setAttribute(k, willSetAttr[k]);
		} else super.setAttribute(qualifiedName, value);
	}
};

//#endregion
export { AnchorElement };
//# sourceMappingURL=anchor-element.js.map