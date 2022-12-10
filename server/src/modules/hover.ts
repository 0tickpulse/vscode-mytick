import { Hover } from "vscode-languageserver";
import { server } from "../server.js";

export function handleHover(): Hover | null {
    server.connection.window.showInformationMessage("Hovering!");
    return {
        contents: "This is a hover"
    };
};