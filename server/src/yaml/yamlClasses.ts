/**
 * # YAML Object Types
 *
 * Different object types that can be used in YAML.
 *
 * ## Strings
 *
 * Strings are used to represent a string of text.
 * In YAML, strings can be written in two ways: as plain text or as quoted text.
 * Quoted text can be written using single quotes or double quotes.
 *
 * You can also use multiline strings by using the pipe (`|`) or the greater than (`>`) character.
 *
 * ```yaml
 * # Plain text
 * My name: John Doe
 * # Quoted text
 * My other name: 'James Smith'
 * ```
 *
 * ## Numbers
 *
 * Numbers are used to represent a number.
 * To write numbers in YAML, simply just write the number.
 *
 * ```yaml
 * # Integer
 * My age: 20
 * # Float
 * My height: 1.75
 * ```
 *
 * ## Booleans
 *
 * Booleans are used to represent a boolean value.
 * To write booleans in YAML, simply just write `true` or `false`.
 *
 * ```yaml
 * # Boolean
 * My boolean: true
 * ```
 *
 * ## Arrays
 *
 * Arrays are used to represent a list of values.
 * There are two ways to write arrays in YAML: using the block notation or the flow notation.
 *
 * ```yaml
 * # Block notation
 * My array:
 * - 1
 * - 2
 * - 3
 * # Flow notation
 * My array: [1, 2, 3]
 * ```
 *
 * ## Maps
 *
 * Maps are used to represent a list of key-value pairs.
 * There are two ways to write maps in YAML: using the block notation or the flow notation.
 *
 * ```yaml
 * # Block notation
 * My map:
 *     key1: value1
 *     key2: value2
 *     key3: value3
 * # Flow notation
 * My map: {key1: value1, key2: value2, key3: value3}
 * ```
 *
 * ## Null
 *
 * Null is used to represent a null value.
 * To write null values in YAML, simply just write `null`.
 *
 * ```yaml
 * # Null
 * My dignity: null
 * ```
 */
export type yamlTypes = "string" | "number" | "boolean" | "array" | "map" | "null";

export interface yamlType {
    acceptIf: (value: string) => boolean;
    parse: (value: string) => any;
    stringify: (value: any) => string;
}

/**
 * # Mythic Object Types
 * 
 * Different object types that YAML object types represent.
 * 
 * ## Skill
 * 
 * Skills are used to represent a skill.
 * 
 * ```yaml
 * # Skill
 * - projectile{} @Target
 * ```
 * 
 * ## Material
 * 
 * Materials are used to represent a material.
 * 
 * ```yaml
 * # Material
 * Id: STONE
 * ```
 */
export type mythicTypes = "skill" | "material"

export interface mythicType {
    acceptIf: (value: string) => boolean;
    parse: (value: string) => any;
    stringify: (value: any) => string;
}
