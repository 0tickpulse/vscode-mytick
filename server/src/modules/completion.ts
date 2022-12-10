import { server } from "../server.js";
import { CompletionItem, CompletionItemKind, TextDocumentPositionParams } from "vscode-languageserver/node";

export function handleCompletion(params: TextDocumentPositionParams): CompletionItem[] {
    server.connection.window.showInformationMessage("Completion!");
    return [
        {
            label: "test",
            kind: CompletionItemKind.Text,
            data: 1
        }
    ];
}
