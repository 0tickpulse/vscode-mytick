// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import * as vscClient from "vscode-languageclient/node";

let client: vscClient.LanguageClient;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const serverModule = context.asAbsolutePath(path.join("server", "out", "server.js"));
    vscode.window.showInformationMessage(`Attempting to connect to language server at ${serverModule}...`);

    const debugOptions = { execArgv: ["--nolazy"] };
    const serverOptions: vscClient.ServerOptions = {
        run: { module: serverModule, transport: vscClient.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: vscClient.TransportKind.ipc,
            options: debugOptions
        }
    };
    const clientOptions: vscClient.LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "mythic" }]
    };

    client = new vscClient.LanguageClient("mythicLanguageServer", "Mythic Language Server", serverOptions, clientOptions);

    try {
        client.start();
    } catch (e) {
        console.log(e);
    }
}

// This method is called when your extension is deactivated
export function deactivate(): Thenable<void> | undefined {
    return client ? client.stop() : undefined;
}
