import { isFunction, getComponentsAlias as getComponentsAlias$1, internalComponents } from '@tarojs/shared';
import { COMMENT, CLASS, ID, UID, STYLE, ROOT_STR } from '../constants/index.js';
import '../bom/window.js';

const incrementId = () => {
    const chatCodes = [];
    // A-Z
    for (let i = 65; i <= 90; i++) {
        chatCodes.push(i);
    }
    // a-z
    for (let i = 97; i <= 122; i++) {
        chatCodes.push(i);
    }
    const chatCodesLen = chatCodes.length - 1;
    const list = [0, 0];
    return () => {
        const target = list.map(item => chatCodes[item]);
        const res = String.fromCharCode(...target);
        let tailIdx = list.length - 1;
        list[tailIdx]++;
        while (list[tailIdx] > chatCodesLen) {
            list[tailIdx] = 0;
            tailIdx = tailIdx - 1;
            if (tailIdx < 0) {
                list.push(0);
                break;
            }
            list[tailIdx]++;
        }
        return res;
    };
};
function isElement(node) {
    return node.nodeType === 1 /* NodeType.ELEMENT_NODE */;
}
function isText(node) {
    return node.nodeType === 3 /* NodeType.TEXT_NODE */;
}
function isComment(node) {
    return node.nodeName === COMMENT;
}
function isHasExtractProp(el) {
    const res = Object.keys(el.props).find(prop => {
        return !(/^(class|style|id)$/.test(prop) || prop.startsWith('data-'));
    });
    return Boolean(res);
}
/**
 * 往上寻找组件树直到 root，寻找是否有祖先组件绑定了同类型的事件
 * @param node 当前组件
 * @param type 事件类型
 */
function isParentBinded(node, type) {
    var _a;
    while ((node = (node === null || node === void 0 ? void 0 : node.parentElement) || null)) {
        if (!node || node.nodeName === ROOT_STR || node.nodeName === 'root-portal') {
            return false;
        }
        else if ((_a = node.__handlers[type]) === null || _a === void 0 ? void 0 : _a.length) {
            return true;
        }
    }
    return false;
}
function shortcutAttr(key) {
    switch (key) {
        case STYLE:
            return "st" /* Shortcuts.Style */;
        case ID:
            return UID;
        case CLASS:
            return "cl" /* Shortcuts.Class */;
        default:
            return key;
    }
}
const customWrapperCache = new Map();
function extend(ctor, methodName, options) {
    if (isFunction(options)) {
        options = {
            value: options
        };
    }
    Object.defineProperty(ctor.prototype, methodName, Object.assign({ configurable: true, enumerable: true }, options));
}
let componentsAlias;
function getComponentsAlias() {
    if (!componentsAlias) {
        componentsAlias = getComponentsAlias$1(internalComponents);
    }
    return componentsAlias;
}
function convertNumber2PX(value) {
    return value + 'px';
}

export { convertNumber2PX, customWrapperCache, extend, getComponentsAlias, incrementId, isComment, isElement, isHasExtractProp, isParentBinded, isText, shortcutAttr };
//# sourceMappingURL=index.js.map
