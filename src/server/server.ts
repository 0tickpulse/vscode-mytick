import * as vscServer from "vscode-languageserver/node";
import { YAMLDocument } from "./classes.js";

let connection = vscServer.createConnection(vscServer.ProposedFeatures.all);

const documents: vscServer.TextDocuments<YAMLDocument> = new vscServer.TextDocuments(YAMLDocument);
let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params) => {
    let capabilities = params.capabilities;

    hasConfigurationCapability = !!(capabilities.workspace && !!capabilities.workspace.configuration);
    hasWorkspaceFolderCapability = !!(capabilities.workspace && !!capabilities.workspace.workspaceFolders);
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    return {
        capabilities: {
            textDocumentSync: vscServer.TextDocumentSyncKind.Incremental,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

// documents.onDidChangeContent((change) => {
//     validateTextDocument(change.document);
// });