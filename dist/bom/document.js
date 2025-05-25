import { APP, BODY, CONTAINER, HEAD, HTML } from "../constants/index.js";
import { env_default } from "../env.js";
import { TaroDocument } from "../dom/document.js";

//#region src/bom/document.ts
function createDocument() {
	/**
	* <document>
	*   <html>
	*     <head></head>
	*     <body>
	*       <container>
	*         <app id="app" />
	*       </container>
	*     </body>
	*   </html>
	* </document>
	*/
	const doc = new TaroDocument();
	const documentCreateElement = doc.createElement.bind(doc);
	const html = documentCreateElement(HTML);
	const head = documentCreateElement(HEAD);
	const body = documentCreateElement(BODY);
	const app = documentCreateElement(APP);
	app.id = APP;
	const container = documentCreateElement(CONTAINER);
	doc.appendChild(html);
	html.appendChild(head);
	html.appendChild(body);
	body.appendChild(container);
	container.appendChild(app);
	doc.documentElement = html;
	doc.head = head;
	doc.body = body;
	return doc;
}
const taroDocumentProvider = process.env.TARO_PLATFORM === "web" ? env_default.document : env_default.document = createDocument();

//#endregion
export { taroDocumentProvider };
//# sourceMappingURL=document.js.map