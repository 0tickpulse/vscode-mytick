import { server } from "../server.js";
import {
    CompletionItem,
    CompletionItemKind,
    CompletionList,
    CompletionParams,
    ServerRequestHandler,
    TextDocumentPositionParams
} from "vscode-languageserver/node";

export const handleCompletion: ServerRequestHandler<
    CompletionParams,
    CompletionItem[] | CompletionList | undefined | null,
    CompletionItem[],
    void
> = (params: TextDocumentPositionParams): CompletionItem[] => {
    server.connection.window.showInformationMessage("Completion!");
    return [
        {
            label: "test",
            kind: CompletionItemKind.Text,
            data: 1
        }
    ];
};
