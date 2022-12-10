import { Range, TextDocument } from "vscode-languageserver-textdocument";
import * as lsp from "vscode-languageserver/node";

/**
 * An empty interface.
 */
export interface _ {}

export enum DocumentDiagnosticSeverity {
    /**
     * Info should be used for diagnostics that are not errors or warnings, but might cause issues.
     */
    Info = 0,
    /**
     * Warning should be used for diagnostics that will cause issues, but are not fatal.
     */
    Warning = 1,
    /**
     * Error should be used for diagnostics that will cause issues.
     */
    Error = 2
}

/**
 * An individual diagnostic for the document, appearing as an underline.
 */
export interface DocumentDiagnostic {
    /**
     * Will be displayed when hovered.
     */
    message: string;
    range: Range;
    severity: DocumentDiagnosticSeverity;
}

export interface Server {
    connection: lsp.Connection;
    documents: lsp.TextDocuments<TextDocument>;
}