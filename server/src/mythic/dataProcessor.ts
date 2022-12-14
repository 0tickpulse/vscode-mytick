import * as data from "./mythicData.js";
import * as vscServer from "vscode-languageserver/node";
import { HolderType } from "./HolderType.js";

/**
 * Accepted values that *can be easily converted to strings*.
 */
export type LooseString = string | boolean | number;

/**
 * Represents a field of a mechanic, targeter, trigger, or condition.
 * A skill can have multiple fields, and each field can have a single value.
 *
 * # Example
 *
 * ```yaml
 * - projectile{onTick=MySkill}
 * ```
 *
 * In this example, the field `onTick` has the value `MySkill`.
 *
 */
export interface HolderFieldData {
    /**
     * Any aliases for the field. Should not contain the "main" name.
     */
    aliases?: string[];
    /**
     * A description for the field. This is used for hover information. You should use this to explain what the field does, and any remarks or comments about it.
     */
    description?: string;
    /**
     * A placeholder for the field when inserted as a snippet. If your field has a default value, you should use that as the placeholder.
     */
    placeholder?: LooseString;
    /**
     * A function that validates the field's value. If the function returns false, the value is invalid.
     * When invalid, an error will display.
     * @param value The value to validate.
     */
    validator?: (value: string) => boolean;
    /**
     * A list of completions that will be displayed when the field is being typed.
     */
    completions?: (value: string) => string[];
    pluginReqs?: string[];
    /**
     * A default value for the field. If this is set, and the user inserts this value as the field's value, a warning would be sent suggesting the user to remove the unnecessary field.
     *
     * Don't worry about using booleans, numbers, or strings as the default value.
     */
    default?: LooseString;
}

/**
 * A holder is a mechanic, targeter, trigger, or condition. It can have fields, and each field can have a single value.
 *
 * # Example
 *
 * ```yaml
 * - projectile{onTick=MySkill} @Forward{f=10}
 * ```
 *
 * In this example, there's two holders: `projectile` and `Forward`.
 *
 * * `projectile` has a field `onTick` with the value `MySkill`.
 * * `Forward` has a field `f` with the value `10`.
 */
export interface HolderData {
    /**
     * The type of the holder.
     */
    type: HolderType;
    /**
     * Any aliases for the holder. Should not contain the "main" name.
     */
    aliases: string[];
    /**
     * A description for the holder. This is used for hover information. You should use this to explain what the holder does, and any remarks or comments about it.
     */
    description?: string;
    /**
     * A list of valid fields that the holder can have. Keep in mind that you do not need to include {@link defaultFields} here.
     */
    fields?: { [key: string]: HolderFieldData };
    /**
     * Optional list of examples to be displayed.
     */
    examples?: { text: string; explanation?: string }[];
    pluginReqs?: string[];
}

/**
 * Generates markdown text for the holder, used in hovers.
 * @param name The name of the holder.
 * @param holder The holder itself.
 */
export const generateHover = (name: string, holder: HolderData) => {
    const typeString = holder.type.slice(0, 1).toUpperCase() + holder.type.slice(1);
    const lines: string[] = [];
    lines.push(`# ${typeString}: ${name}`);
    if (holder.description !== undefined) {
        lines.push(holder.description ?? "");
    }
    if (holder.fields) {
        lines.push("## Fields");
        for (const [fieldName, field] of Object.entries(holder.fields)) {
            lines.push(
                `* \`${fieldName}` +
                    (field.placeholder !== undefined ? `=${field.placeholder}` : "") +
                    `\`` +
                    (field.description !== undefined ? ` - ${field.description}` : "")
            );
            if (field.pluginReqs) {
                lines.push("### Required plugins:");
                lines.push(...field.pluginReqs.map((req) => `* ${req}`));
            }
        }
    }
    if (holder.pluginReqs) {
        lines.push("## Required plugins:");
        lines.push(...holder.pluginReqs.map((req) => `* ${req}`));
    }
    if (holder.examples) {
        lines.push("## Examples:");
        // TODO Use the custom language
        lines.push(
            ...holder.examples.map((example) => `\`\`\`yaml\n${example.text}\n\`\`\`` + (example.explanation ? `\n${example.explanation}` : ""))
        );
    }
    return lines.join("\n\n");
};

export const generatedHovers = Object.fromEntries(
    Object.entries(data.output).map(([type, holders]) => [
        type,
        Object.fromEntries(Object.entries(holders).map(([name, holder]) => [name, generateHover(name, holder as HolderData)]))
    ])
) as { [key in HolderType]: { [k: string]: string } };
