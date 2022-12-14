import { CancellationToken, Hover, HoverParams, ServerRequestHandler } from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import { server, hovers } from "../server.js";
import { parseYaml } from "../yaml/yamlParser.js";

export const handleHover: ServerRequestHandler<HoverParams, Hover | undefined | null, never, void> = (params: HoverParams): Hover | null => {
    const line = server.documents.get(params.textDocument.uri)?.getText().split(/\r?\n/)[params.position.line];
    if (!line) {
        return { contents: { kind: "markdown", value: "Hovering over nothing!" } };
    }

    // LIST
    if (line.trim().startsWith("- ")) {
        // TODO make a tokenizer and make this use the tokenizer input instead
        const trimmedLine = line.trim().substring(2);
        const index = line.split(/ |\{/)[0]
        const mechanic = trimmedLine.split(/ |\{/)[0]
        
        return {
            contents: {
                kind: "markdown",
                value: hovers.mechanic[mechanic] ?? "bad"
            }
        } as Hover;
    }

    return { contents: { kind: "markdown", value: `Hovering over ${line}!` } };
};
