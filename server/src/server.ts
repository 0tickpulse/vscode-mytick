import { TextDocument } from "vscode-languageserver-textdocument";
import * as lsp from "vscode-languageserver/node";
import { handleHover } from "./modules/hover.js";
import { handleInit } from "./modules/init.js";
import { handleCompletion } from "./modules/completion.js";
import * as classes from "./classes.js";

export const server: classes.Server = { connection: lsp.createConnection(lsp.ProposedFeatures.all), documents: new lsp.TextDocuments(TextDocument) };

function registerHandlers() {
    const { connection } = server;
    connection.onInitialize(handleInit);
    connection.onHover(handleHover);
    connection.onCompletion(handleCompletion);
}
function main() {
    const { connection, documents } = server;
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
