import { env_default } from "../env.js";
import { isArray } from "@tarojs/shared";

//#region src/bom/URLSearchParams.ts
const findReg = /[!'()~]|%20|%00/g;
const plusReg = /\+/g;
const replaceCharMap = {
	"!": "%21",
	"'": "%27",
	"(": "%28",
	")": "%29",
	"~": "%7E",
	"%20": "+",
	"%00": "\0"
};
function replacer(match) {
	return replaceCharMap[match];
}
function appendTo(dict, name, value) {
	const res = isArray(value) ? value.join(",") : value;
	if (name in dict) dict[name].push(res);
	else dict[name] = [res];
}
function addEach(value, key) {
	appendTo(this, key, value);
}
function decode(str) {
	return decodeURIComponent(str.replace(plusReg, " "));
}
function encode(str) {
	return encodeURIComponent(str).replace(findReg, replacer);
}
const URLSearchParams = process.env.TARO_PLATFORM === "web" ? env_default.window.URLSearchParams : class {
	#dict = Object.create(null);
	constructor(query) {
		query ??= "";
		const dict = this.#dict;
		if (typeof query === "string") {
			if (query.charAt(0) === "?") {
				query = query.slice(1);
			}
			for (let pairs = query.split("&"), i = 0, length = pairs.length; i < length; i++) {
				const value = pairs[i];
				const index = value.indexOf("=");
				try {
					if (index > -1) {
						appendTo(dict, decode(value.slice(0, index)), decode(value.slice(index + 1)));
					} else if (value.length) {
						appendTo(dict, decode(value), "");
					}
				} catch (err) {
					if (process.env.NODE_ENV !== "production") {
						console.warn(`[Taro warn] URL 参数 ${value} decode 异常`);
					}
				}
			}
		} else {
			if (isArray(query)) {
				for (let i = 0, length = query.length; i < length; i++) {
					const value = query[i];
					appendTo(dict, value[0], value[1]);
				}
			} else if (query.forEach) {
				query.forEach(addEach, dict);
			} else {
				for (const key in query) {
					appendTo(dict, key, query[key]);
				}
			}
		}
	}
	append(name, value) {
		appendTo(this.#dict, name, value);
	}
	delete(name) {
		delete this.#dict[name];
	}
	get(name) {
		const dict = this.#dict;
		return name in dict ? dict[name][0] : null;
	}
	getAll(name) {
		const dict = this.#dict;
		return name in dict ? dict[name].slice(0) : [];
	}
	has(name) {
		return name in this.#dict;
	}
	keys() {
		return Object.keys(this.#dict);
	}
	set(name, value) {
		this.#dict[name] = ["" + value];
	}
	forEach(callback, thisArg) {
		const dict = this.#dict;
		Object.getOwnPropertyNames(dict).forEach(function(name) {
			dict[name].forEach(function(value) {
				callback.call(thisArg, value, name, this);
			}, this);
		}, this);
	}
	toJSON() {
		return {};
	}
	toString() {
		const dict = this.#dict;
		const query = [];
		for (const key in dict) {
			const name = encode(key);
			for (let i = 0, value = dict[key]; i < value.length; i++) {
				query.push(name + "=" + encode(value[i]));
			}
		}
		return query.join("&");
	}
};

//#endregion
export { URLSearchParams };
//# sourceMappingURL=URLSearchParams.js.map