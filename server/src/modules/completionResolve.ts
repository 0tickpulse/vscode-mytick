import { CompletionItem } from "vscode-languageserver/node";
import { server } from "../server.js";

export function handleCompletionResolve(item: CompletionItem): CompletionItem {
    server.connection.window.showInformationMessage("Completion resolve!");
    return item;
}
