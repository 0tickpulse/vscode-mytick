import * as vscode from "vscode";

export interface YAMLDocument {
    readonly uri: string;
    readonly languageId: string;
    readonly version: number;
    getText(): string;
    positionAt(offset: number): vscode.Position;
    offsetAt(position: vscode.Position): number;
}

export class YAMLDocument implements YAMLDocument {
    constructor(public readonly uri: string, public readonly languageId: string, public readonly version: number, public readonly content: string) {
    }

    getText(): string {
        return this.content;
    }

    positionAt(offset: number): vscode.Position {
        return new vscode.Position(0, 0);
    }

    offsetAt(position: vscode.Position): number {
        return 0;
    }
}

export namespace YAMLDocument {
    export function create(uri: string, languageId: string, version: number, content: string): YAMLDocument {
        return new YAMLDocument(uri, languageId, version, content);
    }

    export function update(document: YAMLDocument, contentChanges: vscode.TextDocumentContentChangeEvent[], version: number): YAMLDocument {
        return document;
    }

}

