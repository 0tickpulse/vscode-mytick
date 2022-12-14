import { TextDocument } from "vscode-languageserver-textdocument";
import { server } from "../server";
import * as yaml from "yaml";

export function parseYaml(document: TextDocument) {
    const { connection } = server;
    connection.console.log(`Parsing YAML for file ${document.uri}...`);
    const yamlText = document.getText();
    const yamlDoc = yaml.parseDocument(yamlText, {lineCounter: new yaml.LineCounter()});
    connection.console.log(`Parsed YAML for file ${document.uri}!`);
    return yamlDoc;
}
