// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as path from "path";
import * as vscode from "vscode";
import * as vscClient from "vscode-languageclient/node";

let client: vscClient.LanguageClient;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const serverModule = context.asAbsolutePath(path.join("out", 'server", "server.js'));

    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    const serverOptions: vscClient.ServerOptions = {
        run: { module: serverModule, transport: vscClient.TransportKind.ipc },
        debug: {
            module: serverModule,
            transport: vscClient.TransportKind.ipc,
            options: debugOptions
        }
    };
    const clientOptions: vscClient.LanguageClientOptions = {
        documentSelector: [{ scheme: "file", language: "yaml" }]
    };

    client = new vscClient.LanguageClient("mythicLanguageServer", "Mythic Language Server", serverOptions, clientOptions);

    client.start();

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand("vscode-mytick.helloWorld", () => {
        // The code you place here will be executed every time your command is executed
        // Display a message box to the user
        vscode.window.showInformationMessage("Hello World from vscode-mytick!");
    });

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
