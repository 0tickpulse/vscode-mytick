import { TextDocument } from "vscode-languageserver-textdocument";
import * as lsp from "vscode-languageserver/node";
import { handleHover } from "./modules/hover.js";
import { handleInit } from "./modules/init.js";
import { handleCompletion } from "./modules/completion.js";
import { handleCompletionResolve } from "./modules/completionResolve.js";
import * as classes from "./classes.js";
import * as yaml from "yaml";
import { generatedHovers } from "./mythic/dataProcessor.js";

export const server: classes.Server = {
    connection: lsp.createConnection(lsp.ProposedFeatures.all),
    documents: new lsp.TextDocuments(TextDocument)
};

function registerHandlers() {
    const { connection, documents } = server;
    connection.onInitialize(handleInit);
    connection.onHover(handleHover);
    connection.onCompletion(handleCompletion);
    connection.onCompletionResolve(handleCompletionResolve);
}

function main() {
    const { connection, documents } = server;
    registerHandlers();
    connection.listen();
    documents.listen(connection);
}

export const hovers = generatedHovers;

if (require.main === module) {
    main();
}
