import * as lsp from "vscode-languageserver/node";
import { connection } from "../server";

export function handleInit() {
    connection.window.showInformationMessage("Mythic Language Server initialized!");
    return {
        capabilities: {
            hoverProvider: true
        }
    };
}
