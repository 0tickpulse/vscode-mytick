import * as lsp from "vscode-languageserver/node";
import { server } from "../server.js";

export function handleInit(): lsp.InitializeResult {
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
