import { Hover } from "vscode-languageserver";
import { connection } from "../server";

export function handleHover(): Hover | null {
    connection.window.showInformationMessage("Hovering!");
    return {
        contents: "This is a hover"
    };
};
