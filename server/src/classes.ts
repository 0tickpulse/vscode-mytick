/**
 * An empty interface.
 */
export interface _ {}

/**
 * A range in a text document expressed as (zero-based) start and end positions.
 *
 * If you want to specify a range that contains a line including the line ending
 * character(s) then use an end position denoting the start of the next line.
 * For example:
 * ```ts
 * {
 *     start: { line: 5, character: 23 }
 *     end : { line 6, character : 0 }
 * }
 * ```
 */
export interface Range {
    /**
     * The range's start position
     */
    start: Position;
    /**
     * The range's end position.
     */
    end: Position;
}

/**
 * An event describing a change to a text document. If range and rangeLength are omitted
 * the new text is considered to be the full content of the document.
 */
export declare type TextDocumentContentChangeEvent =
    | {
          /**
           * The range of the document that changed.
           */
          range: Range;
          /**
           * The optional length of the range that got replaced.
           *
           * @deprecated use range instead.
           */
          rangeLength?: number;
          /**
           * The new text for the provided range.
           */
          text: string;
      }
    | {
          /**
           * The new text of the whole document.
           */
          text: string;
      };
/**
 * Position in a text document expressed as zero-based line and character offset.
 * The offsets are based on a UTF-16 string representation. So a string of the form
 * `a𐐀b` the character offset of the character `a` is 0, the character offset of `𐐀`
 * is 1 and the character offset of b is 3 since `𐐀` is represented using two code
 * units in UTF-16.
 *
 * Positions are line end character agnostic. So you can not specify a position that
 * denotes `\r|\n` or `\n|` where `|` represents the character offset.
 */
export class Position {
    public constructor(
        /**
         * Line position in a document (zero-based).
         * If a line number is greater than the number of lines in a document, it defaults back to the number of lines in the document.
         * If a line number is negative, it defaults to 0.
         */
        public line: number,
        /**
         * Character offset on a line in a document (zero-based). Assuming that the line is
         * represented as a string, the `character` value represents the gap between the
         * `character` and `character + 1`.
         *
         * If the character value is greater than the line length it defaults back to the
         * line length.
         * If a line number is negative, it defaults to 0.
         */
        public character: number
    ) {}
}

export interface YAMLDocumentInterface {
    readonly uri: string;
    readonly languageId: string;
    readonly version: number;
    getText(): string;
    positionAt(offset: number): Position;
    offsetAt(position: Position): number;
}

export class YAMLDocument implements YAMLDocumentInterface {
    constructor(public readonly uri: string, public readonly languageId: string, public readonly version: number, public readonly content: string) {}

    getText(): string {
        return this.content;
    }

    /**
     * NOT IMPLEMENTED YET BECAUSE I'M LAZY
     * @param offset The offset.
     */
    positionAt(offset: number): Position {
        return new Position(0, 0);
    }

    /**
     * NOT IMPLEMENTED YET BECAUSE I'M LAZY
     * @param offset The offset.
     */
    offsetAt(position: Position): number {
        return 0;
    }
}

export namespace YAMLDocumentInterface {
    export function create(uri: string, languageId: string, version: number, content: string): YAMLDocumentInterface {
        return new YAMLDocument(uri, languageId, version, content);
    }

    export function update(
        document: YAMLDocumentInterface,
        contentChanges: TextDocumentContentChangeEvent[],
        version: number
    ): YAMLDocumentInterface {
        return document;
    }
}

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
    message: string;
    range: Range;
    severity: DocumentDiagnosticSeverity;
}
