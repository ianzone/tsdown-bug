import { internalComponents } from "@tarojs/shared";

//#region src/dom-external/inner-html/tags.ts
function makeMap(str, expectsLowerCase) {
	const map = Object.create(null);
	const list = str.split(",");
	for (let i = 0; i < list.length; i++) map[list[i]] = true;
	return expectsLowerCase ? (val) => !!map[val.toLowerCase()] : (val) => !!map[val];
}
const specialMiniElements = {
	img: "image",
	iframe: "web-view"
};
const internalCompsList = Object.keys(internalComponents).map((i) => i.toLowerCase()).join(",");
const isMiniElements = makeMap(internalCompsList, true);
const isInlineElements = makeMap("a,i,abbr,iframe,select,acronym,slot,small,span,bdi,kbd,strong,big,map,sub,sup,br,mark,mark,meter,template,canvas,textarea,cite,object,time,code,output,u,data,picture,tt,datalist,var,dfn,del,q,em,s,embed,samp,b", true);
const isBlockElements = makeMap("address,fieldset,li,article,figcaption,main,aside,figure,nav,blockquote,footer,ol,details,form,p,dialog,h1,h2,h3,h4,h5,h6,pre,dd,header,section,div,hgroup,table,dl,hr,ul,dt", true);

//#endregion
export { isBlockElements, isInlineElements, isMiniElements, specialMiniElements };
//# sourceMappingURL=tags.js.map