import * as lsp from "vscode-languageserver/node";
import { ServerRequestHandler, InitializeParams, InitializeResult, InitializeError } from "vscode-languageserver/node";
import { server } from "../server.js";

export const handleInit: ServerRequestHandler<InitializeParams, InitializeResult, never, InitializeError> = (): lsp.InitializeResult => {
    server.connection.window.showInformationMessage("Mythic Language Server initialized!");
    return {
        capabilities: {
            hoverProvider: true,
            completionProvider: {
                resolveProvider: true,
                triggerCharacters: ["@", "?", "~"]
            }
        }
    };
}
