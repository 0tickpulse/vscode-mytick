import * as vscServer from "vscode-languageserver/node";
import { YAMLDocumentInterface } from "./classes.js";

const connection = vscServer.createConnection(vscServer.ProposedFeatures.all);

const documents: vscServer.TextDocuments<YAMLDocumentInterface> = new vscServer.TextDocuments(YAMLDocumentInterface);
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
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true
            }
        }
    };
});

// hover
connection.onHover((params) => {
    connection.console.log(`Hover detected!`);
    const document = documents.get(params.textDocument.uri);
    if (document) {
        const position = params.position;
        const line = document.getText().split("\r")[position.line];
        const word = line.split(" ")[position.character];
        return {
            contents: {
                kind: vscServer.MarkupKind.Markdown,
                value: `**${word}**`
            }
        };
    }
});

connection.onInitialized(() => {
    connection.console.log("Initialized!");
    if (hasConfigurationCapability) {
        // Register for all configuration changes.
        connection.client.register(vscServer.DidChangeConfigurationNotification.type, undefined);
    }
    if (hasWorkspaceFolderCapability) {
        connection.workspace.onDidChangeWorkspaceFolders((_event) => {
            connection.console.log("Workspace folder change event received.");
        });
    }
    connection.client.register(vscServer.HoverRequest.type, undefined);
});

// documents.onDidChangeContent((change) => {
//     validateTextDocument(change.document);
// });
