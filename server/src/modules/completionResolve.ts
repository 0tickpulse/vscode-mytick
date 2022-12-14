import { CompletionItem, RequestHandler } from "vscode-languageserver/node";
import { server } from "../server.js";

export const handleCompletionResolve: RequestHandler<CompletionItem, CompletionItem, void> = (item: CompletionItem): CompletionItem => {
    server.connection.window.showInformationMessage("Completion resolve!");
    return item;
};
