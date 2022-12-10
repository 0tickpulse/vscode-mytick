import * as lsp from "vscode-languageserver/node";
import { YAMLDocumentInterface } from "./classes.js";
import { handleHover } from "./modules/hover.js";
import { handleInit } from "./modules/init.js";
import { TextDocument } from "vscode-languageserver-textdocument";
const documents: lsp.TextDocuments<TextDocument> = new lsp.TextDocuments(TextDocument);

export const connection = lsp.createConnection(lsp.ProposedFeatures.all);

function registerHandlers() {
    connection.onInitialize(handleInit);
    connection.onHover(handleHover);
}
function main() {
    registerHandlers();
    documents.listen(connection);
    connection.listen();
}
if (require.main === module) {
    main();
}
// documents.onDidChangeContent((change) => {
//     validateTextDocument(change.document);
// });
