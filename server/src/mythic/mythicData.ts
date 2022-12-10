// COMPLETED
// - activatespawner mechanic
// - animatearmorstand mechanic
// - armanimation mechanic
// - arrowvolley mechanic
// - aura mechanic
// - auraremove mechanic
// - barcreatemechanic
// - barset mechanic
// - basedamage mechanic
// - blackscreen mechanic
// - blockdestabilize mechanic
// - blockmask mechanic
// - blockphysics mechanic
// - blockunmask mechanic
import materialTypes from "../materials.js";
import { HolderData, HolderFieldData, HolderType, LooseString } from "./dataProcessor.js";

/**
 * A list of plugins, modules, etc. that some holders and fields require.
 *
 * For example, the `element` field in `DamagingMechanic` requires {@link pluginReq.mythicMobsPremium}.
 *
 * The value should be how it should be displayed in text.
 */
export const pluginReq = {
    mythicMobsPremium: "MythicMobs premium",
    mythicCrucible: "MythicCrucible",
    mythicEnchants: "MythicEnchants",
    mythicAdvancements: "MythicAdvancements",
    modelEngine: "ModelEngine"
};

const looseStringToString = (value: LooseString) => {
    if (typeof value === "string") {
        return value;
    }
    if (typeof value === "boolean") {
        return value ? "true" : "false";
    }
    return value.toString();
};
const matchLooseString = (string: string, value: LooseString) => {
    if (typeof value === "number") {
        return parseFloat(string) === value;
    }
    return string === looseStringToString(value);
};

/**
 * Returns whether an array of strings contains a given string, case insensitive.
 * @param value The value to check.
 * @param array The array to check against.
 */
const includesCaseInsensitive = (value: string, array: string[]) => {
    return array.some((item) => item.toLowerCase() === value.toLowerCase());
};

/**
 * Returns a copy of an object with certain keys excluded.
 * @param obj THe base object to copy.
 * @param keys The keys to exclude.
 */
const excludeKeys = (obj: { [key: string]: any }, keys: string[]) => {
    const newObj = { ...obj };
    keys.forEach((key) => delete newObj[key]);
    return newObj;
};

/**
 * Formats a list of strings into a string that can be used in a documentation entry.
 * @param list The list.
 * @param final A final word, such as "and" or "or".
 */
const formatListForDoc = (list: string[], final: string = "and") =>
    list
        .map((item, index) => {
            if (index === list.length - 1) {
                return `${final} \`${item}\``;
            }
            return "`" + item + "`";
        })
        .join(", ");

/**
 * Returns a function that can be used for completions for a list of objects.
 *
 * For example:
 *
 * ```ts
 * arrayCompletion(["foo", "bar"])("foo,b")
 * // ["foo", "bar"]
 * ```
 *
 * @param array The array.
 * @returns
 */
const arrayCompletion = (array: string[]) => (input: string) => {
    if (input === "") {
        return array;
    }
    const split = input.split(",");
    const last = split[split.length - 1];
    return array.filter((item) => item.startsWith(last.trim())).map((item) => [...split.slice(0, -1), item].join(","));
};

const bossbarColors = ["PINK", "BLUE", "RED", "GREEN", "YELLOW", "PURPLE", "WHITE"];
const bossbarStyles = ["SOLID", "SEGMENTED_6", "SEGMENTED_10", "SEGMENTED_12", "SEGMENTED_20"];

const damageCauses = [
    "contact",
    "entity_attack",
    "entity_sweep_attack",
    "projectile",
    "suffocation",
    "fall",
    "fire",
    "fire_tick",
    "melting",
    "lava",
    "drowning",
    "block_explosion",
    "entity_explosion",
    "void",
    "lightning",
    "suicide",
    "starvation",
    "poison",
    "magic",
    "wither",
    "falling_block",
    "thorns",
    "dragon_breath",
    "custom",
    "fly_into_wall",
    "hot_floor",
    "cramming",
    "dryout",
    "freeze",
    "sonic_boom"
];
const blockFaces = [
    "DOWN",
    "EAST",
    "EAST_NORTH_EAST",
    "EAST_SOUTH_EAST",
    "NORTH",
    "NORTH_EAST",
    "NORTH_NORTH_EAST",
    "NORTH_NORTH_WEST",
    "NORTH_WEST",
    "SELF",
    "SOUTH",
    "SOUTH_EAST",
    "SOUTH_SOUTH_EAST",
    "SOUTH_SOUTH_WEST",
    "SOUTH_WEST",
    "UP",
    "WEST",
    "WEST_NORTH_WEST",
    "WEST_SOUTH_WEST"
];

const maxInt = 2147483647;

/**
 * A utility function to quickly generate field data for fields that take in elements of a list.
 * For example:
 *
 * ```ts
 * listTypeField(["foo", "bar"], true, "foo");
 * // { completions: () => ["foo", "bar"], validator: (value: string) => value in ["foo", "bar"], default: "foo" }
 * ```
 *
 * @param list A list of strings.
 * @param caseSensitive Whether the validation should be case sensitive.
 */
const listTypeField = (list: string[], caseSensitive: boolean = false, array: boolean = false, defaultValue?: string): HolderFieldData => {
    const output: HolderFieldData = {
        completions: () => list,
        validator: caseSensitive ? (value: string) => value in list : (value: string) => includesCaseInsensitive(value, list)
    };
    if (defaultValue !== undefined) {
        output.default = defaultValue;
    }
    return output;
};

/**
 * A set of templates for fields, to be used using spread syntax.
 */
const fieldTemplates = {
    spawner: {
        placeholder: "<spawner>"
    },
    duration: {
        description: "The duration, in ticks (one tick is 0.05 seconds, there's 20 ticks in a second).",
        validator: (value: string) => !Number.isNaN(parseInt(value))
    },
    // Maybe merge both of these into one?
    booleanDefaultTrue: {
        ...listTypeField(["true", "false"]),
        default: true
    },
    booleanDefaultFalse: {
        ...listTypeField(["false", "true"]),
        default: false
    },
    vector: {
        description: "A vector, in the format x,y,z.",
        placeholder: "${1:0},${2:0},${3:0}",
        // Needs testing
        validator: (value: string) => {
            const parts = value.split(",");
            return parts.length === 3 && parts.every((part) => !Number.isNaN(parseFloat(part.trim())));
        }
    },
    int: {
        description: "Any integer.",
        validator: (value: string) => !Number.isNaN(parseInt(value))
    },
    float: {
        description: "A floating point number.",
        validator: (value: string) => !Number.isNaN(parseFloat(value))
    },
    seconds: {
        description: "A duration in seconds.",
        validator: (value: string) => !Number.isNaN(parseFloat(value)) && parseFloat(value) % 0.05 === 0
    },
    metaskill: {
        description: "A meta-skill, or an inline skill."
    },
    barColor: {
        ...listTypeField(bossbarColors, true, false, "RED"),
        aliases: ["bartimercolor"],
        description: `The color of the bossbar, case sensitive. Can be ${formatListForDoc(bossbarColors, "or")}.`
    },
    barStyle: {
        ...listTypeField(bossbarStyles, true, false, "SOLID"),
        aliases: ["bartimerstyle"],
        description: `The style of the bossbar, case sensitive. Can be ${formatListForDoc(bossbarStyles, "or")}.`
    },
    material: {
        ...listTypeField(materialTypes),
        description: "Any material."
    },
    maskShapes: {
        ...listTypeField(["sphere", "cube"], false, false, "sphere")
    }
} satisfies { [key: string]: HolderFieldData };

/**
 * A collection of functions that generate a field dynamically from inputs.
 */
const dynamicTemplates = {
    intRange: (min: number, max: number): HolderFieldData => ({
        description: `An integer between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseInt(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    }),
    floatRange: (min: number, max: number): HolderFieldData => ({
        description: `A floating point number between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseFloat(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    })
} satisfies { [key: string]: (...args: any[]) => HolderFieldData };

const prefilledFields = {
    /** Fields for auras */
    auraFields: {
        auraname: {
            aliases: ["buffname", "debuffname"],
            description: "The name of the aura."
        },
        charges: {
            aliases: ["c"],
            description: "The number of charges to apply.",
            default: 0
        },
        duration: {
            aliases: ["ticks", "t", "d", "time"],
            description: "The duration of the aura in ticks.",
            default: 200
        },
        maxStacks: {
            ...fieldTemplates.int,
            aliases: ["ms"],
            description: "How many times the aura stacks on the same targeted entity if applied multiple times.",
            default: 1
        },
        mergeall: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["ma"],
            description:
                "Merges all of the same auras applied by any and all entities to another into one aura (Prevents multiple mobs from being able to stack an aura multiple times on the same entity)"
        },
        overwriteall: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["overwrite", "oa"],
            description: "When applied, stops all of the same auras applied on the target and replaces them with the new aura."
        },
        overwritesamecaster: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["osc", "oc"],
            // TODO Ambiguous description
            description: "When applied, stops all of the same auras applied on the target by the same caster and replaces them with the new aura"
        },
        mergesamecaster: {
            /**
             * According to the source code, this will be set to true if mergeAll, overwriteAll, and overwriteSameCaster are all set to false.
             * However, I'm too lazy to do that.
             */
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["msc", "mc"],
            description:
                "Merges all of the same auras applied by one entity to another into one aura (Prevents a mob from being able to stack an aura multiple times on the same entity)"
        },
        refreshduration: {
            ...fieldTemplates.booleanDefaultTrue,
            aliases: ["rd"],
            description:
                "Makes the aura's duration refresh to the amount defined in the mechanic should the entity have the same aura applied to it again"
        },
        showbartimer: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["bartimer", "bt"],
            description: "Shows a bossbar timer for the aura."
        },
        bartimerdisplay: {
            aliases: ["bartimertext"],
            /**
             * According to the source code, this defaults to the auraname if unspecified.
             * However, I'm too lazy to do that.
             */
            description: "The text to display on the bossbar timer. Defaults to the aura's name.",
            default: "<skill.var.aura-name>"
        },
        bartimercolor: fieldTemplates.barColor,
        bartimerstyle: fieldTemplates.barStyle,
        cancelongivedamage: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["cogd"],
            description: "Cancels the aura if the entity with the aura deals any damage to another entity."
        },
        cancelontakedamage: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["cotd"],
            description: "Cancels the aura if the entity with the aura takes any damage."
        },
        cancelondeath: {
            ...fieldTemplates.booleanDefaultTrue,
            aliases: ["cod"],
            description: "Cancels the aura if the entity with the aura dies."
        },
        cancelonteleport: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["cot"],
            description: "Cancels the aura if the entity with the aura teleports."
        },
        cancelonchangeworld: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["cocw"],
            description: "Cancels the aura if the entity with the aura changes worlds (most of the time, this applies to players)."
        },
        cancelonskilluse: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["cosu"],
            description: "Cancels the aura if the entity with the aura uses another skill."
        },
        cancelonquit: {
            ...fieldTemplates.booleanDefaultTrue,
            aliases: ["coq"],
            description: "Cancels the aura if the entity with the aura quits the server (almost entirely applies to players)."
        },
        doendskillonterminate: {
            ...fieldTemplates.booleanDefaultTrue,
            /**
             * What does "ares" mean?
             * I'm too lazy to find out.
             */
            aliases: ["desot", "alwaysrunendskill", "ares"],
            description: "Runs the end skill of the aura even when the aura is cancelled."
        },
        onstartskill: {
            ...fieldTemplates.metaskill,
            aliases: ["onstart, os"],
            description: "The meta-skill to run when the aura is first applied."
        },
        ontickskill: {
            ...fieldTemplates.metaskill,
            aliases: ["ontick, ot"],
            description: "The meta-skill to run every set interval (determined by the `interval` field) while the aura is active."
        },
        onendskill: {
            ...fieldTemplates.metaskill,
            aliases: ["onend, oe"],
            description: "The meta-skill to run when the aura ends."
        }
    },
    barFields: {
        name: {
            aliases: ["n"],
            description: "The name of the bossbar.",
            placeholder: "infobar"
        },
        display: {
            aliases: ["d", "bartimerdisplay", "bartimertext"],
            description: "The text displayed on the bar."
        },
        value: {
            ...dynamicTemplates.floatRange(0, 1),
            aliases: ["v"],
            description: "The value of the bar (how filled it is). This is a floating point number between 0 and 1.",
            placeholder: 1
        },
        color: fieldTemplates.barColor,
        style: fieldTemplates.barStyle
    },
    /**
     * Represents fields that are in classes that extend DamagingMechanic.
     */
    damagingMechanic: {
        ignorearmor: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["ia"],
            description: "Whether or not armor should be ignored when calculating damage."
        },
        preventimmunity: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["pi"],
            description: "If set to true, the damage event would not cause any immunity ticks."
        },
        preventknockback: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["pkb", "pk"],
            description: "If set to true, the damage event would not cause any knockback."
        },
        ignoreenchantments: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["ignoreenchants", "ie"],
            description: "Whether or not enchantments should be ignored when calculating damage."
        },
        element: {
            aliases: ["e", "damagetype", "type"],
            description:
                "The element of the damage. This is used in correspondence with [Damage Modifiers](https://git.lumine.io/mythiccraft/MythicMobs/-/wikis/Mobs/DamageModifiers).",
            pluginReqs: [pluginReq.mythicMobsPremium]
        },
        damagecause: {
            aliases: ["dc", "cause"],
            description:
                "The cause of the damage. This is used in correspondence with [Damage Modifiers](https://git.lumine.io/mythiccraft/MythicMobs/-/wikis/Mobs/DamageModifiers).",
            completions: () => damageCauses
        }
    }
} satisfies { [key: string]: { [fieldName: string]: HolderFieldData } };

export const defaultFields = {
    [HolderType.mechanic]: {
        cooldown: {
            ...fieldTemplates.seconds,
            aliases: ["cd"]
        },
        delay: {
            ...fieldTemplates.duration
        },
        targetinterval: {
            ...fieldTemplates.float,
            aliases: ["targeti"],
            description: "The interval (in ticks) at which the skill will run between targets."
        },
        repeat: {
            ...fieldTemplates.int,
            description:
                "The number of times the skill will repeat, not including when it runs normally (`repeat=2` means it'll run, and then repeat two times, therefore running a total of 3 times)."
        },
        repeatinterval: {
            ...fieldTemplates.duration,
            aliases: ["repeati"],
            description: "The interval (in ticks) at which the skill will repeat."
        },
        power: {
            ...fieldTemplates.float,
            description:
                "The power of the skill More information here: [Wiki entry: Power Scaling](https://git.lumine.io/mythiccraft/MythicMobs/-/wikis/Mobs/Power)."
        },
        powersplitbetweentargets: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["powersplit", "splitpower"],
            description: "Whether or not to split the power between targets. If this is true, the power will be divided by the number of targets."
        },
        forcesync: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["sync"],
            description: "Whether or not to force the skill to run synchronously. This is useful for skills that need to run on the main thread."
        },
        targetisorigin: {
            ...fieldTemplates.booleanDefaultFalse,
            description: "Changes the origin to whatever targeter is supplied."
        },
        sourceisorigin: {
            ...fieldTemplates.booleanDefaultFalse,
            aliases: ["castfromorigin", "fromorigin", "fo"],
            description: "Run the skill from the origin"
        },
        origin: {
            // TODO: Origin should tab complete and validate with targeters
            description: "The origin of the skill."
        }
    },
    [HolderType.condition]: {},
    [HolderType.targeter]: {},
    [HolderType.trigger]: {},
} satisfies { [key in HolderType]: { [name: string]: HolderFieldData } };

export const output = {
    [HolderType.mechanic]: {
        togglepiston: {
            type: HolderType.mechanic,
            aliases: ["piston"],
            description: "Toggles a piston at the target location."
        },
        playBlockPlaceSound: {
            type: HolderType.mechanic,
            aliases: ["blockPlaceSound"],
            description: "Plays the target block's placing sound. Requires Paper."
        },
        explosion: {
            type: HolderType.mechanic,
            aliases: ["explode"],
            description: "Causes an explosion at the target location."
        },
        disguiseTarget: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Disguises the target entity."
        },
        setgravity: {
            type: HolderType.mechanic,
            aliases: ["setusegravity"],
            description: "ets whether gravity affects the target entity."
        },
        setmobcolor: {
            type: HolderType.mechanic,
            aliases: ["setcolor"],
            description: "Sets the color the target entity. Must be a colorable entity."
        },
        summonAreaEffectCloud: {
            type: HolderType.mechanic,
            aliases: ["summonCloud"],
            description: "Summons an Area Effect Cloud."
        },
        bossBorder: {
            type: HolderType.mechanic,
            aliases: ["effect:bossBorder", "e:bossBorder"],
            description: "Draws a world border to create a boss arena.",
            fields: {
                radius: {
                    ...fieldTemplates.int,
                    description: "The radius of the border.",
                    default: 32
                }
            }
        },
        terminateProjectile: {
            type: HolderType.mechanic,
            aliases: ["endprojectile", "terminateproj", "endproj", "stopprojectile", "stopproj"],
            description: ""
        },
        jump: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to jump."
        },
        "effect:guardianBeam": {
            type: HolderType.mechanic,
            aliases: ["guardianbeam", "e:guardianbeam", "effect:beam", "e:beam"],
            description: "Draws a guardian beam between the origin and the target."
        },
        metavariableskill: {
            type: HolderType.mechanic,
            aliases: ["variableskill", "vskill"],
            description: "Finds and executes a metaskill."
        },
        "effect:skybox": {
            type: HolderType.mechanic,
            aliases: ["skybox", "e:skybox"],
            description: "Modifies the skybox for the target player."
        },
        volley: {
            type: HolderType.mechanic,
            aliases: ["shootvolley"],
            description: "Fires a volley of projectiles."
        },
        firework: {
            type: HolderType.mechanic,
            aliases: ["fireworks", "effect:firework", "effect:fireworks", "e:firework"],
            description: "Shoots a firework."
        },
        bloodyScreen: {
            type: HolderType.mechanic,
            aliases: ["effect:bloodyScreen", "e:bloodyScreen", "redScreen", "effect:redScreen", "e:redScreen"],
            description: "Causes the player's screen to display the worldborder red vignette, effectively making the screen appear bloody.",
            fields: {
                duration: {
                    ...fieldTemplates.duration,
                    description: "The duration of the effect."
                },
                cancel: {
                    ...fieldTemplates.booleanDefaultFalse,
                    description: "If true, the skill will cancel the effect."
                }
            }
        },
        mount: {
            type: HolderType.mechanic,
            aliases: ["vehicle"],
            description: "Summons a vehicle for the caster."
        },
        shootfireball: {
            type: HolderType.mechanic,
            aliases: ["fireball"],
            description: "Shoots a projectile at the target location."
        },
        barCreate: {
            type: HolderType.mechanic,
            aliases: ["barAdd", "createBar"],
            description: "Creates a custom bossbar display.",
            fields: prefilledFields.barFields
        },
        setai: {
            type: HolderType.mechanic,
            aliases: ["ai"],
            description: "Sets whether the mob utilizes AI (ai=true/false)."
        },
        runaigoalselector: {
            type: HolderType.mechanic,
            aliases: ["aigoal", "aigoals"],
            description: "Modify an AI Goal Selector of the caster."
        },
        sendactionmessage: {
            type: HolderType.mechanic,
            aliases: ["actionmessage", "am"],
            description: "Send an Action Bar message to the target player."
        },
        breakBlock: {
            type: HolderType.mechanic,
            aliases: ["blockBreak"],
            description: "Breaks the block at the target location."
        },
        disguisemodifynew: {
            type: HolderType.mechanic,
            aliases: ["newmodifydisguise"],
            description: "Disguises the target entity."
        },
        pasteSchematic: {
            type: HolderType.mechanic,
            aliases: ["schematicPaste", "fawePaste", "wePaste"],
            description: "Pastes a schematic using Fawe."
        },
        activatespawner: {
            type: HolderType.mechanic,
            aliases: ["as"],
            description: "Activate a Mythic Spawner.",
            fields: {
                spawner: {
                    aliases: ["spawners", 's"'],
                    description: "The spawner to activate.",
                    default: ""
                }
            }
        },
        onKeyPress: {
            type: HolderType.mechanic,
            aliases: ["keyPress", "kp"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is pressed."
        },
        "effect:particles": {
            type: HolderType.mechanic,
            aliases: ["effect:particle", "particles", "particle", "e:particles", "e:particle", "e:p"],
            description: "Plays a particle effect at the target location."
        },
        giveitemfromslot: {
            type: HolderType.mechanic,
            aliases: ["givefromslot"],
            description: "Gives the target an item in the caster's equipment."
        },
        metaskill: {
            type: HolderType.mechanic,
            aliases: ["skill", "meta"],
            description: "Executes a metaskill."
        },
        baseDamage: {
            type: HolderType.mechanic,
            aliases: ["bd", "weaponDamage", "wd"],
            description: "Deals a percent of the mob's damage stat as damage.",
            fields: {
                ...prefilledFields.damagingMechanic,
                multiplier: {
                    ...fieldTemplates.float,
                    aliases: ["m"],
                    description: "The multiplier to apply to the mob's damage stat.",
                    placeholder: 1
                }
            }
        },
        goto: {
            type: HolderType.mechanic,
            aliases: ["pathto", "navigateto"],
            description: "Path to the target location."
        },
        togglesitting: {
            type: HolderType.mechanic,
            aliases: ["sit"],
            description: "Toggles the sitting state of an entity for cats/dogs."
        },
        damage: {
            type: HolderType.mechanic,
            aliases: ["d"],
            description: "Deals damage to the target."
        },
        "effect:flames": {
            type: HolderType.mechanic,
            aliases: ["flames", "e:flames"],
            description: "Creates a flame effect at the target location."
        },
        heal: {
            type: HolderType.mechanic,
            aliases: ["h"],
            description: "Heals the target entity."
        },
        aura: {
            type: HolderType.mechanic,
            aliases: ["buff", "debuff"],
            description: "Applies a generic aura to the target.",
            fields: prefilledFields.auraFields,
            examples: [
                {
                    text: "aura{auraName=Retributing_Light;onTick=RetributingLightDamage;interval=10;duration=240} @self",
                    explanation:
                        "Gives the target (Which in this case is the entity itself) the Retributing_Light aura that lasts 12 seconds. Every 10 ticks (or half a second) it will fire the RetributingLightDamage skill. "
                }
            ]
        },
        message: {
            type: HolderType.mechanic,
            aliases: ["msg", "m"],
            description: "Sends a message to the target entity."
        },
        orbital: {
            type: HolderType.mechanic,
            aliases: ["o"],
            description: "Applies an orbital aura to the target."
        },
        blockphysics: {
            type: HolderType.mechanic,
            aliases: ["bphysics"],
            description: "Force a block physics update at the target location."
        },
        projectile: {
            type: HolderType.mechanic,
            aliases: ["p"],
            description: "Launches a custom projectile at the target."
        },
        fly: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Aura that enables flying on the target entity."
        },
        "effect:sound": {
            type: HolderType.mechanic,
            aliases: ["sound", "s", "e:sound", "e:s"],
            description: "Plays a sound at the target location."
        },
        totem: {
            type: HolderType.mechanic,
            aliases: ["toteme", "t"],
            description: "Creates a static totem projectile at the target."
        },
        takeitem: {
            type: HolderType.mechanic,
            aliases: ["take", "takeitems", "itemtake"],
            description: "Takes an item from the target."
        },
        command: {
            type: HolderType.mechanic,
            aliases: ["cmd"],
            description: "Executes a command."
        },
        chainmissile: {
            type: HolderType.mechanic,
            aliases: ["cmi"],
            description: "Shoots a chaining homing missile at the target."
        },
        dropitem: {
            type: HolderType.mechanic,
            aliases: ["drop", "dropitems", "itemdrop"],
            description: "Drops an item or droptable."
        },
        consume: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Deals damage to the target and heals the caster."
        },
        potionclear: {
            type: HolderType.mechanic,
            aliases: ["clearpotions", "clearpotion"],
            description: "Clears all potion effects on the target entity."
        },
        weather: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Changes the weather."
        },
        doppleganger: {
            type: HolderType.mechanic,
            aliases: ["copyplayer"],
            description: "Disguises the caster as the target entity."
        },
        "effect:spin": {
            type: HolderType.mechanic,
            aliases: ["spin", "e:spin"],
            description: "Forces the target entity to spin."
        },
        "effect:smoke": {
            type: HolderType.mechanic,
            aliases: ["smoke", "e:smoke"],
            description: ""
        },
        giveitemfromtarget: {
            type: HolderType.mechanic,
            aliases: ["givefromtarget", "giveitemsfromtarget", "itemgivefromtarget"],
            description: "Gives the target an item or droptable."
        },
        playBlockFallSound: {
            type: HolderType.mechanic,
            aliases: ["blockFallSound"],
            description: "Plays the target block's fall sound. Requires Paper."
        },
        wolfsit: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets a wolf's sitting state."
        },
        animatearmorstand: {
            type: HolderType.mechanic,
            aliases: ["animateas", "animas"],
            description: "Makes an armor stand assume a pose over a specified time.",
            fields: {
                duration: fieldTemplates.duration,
                smart: {
                    ...fieldTemplates.booleanDefaultTrue,
                    description: "If true, the animation will play smoother."
                },
                ignoreEmpty: {
                    ...fieldTemplates.booleanDefaultTrue,
                    description: "If true, the animation will ignore unspecified slots."
                },
                usedegrees: {
                    ...fieldTemplates.booleanDefaultTrue,
                    description: "If true, the animation will use degrees instead of radians."
                },
                head: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the head's rotation."
                },
                body: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the body's rotation."
                },
                leftarm: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the left arm's rotation."
                },
                rightarm: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the right arm's rotation."
                },
                leftleg: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the left leg's rotation."
                },
                rightleg: {
                    ...fieldTemplates.vector,
                    description: "A vector representing the right leg's rotation."
                }
            }
        },
        variableMath: {
            type: HolderType.mechanic,
            aliases: ["varMath", "mathVariable", "mathVar"],
            description: "Sets a variable to the result of a math equation, where 'x' is the variable's current value."
        },
        "effect:lightning": {
            type: HolderType.mechanic,
            aliases: ["e:lightning"],
            description: "Causes a lightning strike effect at the target location."
        },
        "effect:particletornado": {
            type: HolderType.mechanic,
            aliases: ["particletornado", "e:pt"],
            description: ""
        },
        giveitem: {
            type: HolderType.mechanic,
            aliases: ["give", "giveitems", "itemgive"],
            description: "Gives the target an item or droptable."
        },
        "effect:totemresurrection": {
            type: HolderType.mechanic,
            aliases: ["totemresurrection", "e:totemresurrection", "totemresurrectioneffect", "totemofundying", "e:totemofundying", "totemeffect"],
            description: "Plays a fake totem resurrection effect."
        },
        showentity: {
            type: HolderType.mechanic,
            aliases: ["showplayer"],
            description: ""
        },
        teleportin: {
            type: HolderType.mechanic,
            aliases: ["tpdir", "tpin", "tpi"],
            description: "Teleports the target in a direction."
        },
        settonguetarget: {
            type: HolderType.mechanic,
            aliases: ["tonguetarget"],
            description: "Sets the casting frog's tongue to target the given entity."
        },
        potion: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies a potion effect to the target entity."
        },
        setSkillCooldown: {
            type: HolderType.mechanic,
            aliases: ["skillCooldown", "setskillcd", "skillcd"],
            description: "Sets the cooldown on the given skill for the target."
        },
        recoil: {
            type: HolderType.mechanic,
            aliases: ["effect:recoil", "e:recoil"],
            description: "Causes the player's screen to recoil."
        },
        setpathfindingmalus: {
            type: HolderType.mechanic,
            aliases: ["setmalus", "malus"],
            description: "Sets the pathfinding malus of a mob."
        },
        stun: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies an aura that stuns the target entity."
        },
        swingarm: {
            type: HolderType.mechanic,
            aliases: ["armAnimation"],
            description: "Makes the caster swing their arm."
        },
        prison: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Traps the target entity in blocks."
        },
        setRaiderCanJoinRaid: {
            type: HolderType.mechanic,
            aliases: ["setCanJoinRaid"],
            description: "Sets if the target raider can join a raid or not."
        },
        enderDragonSetPhase: {
            type: HolderType.mechanic,
            aliases: ["setEnderDragonPhase"],
            description: "Generates the EnderDragon portal."
        },
        bonemeal: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies bonemeal to the targeted location.",
            fields: {
                blockface: {
                    ...listTypeField(blockFaces, false, false, "UP"),
                    description: "The block face to apply bonemeal to."
                }
            }
        },
        messagejson: {
            type: HolderType.mechanic,
            aliases: ["jsonmessage", "jmsg", "jm"],
            description: "Sends a JSON-formatted message to the target entity."
        },
        variableUnset: {
            type: HolderType.mechanic,
            aliases: ["varUnset", "unsetVariable", "unsetVar"],
            description: "Unsets a variable."
        },
        shootpotion: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Shoots a splash potion."
        },
        currencyGive: {
            type: HolderType.mechanic,
            aliases: ["giveCurrency"],
            description: "Gives an amount of vault currency."
        },
        onbowshoot: {
            type: HolderType.mechanic,
            aliases: ["onshoot"],
            description: "Applies an aura to the target that triggers a skill when they shoot a bow."
        },
        onattack: {
            type: HolderType.mechanic,
            aliases: ["onhit"],
            description: "Applies an aura to the target that triggers a skill when they damage something."
        },
        "effect:particlebox": {
            type: HolderType.mechanic,
            aliases: ["particlebox", "e:pb", "pb"],
            description: ""
        },
        playAnimation: {
            type: HolderType.mechanic,
            aliases: ["effect:playanimation", "e:playanimation", "playarmanimation"],
            description: "Forces the entity to play an animation."
        },
        auraRemove: {
            type: HolderType.mechanic,
            aliases: ["removeaura", "removebuff", "removedebuff"],
            description: "Removes an aura from the target.",
            fields: {
                aura: {
                    aliases: ["buff", "debuff", "name", "b", "n"],
                    description: 'The aura to remove. If set to "any", all auras will be removed.'
                },
                stacks: {
                    ...fieldTemplates.int,
                    aliases: ["s"],
                    description: `The number of stacks to remove. Defaults to ${maxInt}.`
                }
            }
        },
        OnSwing: {
            type: HolderType.mechanic,
            aliases: ["OnLeftClick"],
            description: ""
        },
        shootshulkerbullet: {
            type: HolderType.mechanic,
            aliases: ["shootshulker"],
            description: "Shoots a shulker bullet at the target entity."
        },
        teleportto: {
            type: HolderType.mechanic,
            aliases: ["tpt", "teleportlocation", "tpl"],
            description: "Teleports the target entity to a location."
        },
        enderDragonSetRespawnPhase: {
            type: HolderType.mechanic,
            aliases: ["setEnderDragonRespawnPhase"],
            description: "Sets the game phase on an EnderDragon."
        },
        "effect:thunderlevel": {
            type: HolderType.mechanic,
            aliases: ["thunderlevel", "e:thunderlevel"],
            description: "Modifies the skybox for the target player."
        },
        currencyTake: {
            type: HolderType.mechanic,
            aliases: ["takeCurrency"],
            description: "Removes an amount of vault currency."
        },
        setleashholder: {
            type: HolderType.mechanic,
            aliases: ["setleasher"],
            description: "Sets an entity to hold the caster's leash."
        },
        pickupitem: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Picks up the target item entity."
        },
        setname: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the casting mob's name."
        },
        "effect:particlewave": {
            type: HolderType.mechanic,
            aliases: ["particlewave", "e:pw"],
            description: ""
        },
        setRaiderPatrolLeader: {
            type: HolderType.mechanic,
            aliases: ["setRaiderLeader"],
            description: "Sets the target raider to patrol the given location."
        },
        setRaiderPatrolBlock: {
            type: HolderType.mechanic,
            aliases: ["setRaiderBlock"],
            description: "Sets the target raider to patrol the given location."
        },
        hologram: {
            type: HolderType.mechanic,
            aliases: ["summonhologram", "holo"],
            description: "Spawns a hologram at a target location."
        },
        hideFromPlayers: {
            type: HolderType.mechanic,
            aliases: ["hideFromPlayer", "hide"],
            description: "Hides the caster from the targeted player(s)."
        },
        onblockbreak: {
            type: HolderType.mechanic,
            aliases: ["onbreakblock"],
            description: "Applies an aura to the target that triggers a skill when they break a block."
        },
        randomskill: {
            type: HolderType.mechanic,
            aliases: ["randommeta"],
            description: "Executes a random metaskill."
        },
        fillChest: {
            type: HolderType.mechanic,
            aliases: ["populateChest", "fillContainer", "populateContainer"],
            description: "Fills a container with loot."
        },
        threat: {
            type: HolderType.mechanic,
            aliases: ["threatchange", "threatmod"],
            description: "Modifies the target entities' threat level."
        },
        velocity: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the velocity on the target entity."
        },
        "effect:particlesphere": {
            type: HolderType.mechanic,
            aliases: ["particlesphere", "e:ps", "ps"],
            description: ""
        },
        healpercent: {
            type: HolderType.mechanic,
            aliases: ["percentheal", "hp"],
            description: "Heals the target entity for a percentage of their health."
        },
        blockUnmask: {
            type: HolderType.mechanic,
            aliases: ["effect:blockUnmask", "e:blockunmask"],
            description: "Unmasks any nearby blocks that have been masked.",
            fields: {
                radius: {
                    ...fieldTemplates.int,
                    aliases: ["r"],
                    description: "The radius to unmask blocks in."
                },
                shape: {
                    ...fieldTemplates.maskShapes,
                    aliases: ["s"],
                    description: "The shape to unmask blocks in."
                }
            }
        },
        setlevel: {
            type: HolderType.mechanic,
            aliases: ["modifylevel"],
            description: "Modifies the castering mob's level."
        },
        "effect:particlering": {
            type: HolderType.mechanic,
            aliases: ["particlering", "e:pr", "pr"],
            description: ""
        },
        shoot: {
            type: HolderType.mechanic,
            aliases: ["shootprojetile"],
            description: "Shoots a projectile at the target location."
        },
        consumeslotitem: {
            type: HolderType.mechanic,
            aliases: ["consumeslot"],
            description: "Removes an amount of the target's item in a specified slot."
        },
        "effect:ender": {
            type: HolderType.mechanic,
            aliases: ["ender", "e:ender"],
            description: "Creates the ender effect at the target location."
        },
        setspeed: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the speed attribute of the target entity."
        },
        shieldbreak: {
            type: HolderType.mechanic,
            aliases: ["disableshield"],
            description: "Breaks the target player's shield block."
        },
        closeInventory: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Closes the target player's inventory."
        },
        OnInteract: {
            type: HolderType.mechanic,
            aliases: ["OnInteract"],
            description: ""
        },
        ejectpassenger: {
            type: HolderType.mechanic,
            aliases: ["eject_passenger"],
            description: "Kicks off any entities using the caster as a vehicle."
        },
        "effect:atom": {
            type: HolderType.mechanic,
            aliases: ["e:atom", "atom"],
            description: ""
        },
        modifyprojectile: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Modifies an attribute of the projectile that executed the mechanic."
        },
        barRemove: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Removes a custom bossbar display.",
            fields: {
                name: {
                    aliases: ["n"],
                    description: "The name of the bossbar to remove.",
                    placeholder: "infobar"
                }
            }
        },
        teleporty: {
            type: HolderType.mechanic,
            aliases: ["tpy"],
            description: "Teleports to the target Y coordinate."
        },
        "effect:smokeswirl": {
            type: HolderType.mechanic,
            aliases: ["smokeswirl", "e:smokeswirl"],
            description: ""
        },
        setrotation: {
            type: HolderType.mechanic,
            aliases: ["setrot"],
            description: "Sets the target's yaw and/or pitch without teleporting it. Does not work on players!."
        },
        onKeyRelease: {
            type: HolderType.mechanic,
            aliases: ["keyRelease", "kr"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is released."
        },
        GoatRam: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the goat to ram the targeted entity."
        },
        chain: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Casts a metaskill that bounces between targets."
        },
        decapitate: {
            type: HolderType.mechanic,
            aliases: ["dropHead"],
            description: "Drops the target entity's head."
        },
        "effect:particleline": {
            type: HolderType.mechanic,
            aliases: ["e:pl", "pl", "particleline"],
            description: ""
        },
        "effect:particleorbital": {
            type: HolderType.mechanic,
            aliases: ["e:particleorbital", "particleorbital", "effect:particlecircle", "particlecircle", "e:particlecricle"],
            description: ""
        },
        playBlockStepSound: {
            type: HolderType.mechanic,
            aliases: ["blockStepSound"],
            description: "Plays the target block's stepping sound. Requires Paper."
        },
        playBlockBreakSound: {
            type: HolderType.mechanic,
            aliases: ["blockBreakSound"],
            description: "Plays the target block's breaking sound. Requires Paper."
        },
        extinguish: {
            type: HolderType.mechanic,
            aliases: ["removefire"],
            description: "Removes fire on the target entity."
        },
        tagadd: {
            type: HolderType.mechanic,
            aliases: ["addtag", "addscoreboardtag"],
            description: "Adds a scoreboard tag to the target entity."
        },
        setTrackedLocation: {
            type: HolderType.mechanic,
            aliases: ["tracklocation", "stl"],
            description: "Sets the mob's tracked location to the targeted location."
        },
        "effect:stopsound": {
            type: HolderType.mechanic,
            aliases: ["stopsound", "e:ss", "ss"],
            description: "Stops a sound from playing for the targeted entity."
        },
        missile: {
            type: HolderType.mechanic,
            aliases: ["mi"],
            description: "Shoots a homing missile at the target."
        },
        disguiseold: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Disguises the target entity."
        },
        modifyscore: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Modifies a scoreboard value."
        },
        "effect:enderbeam": {
            type: HolderType.mechanic,
            aliases: ["enderbeam"],
            description: "Creates an endercrystal beam pointing at the target."
        },
        blockMask: {
            type: HolderType.mechanic,
            aliases: ["effect:blockMask", "e:blockMask"],
            description: "Temporarily masks a block as a different block.",
            fields: {
                material: {
                    ...fieldTemplates.material,
                    aliases: ["mat", "m"]
                },
                radius: {
                    ...fieldTemplates.float,
                    aliases: ["r"],
                    description: "The radius of the mask."
                },
                radiusy: {
                    ...fieldTemplates.float,
                    aliases: ["ry"],
                    description: "The radius of the mask in the Y/vertical axis. Defaults to the radius."
                },
                noise: {
                    ...fieldTemplates.float,
                    aliases: ["n"],
                    description: "The amount of noise to add to the mask."
                },
                duration: {
                    ...fieldTemplates.duration,
                    aliases: ["d"],
                    description: "The duration of the mask in ticks."
                },
                shape: {
                    ...fieldTemplates.maskShapes,
                    aliases: ["s"],
                    description: "The shape of the mask."
                },
                noair: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["na"],
                    description: "If true, the mask will not affect air blocks."
                },
                onlyair: {
                    ...fieldTemplates.booleanDefaultFalse,
                    aliases: ["oa"],
                    description: "If true, the mask will only affect air blocks."
                }
            }
        },
        blockWave: {
            type: HolderType.mechanic,
            aliases: ["effect:blockWave", "e:blockWave"],
            description: "Sends a block flying into the air.",
            fields: {
                velocity: {
                    ...fieldTemplates.float,
                    aliases: ["v"],
                    description: "The velocity in which the block should travel.",
                    default: 0.2
                },
                horizontalvelocity: {
                    ...fieldTemplates.float,
                    aliases: ["velocityh", "vh"],
                    description: "The horizontal velocity in which the block should travel.",
                    default: 0.0
                },
                velocityx: {
                    ...fieldTemplates.float,
                    aliases: ["vx"],
                    description: "Additional X velocity in which the block should travel.",
                    default: 0.0
                },
                velocityy: {
                    ...fieldTemplates.float,
                    aliases: ["vy"],
                    description: "Additional Y velocity in which the block should travel.",
                    default: 0.0
                },
                velocityz: {
                    ...fieldTemplates.float,
                    aliases: ["vz"],
                    description: "Additional Z velocity in which the block should travel.",
                    default: 0.0
                },
                radius: {
                    ...fieldTemplates.float,
                    aliases: ["r"],
                    description: "The radius of the wave.",
                    default: 2
                },
                radiusy: {
                    ...fieldTemplates.float,
                    aliases: ["ry"],
                    description: "The radius of the wave in the Y/vertical axis. Defaults to the radius.",
                    default: 2
                },
                noise: {
                    ...fieldTemplates.float,
                    aliases: ["n"],
                    description: "The amount of noise to add to the wave.",
                    default: 0.0
                },
                duration: {
                    ...fieldTemplates.duration,
                    aliases: ["d"],
                    description: "The duration of the wave in ticks.",
                    default: 15
                },
                ignoreair: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["ia"],
                    description: "If true, the wave will ignore air blocks."
                },
                hidesourceblock: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["hidesource", "hsb", "hs"],
                    description: "If true, the wave will hide the source block when creating the falling block entity."
                },
                shape: {
                    ...fieldTemplates.maskShapes,
                    aliases: ["s"],
                    description: "The shape of the wave."
                },
                material: {
                    ...fieldTemplates.material,
                    aliases: ["m"],
                    description: "The material of the block to create."
                }
            }
        },
        lightning: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Strikes lightning at the target location."
        },
        "effect:glow": {
            type: HolderType.mechanic,
            aliases: ["glow", "e:glow"],
            description: "Makes the taget entity glow. Requires GlowAPI."
        },
        mounttarget: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to mount the target entity."
        },
        playBlockHitSound: {
            type: HolderType.mechanic,
            aliases: ["blockHitSound"],
            description: "Plays the target block's hit sound. Requires Paper."
        },
        blackScreen: {
            type: HolderType.mechanic,
            aliases: ["effect:blackScreen", "e:blackScreen"],
            description: "Causes the player's screen to black out.",
            fields: {
                ...excludeKeys(prefilledFields.auraFields, ["auraname", "maxstacks", "refreshduration", "interval"]),
                duration: {
                    ...fieldTemplates.duration
                },
                cancel: {
                    aliases: ["c"],
                    description: "If true, will cancel any existing effects immediately."
                }
            }
        },
        OnJump: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they jump."
        },
        onblockplace: {
            type: HolderType.mechanic,
            aliases: ["onplaceblock"],
            description: "Applies an aura to the target that triggers a skill when they place a block."
        },
        swap: {
            type: HolderType.mechanic,
            aliases: ["tpswap"],
            description: "Swaps positions with the target entity."
        },
        switch: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Acts as a switch/case."
        },
        "effect:itemspray": {
            type: HolderType.mechanic,
            aliases: ["itemspray", "e:itemspray"],
            description: "Sprays items everywhere."
        },
        feed: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Feeds the target entity."
        },
        blockDestabilize: {
            type: HolderType.mechanic,
            aliases: ["destabilizeBlock", "destabilizeBlocks"],
            description: "Turns a block into a falling block."
        },
        modifytargetscore: {
            type: HolderType.mechanic,
            aliases: ["mts"],
            description: ""
        },
        sendtoast: {
            type: HolderType.mechanic,
            aliases: ["advancementmessage", "advmessage", "toastmessage", "toastmsg"],
            description: "Sends a message to the target player as an advancement."
        },
        suicide: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Kills the caster."
        },
        randommessage: {
            type: HolderType.mechanic,
            aliases: ["randommsg", "rmsg", "rm"],
            description: "Sends a random message to the target player."
        },
        modifyglobalscore: {
            type: HolderType.mechanic,
            aliases: ["mgs"],
            description: ""
        },
        throw: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Throws the target entity."
        },
        removeHeldItem: {
            type: HolderType.mechanic,
            aliases: ["consumeHeldItem", "takeHeldItem"],
            description: "Removes an amount of the target's held item."
        },
        togglelever: {
            type: HolderType.mechanic,
            aliases: ["lever"],
            description: "Toggles a lever at the target location."
        },
        tagremove: {
            type: HolderType.mechanic,
            aliases: ["removetag", "removescoreboardtag"],
            description: "Removes a scoreboard tag from the target entity."
        },
        disguisemodify: {
            type: HolderType.mechanic,
            aliases: ["modifydisguise"],
            description: "Disguises the target entity."
        },
        "effect:geyser": {
            type: HolderType.mechanic,
            aliases: ["geyser", "e:geyser"],
            description: "Creates a geyser at the target location."
        },
        "effect:explosion": {
            type: HolderType.mechanic,
            aliases: ["e:explosion", "effect:explode", "e:explode"],
            description: "Causes an explosion effect at the target location."
        },
        sudoskill: {
            type: HolderType.mechanic,
            aliases: ["sudo"],
            description: "Forces the inherited target to execute the skill at the targeted entity."
        },
        raytraceTo: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Executes a skill with the result of a raytrace to the target location.",
            pluginReqs: [pluginReq.mythicMobsPremium]
        },
        posearmorstand: {
            type: HolderType.mechanic,
            aliases: ["armorstandpose"],
            description: "Poses the target armor stand."
        },
        breakBlockAndGiveItem: {
            type: HolderType.mechanic,
            aliases: ["blockBreakAndGiveItem"],
            description: "Breaks the block at the target location, giving the items to the caster.",
            fields: {
                dodrops: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["drops", "d"],
                    description: "If true, the mechanic will drop items."
                },
                doeffect: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["effect", "e"],
                    description: "If true, the mechanic will play the block break sound/particle effects."
                },
                usetool: {
                    ...fieldTemplates.booleanDefaultTrue,
                    aliases: ["tool", "t"],
                    description: "If true, the mechanic will use the caster's held item to break the block."
                },
                fakelooting: {}
            }
        },
        pull: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Pulls the target entity towards the caster."
        },
        raytrace: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Executes a skill with the result of a raytrace.",
            pluginReqs: [pluginReq.mythicMobsPremium]
        },
        undisguise: {
            type: HolderType.mechanic,
            aliases: ["disguiseRemove"],
            description: "Removes a disguise from the target entity."
        },
        propel: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Propels the caster towards the target."
        },
        oxygen: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Gives the target player oxygen."
        },
        gcd: {
            type: HolderType.mechanic,
            aliases: ["globalcooldown", "setgcd", "setglobalcooldown"],
            description: "Triggers the global cooldown for the caster."
        },
        remount: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to remount their mount."
        },
        teleport: {
            type: HolderType.mechanic,
            aliases: ["tp"],
            description: "Teleports to the target location."
        },
        freeze: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Chills the target entity."
        },
        damagePercent: {
            type: HolderType.mechanic,
            aliases: ["percentDamage"],
            description: "Deals a percentage of the target's health in damage."
        },
        removeowner: {
            type: HolderType.mechanic,
            aliases: ["clearowner"],
            description: ""
        },
        variableSetLocation: {
            type: HolderType.mechanic,
            aliases: ["setVariableLocation", "setVarLoc"],
            description: "Sets a variable to the given location."
        },
        setfaction: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the target mob's faction."
        },
        forcepull: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Teleports the target entity to the caster."
        },
        modifymobscore: {
            type: HolderType.mechanic,
            aliases: ["mms"],
            description: ""
        },
        cancelEvent: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Cancels the calling event."
        },
        look: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Forces the caster to look at the target location."
        },
        threatclear: {
            type: HolderType.mechanic,
            aliases: ["clearthreat"],
            description: "Clears the caster's threat table."
        },
        delay: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Delays the execution of the next mechanic."
        },
        speak: {
            type: HolderType.mechanic,
            aliases: ["speech"],
            description: "Makes the caster speak using chat and speech bubbles."
        },
        cquip: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to cquip an item or droptable."
        },
        rally: {
            type: HolderType.mechanic,
            aliases: ["callforhelp"],
            description: "Calls for nearby entities to attack the target."
        },
        arrowvolley: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Shoots a volley of arrows.",
            fields: {
                amount: {
                    ...fieldTemplates.int,
                    description: "The amount of arrows to shoot.",
                    default: 20
                },
                spread: {
                    ...fieldTemplates.int,
                    description: "How spread out the arrows are.",
                    default: 45
                },
                fireTicks: {
                    ...fieldTemplates.int,
                    description: "How long the arrows should be on fire for.",
                    default: 0
                },
                velocity: {
                    ...fieldTemplates.float,
                    description: "How fast the arrows should travel.",
                    default: 20
                },
                removeDelay: {
                    ...fieldTemplates.int,
                    description: "How long the arrows should last for before they are removed.",
                    placeholder: 200
                }
            }
        },
        setcollidable: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets whether the mob is collidable."
        },
        ignite: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the target entity on fire."
        },
        pushbutton: {
            type: HolderType.mechanic,
            aliases: ["buttonpush"],
            description: "Pushes a button at the target location."
        },
        cast: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Casts a metaskill with various options."
        },
        enderDragonResetCrystals: {
            type: HolderType.mechanic,
            aliases: ["resetEnderResetCrystals"],
            description: "Generates the EnderDragon crystals."
        },
        dismount: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Dismounts the target entity."
        },
        barSet: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the display values on a custom bossbar.",
            fields: prefilledFields.barFields
        },
        leap: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to leap to the target location."
        },
        remove: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Removes the target entity from existence."
        },
        runaitargetselector: {
            type: HolderType.mechanic,
            aliases: ["aitarget"],
            description: "Modify an AI Target Selector of the caster."
        },
        setscore: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets a scoreboard value."
        },
        setgamemode: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Sets the gamemode of the target player."
        },
        disengage: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to leap backwards away from the target entity."
        },
        enderDragonSpawnPortal: {
            type: HolderType.mechanic,
            aliases: ["spawnEnderDragonPortal"],
            description: "Sets the game phase on an EnderDragon."
        },
        setNoDamageTicks: {
            type: HolderType.mechanic,
            aliases: ["setimmunityticks"],
            description: "Sets damage immunity ticks on the target entity."
        },
        mountme: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the ctarget entity to mount the caster."
        },
        bouncy: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies an aura to the target that makes it bouncy.",
            fields: {
                ...prefilledFields.auraFields,
                onbounceskill: {
                    ...fieldTemplates.metaskill,
                    aliases: ["onbounce", "ob"],
                    description: "The skill to execute when the entity bounces."
                },
                cancelevent: {
                    ...fieldTemplates.booleanDefaultFalse,
                    aliases: ["ce", "canceldamage", "cd"],
                    description: "Whether to cancel the event that triggers the aura."
                }
            }
        },
        ondeath: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they die."
        },
        lunge: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to lunge forward at the target."
        },
        disguise: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Disguises the target entity."
        },
        ondamaged: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they take damage."
        },
        equip: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Causes the caster to equip an item or droptable."
        },
        setpitch: {
            type: HolderType.mechanic,
            aliases: [],
            description: "Modifies the head pitch of the target entity."
        }
    },
    [HolderType.targeter]: {
        projectileforward: {
            type: HolderType.targeter,
            aliases: [""],
            description: "Targets a point in front of the casting projectile."
        },
        ringAroundOrigin: {
            type: HolderType.targeter,
            aliases: ["ringOrigin", "RAO"],
            description: "Targets points in a ring around the skill origin."
        },
        forwardwall: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets a plane in front of the caster."
        },
        trackedLocation: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the caster's tracked location."
        },
        locationsOfTargets: {
            type: HolderType.targeter,
            aliases: ["locationOfTarget", "LOT"],
            description: "Targets the location of the inherited targets."
        },
        trigger: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the entity that triggered the skill."
        },
        targetedTarget: {
            type: HolderType.targeter,
            aliases: ["targeted"],
            description: "Targets the inherited targets."
        },
        livingInLine: {
            type: HolderType.targeter,
            aliases: ["entitiesInLine", "livingEntitiesInLine", "LEIL", "EIL"],
            description: "Targets random points in a cone shape."
        },
        selfEyeLocation: {
            type: HolderType.targeter,
            aliases: ["eyeDirection", "casterEyeLocation", "bossEyeLocation", "mobEyeLocation"],
            description: "Targets the location of the caster."
        },
        livingNearTargetLocation: {
            type: HolderType.targeter,
            aliases: ["LNTL", "ENTL", "ENT"],
            description: "Targets entities near the target location."
        },
        blocksinradius: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets all blocks in the radius of the inherited target."
        },
        entitiesNearOrigin: {
            type: HolderType.targeter,
            aliases: ["NearOrigin", "ENO"],
            description: "Targets entities near the origin."
        },
        owner: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the caster's owner."
        },
        randomLocationsNearTargets: {
            type: HolderType.targeter,
            aliases: [
                "randomLocationsNearTarget",
                "randomLocationsNearTargetEntities",
                "randomLocationsNearTargetLocations",
                "RLNT",
                "RLNTE",
                "RLNTL"
            ],
            description: "Targets random locations near the inherited targets."
        },
        randomLocationsNearOrigin: {
            type: HolderType.targeter,
            aliases: ["RLO", "randomLocationsOrigin", "RLNO"],
            description: "Targets random locations near the caster."
        },
        playerByName: {
            type: HolderType.targeter,
            aliases: ["specificplayer"],
            description: "Targets a specific player by name."
        },
        ring: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets points in a ring around the caster."
        },
        itemsInRadius: {
            type: HolderType.targeter,
            aliases: ["IIR"],
            description: "Gets all items in a radius around the caster."
        },
        obstructingBlock: {
            type: HolderType.targeter,
            aliases: [],
            description: "Tries to target blocks in front of the caster that are obstructing it."
        },
        randomThreatTargetLocation: {
            type: HolderType.targeter,
            aliases: ["RTTL"],
            description: "Targets the location of a random entity on the caster's threat table."
        },
        livingInCone: {
            type: HolderType.targeter,
            aliases: ["entitiesInCone", "livingEntitiesInCone", "LEIC", "EIC"],
            description: "Targets random points in a cone shape."
        },
        mount: {
            type: HolderType.targeter,
            aliases: ["vehicle"],
            description: "Targets the caster's mount."
        },
        self: {
            type: HolderType.targeter,
            aliases: ["caster", "boss", "mob"],
            description: "Targets the caster."
        },
        mother: {
            type: HolderType.targeter,
            aliases: ["mommy", "mom"],
            description: ""
        },
        floorOfTargets: {
            type: HolderType.targeter,
            aliases: ["floorsOfTarget", "FOT"],
            description: "Targets the first solid block below the inherited targets."
        },
        children: {
            type: HolderType.targeter,
            aliases: ["child", "summons"],
            description: "Targets any child entities summoned by the caster."
        },
        entitiesInRadius: {
            type: HolderType.targeter,
            aliases: ["livingEntitiesInRadius", "livingInRadius", "allInRadius", "EIR"],
            description: "Targets entities around the caster."
        },
        UniqueIdentifier: {
            type: HolderType.targeter,
            aliases: ["uuid"],
            description: "Targets a specific entity with that uuid."
        },
        origin: {
            type: HolderType.targeter,
            aliases: ["source"],
            description: "Targets the origin of the current skill."
        },
        cone: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets random points in a cone in front of the caster."
        },
        siblings: {
            type: HolderType.targeter,
            aliases: ["sibling", "brothers", "sisters"],
            description: "Targets any child entities summoned by the caster's parent."
        },
        targetedLocation: {
            type: HolderType.targeter,
            aliases: ["targetedLocations", "targetedLoc"],
            description: "Targets the location the caster is targeting."
        },
        selfLocation: {
            type: HolderType.targeter,
            aliases: ["casterLocation", "bossLocation", "mobLocation"],
            description: "Targets the location of the caster."
        },
        notLivingNearOrigin: {
            type: HolderType.targeter,
            aliases: ["NLNO", "nonLivingNearOrigin"],
            description: "Targets non living entities near origin."
        },
        targetBlock: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the block the caster is targeting."
        },
        randomLocationsNearCaster: {
            type: HolderType.targeter,
            aliases: ["RLNC", "randomLocations"],
            description: "Targets random locations near the caster."
        },
        playersInRadius: {
            type: HolderType.targeter,
            aliases: ["PIR"],
            description: "Targets the players in a radius around the caster."
        },
        target: {
            type: HolderType.targeter,
            aliases: ["T"],
            description: "Targets the caster's target."
        },
        variableLocation: {
            type: HolderType.targeter,
            aliases: ["varLocation"],
            description: "Targets the location stored in a variable."
        },
        father: {
            type: HolderType.targeter,
            aliases: ["dad", "daddy"],
            description: ""
        },
        nearestStructure: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the nearest structure."
        },
        parent: {
            type: HolderType.targeter,
            aliases: ["summoner"],
            description: "Targets the caster's parent/summoner."
        },
        playersOnServer: {
            type: HolderType.targeter,
            aliases: ["server"],
            description: "Targets all players on the server."
        },
        targetLocation: {
            type: HolderType.targeter,
            aliases: ["targetLoc", "TL"],
            description: "Targets the location the caster is targeting."
        },
        itemsNearOrigin: {
            type: HolderType.targeter,
            aliases: ["INO"],
            description: "Gets all items in a radius around the origin."
        },
        randomRingPoint: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets random points in a ring around the caster."
        },
        triggerlocation: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the location of the entity that triggered the skill."
        },
        blocksnearorigin: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets all blocks in the radius around the origin."
        },
        entitiesInRing: {
            type: HolderType.targeter,
            aliases: ["EIRR"],
            description: "Targets all entities in a ring."
        },
        spawnLocation: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the caster's spawn location."
        },
        spawners: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets the location of specified mob spawners."
        },
        forward: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets a point in front of the caster."
        },
        line: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets points in a line from the caster to the target location."
        },
        sphere: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets points in a sphere around the caster."
        },
        casterSpawnLocation: {
            type: HolderType.targeter,
            aliases: ["casterSpawn"],
            description: "Targets the caster's spawn location."
        },
        blocksinchunk: {
            type: HolderType.targeter,
            aliases: [],
            description: "Targets all blocks in the targeted chunk."
        },
        a: {
            type: HolderType.targeter,
            aliases: [],
            description: "Vanilla selector that targets all online players."
        },
        r: {
            type: HolderType.targeter,
            aliases: [],
            description: "Vanilla selector that targets a random online player."
        },
        p: {
            type: HolderType.targeter,
            aliases: [],
            description: "Vanilla selector that targets the nearest online player."
        },
        s: {
            type: HolderType.targeter,
            aliases: [],
            description: "Vanilla selector that targets the caster."
        },
        e: {
            type: HolderType.targeter,
            aliases: [],
            description: "Vanilla selector that targets all entities."
        }
    },
    [HolderType.condition]: {
        hasoffhand: {
            type: HolderType.condition,
            aliases: ["offhand"],
            description: "Tests if the target entity has something in offhand."
        },
        onBlock: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches the block the target entity is standing on."
        },
        variableIsSet: {
            type: HolderType.condition,
            aliases: ["varisset", "varset"],
            description: "Checks if the given variable is set."
        },
        itemissimilar: {
            type: HolderType.condition,
            aliases: ["issimilar", "similarto"],
            description: "Checks if the ItemStack is similar."
        },
        playerNotWithin: {
            type: HolderType.condition,
            aliases: ["playersnotwithin"],
            description: "Checks if any players are within a radius of the target."
        },
        bowTension: {
            type: HolderType.condition,
            aliases: ["bowshoottension"],
            description: ""
        },
        dawn: {
            type: HolderType.condition,
            aliases: [],
            description: "If the time is dawn, from 22000 to 2000 in-game time."
        },
        enchantingExperience: {
            type: HolderType.condition,
            aliases: ["enchantingExp", "enchantExperience", "enchantExp"],
            description: "Tests the target's enchanting experience."
        },
        sunny: {
            type: HolderType.condition,
            aliases: ["issunny"],
            description: "If the weather is sunny in the target world."
        },
        notInRegion: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target location is not within the given WorldGuard region."
        },
        owner: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target entity is the owner of the caster."
        },
        variableInRange: {
            type: HolderType.condition,
            aliases: ["varinrange", "varrange"],
            description: "Checks if the given numeric variable is within a certain range."
        },
        thundering: {
            type: HolderType.condition,
            aliases: ["stormy", "isthundering", "isstormy"],
            description: "If it's thundering in the target world."
        },
        samefaction: {
            type: HolderType.condition,
            aliases: ["factionsame"],
            description: "Tests if the target is in the same faction as the caster."
        },
        distance: {
            type: HolderType.condition,
            aliases: [],
            description: "Whether the distance between the caster and target is within the given range."
        },
        size: {
            type: HolderType.condition,
            aliases: ["mobSize"],
            description: "Checks against the entity's size."
        },
        isplayer: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target is a player."
        },
        fieldOfView: {
            type: HolderType.condition,
            aliases: ["infieldofview", "fov"],
            description: "Tests if the target is within the given angle from where the caster is looking."
        },
        worldtime: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches a range against the target location's world's time."
        },
        fallSpeed: {
            type: HolderType.condition,
            aliases: ["fallingspeed"],
            description: "If the fall speed of the target is within the given range."
        },
        premium: {
            type: HolderType.condition,
            aliases: ["ispremium", "iscool"],
            description: "Whether or not premium is enabledd."
        },
        nearClaim: {
            type: HolderType.condition,
            aliases: ["nearClaims"],
            description: "If the target location is near any GriefPrevention claims."
        },
        distanceFromSpawn: {
            type: HolderType.condition,
            aliases: [],
            description: "Whether the distance from the world's spawn point to the target is within the given range."
        },
        hasAI: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if target has AI."
        },
        sprinting: {
            type: HolderType.condition,
            aliases: ["issprinting"],
            description: "Whether or not the target entity is sprinting. Only works on players."
        },
        moving: {
            type: HolderType.condition,
            aliases: ["ismoving"],
            description: "If the target has a velocity greater than zero."
        },
        isClimbing: {
            type: HolderType.condition,
            aliases: ["climbing"],
            description: "If the target is climbing."
        },
        name: {
            type: HolderType.condition,
            aliases: ["castername"],
            description: "Checks against the entity's name."
        },
        crouching: {
            type: HolderType.condition,
            aliases: ["sneaking", "iscrouching", "issneaking"],
            description: "Whether or not the target entity is crouching."
        },
        iscaster: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target is the caster of the skill."
        },
        lastSignal: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches the last signal received by the target mob."
        },
        wearing: {
            type: HolderType.condition,
            aliases: ["iswearing", "wielding", "iswielding"],
            description: "Tests what the target entity has equipped."
        },
        lunarPhase: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the target world's lunar phase."
        },
        variableEquals: {
            type: HolderType.condition,
            aliases: ["variableeq", "varequals", "vareq"],
            description: "Checks if the given variable has a particular value."
        },
        faction: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the target's faction."
        },
        parent: {
            type: HolderType.condition,
            aliases: ["isParent"],
            description: "Checks if the target entity is the parent/summoner of the caster."
        },
        yaw: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the yaw of the target entity against a range."
        },
        mobsinworld: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches a range to how many mobs are in the target world."
        },
        onGround: {
            type: HolderType.condition,
            aliases: ["grounded"],
            description: "If the target entity is standing on solid ground."
        },
        distanceFromTrackedLocation: {
            type: HolderType.condition,
            aliases: ["distanceFromTL"],
            description: "Tests if the caster is within a certain distance of its tracked location."
        },
        hasTag: {
            type: HolderType.condition,
            aliases: ["hasScoreboardTag"],
            description: "Tests if the target has a scoreboard tag."
        },
        playerKills: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches how many players the target mob has killed."
        },
        inblock: {
            type: HolderType.condition,
            aliases: ["insideblock"],
            description: "Checks the material at the target location."
        },
        hasAuraStacks: {
            type: HolderType.condition,
            aliases: ["hasbuffstacks", "hasdebuffstacks", "aurastacks", "buffstacks", "debuffstacks"],
            description: "Tests if the target has the given range of stacks from an aura."
        },
        foodSaturation: {
            type: HolderType.condition,
            aliases: ["hungerSaturation"],
            description: "Matches the target's food saturation level."
        },
        IsLeashed: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target is leashed."
        },
        heightAbove: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target's Y location is above a value."
        },
        stringEquals: {
            type: HolderType.condition,
            aliases: ["stringEq"],
            description: "Checks if value1 equals value2. Both values can use variables and placeholders."
        },
        children: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests how many children the caster has."
        },
        incombat: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target mob is considered in combat."
        },
        foodlevel: {
            type: HolderType.condition,
            aliases: ["hunger", "food", "hungerlevel"],
            description: "Matches the target's food level."
        },
        hasAura: {
            type: HolderType.condition,
            aliases: ["hasbuff", "hasdebuff"],
            description: "Checks if the target entity has the given aura."
        },
        cuboid: {
            type: HolderType.condition,
            aliases: ["incuboid"],
            description: "Whether the target is within the given cuboid between location1 x location2."
        },
        skillOnCooldown: {
            type: HolderType.condition,
            aliases: [],
            description: "Whether the caster has the specified skill on cooldown."
        },
        inClaim: {
            type: HolderType.condition,
            aliases: ["inclaim"],
            description: "If the target location is inside a GriefPrevention claim."
        },
        biometype: {
            type: HolderType.condition,
            aliases: ["biomecategory"],
            description: "Tests if the target is within the given list of biome types."
        },
        isInSurvivalMode: {
            type: HolderType.condition,
            aliases: ["inSurvivalMode"],
            description: "If the target is in survival mode."
        },
        dusk: {
            type: HolderType.condition,
            aliases: [],
            description: "If the time is dusk, from 14000 to 18000 in-game time."
        },
        hasCurrency: {
            type: HolderType.condition,
            aliases: ["hasmoney"],
            description: "If the target has the given amount of vault currency."
        },
        color: {
            type: HolderType.condition,
            aliases: ["clr"],
            description: "Checks for entity's color."
        },
        targetInLineOfSight: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target has line of sight to their target."
        },
        health: {
            type: HolderType.condition,
            aliases: ["hp"],
            description: "Matches the target's health."
        },
        burning: {
            type: HolderType.condition,
            aliases: ["isburning", "isonfire"],
            description: "Whether or not the target entity is on fire."
        },
        targetnotwithin: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target's target is not within a certain distance."
        },
        vehicleisdead: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target's vehicle is dead."
        },
        altitude: {
            type: HolderType.condition,
            aliases: ["heightfromsurface"],
            description: "Tests how far above the ground the target entity is."
        },
        entityMaterialType: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the material type of the target item entity."
        },
        gliding: {
            type: HolderType.condition,
            aliases: ["isgliding"],
            description: "If the target is gliding."
        },
        globalscore: {
            type: HolderType.condition,
            aliases: ["scoreglobal"],
            description: "Checks a global scoreboard value."
        },
        mounted: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target entity is riding a mount/vehicle."
        },
        isRaiderPatrolLeader: {
            type: HolderType.condition,
            aliases: ["isPatrolLeader"],
            description: "Checks if the target entity is the captain of a pillager group."
        },
        isCreeperPrimed: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target creeper is primed to explode."
        },
        score: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks a scoreboard value of the target entity."
        },
        plugin: {
            type: HolderType.condition,
            aliases: ["pluginexists", "hasplugin"],
            description: "Whether or not a specific plugin exists."
        },
        dimension: {
            type: HolderType.condition,
            aliases: ["environment"],
            description: "Tests if the target is within a certain dimension."
        },
        charged: {
            type: HolderType.condition,
            aliases: ["isCharged", "creeperCharged"],
            description: "Whether or not the creeper is charged."
        },
        HasItem: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the inventory for this item."
        },
        targetNotInLineOfSight: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target doesn't have line of sight to their target."
        },
        ydiff: {
            type: HolderType.condition,
            aliases: [],
            description: "Whether the y-difference between the caster and target is within the given range."
        },
        mobsinchunk: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches a range to how many mobs are in the target location's chunk."
        },
        lightLevelfromblocks: {
            type: HolderType.condition,
            aliases: ["blocklightlevel"],
            description: "Tests the light level at the target location."
        },
        haspassenger: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target entity has a passenger."
        },
        haspermission: {
            type: HolderType.condition,
            aliases: ["permission"],
            description: "Tests if the target player has a permission."
        },
        entityitemissimilar: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the item entity is similar to an itemstack."
        },
        inside: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target has a block over their head."
        },
        DamageAmount: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the damage amount that caused the current skill tree. Only works with onDamaged trigger or aura."
        },
        blockType: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the material type present at the target location."
        },
        velocity: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the velocity of the target entity against a range."
        },
        lightLevel: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the light level at the target location."
        },
        lineOfSight: {
            type: HolderType.condition,
            aliases: ["inlineofsight"],
            description: "Tests if the target is within line of sight of the caster."
        },
        ischild: {
            type: HolderType.condition,
            aliases: ["child"],
            description: "If the target is a child of the caster."
        },
        entityType: {
            type: HolderType.condition,
            aliases: ["mobtype"],
            description: "Tests the entity type of the target."
        },
        mythicMobType: {
            type: HolderType.condition,
            aliases: ["mmType"],
            description: "Checks the MythicMob type of the target mob."
        },
        raining: {
            type: HolderType.condition,
            aliases: ["israining"],
            description: "If it's raining in the target world."
        },
        lastDamageCause: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the target's last damage cause."
        },
        level: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the target MythicMob's level."
        },
        region: {
            type: HolderType.condition,
            aliases: ["inregion"],
            description: "If the target is within the given WorldGuard region."
        },
        hasInventorySpace: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target has empty inventory space."
        },
        blocking: {
            type: HolderType.condition,
            aliases: ["isblocking"],
            description: "Tests if the target entity is blocking with a shield."
        },
        biome: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target is within the given list of biomes."
        },
        entityItemType: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the item type of the target item entity."
        },
        playersInRadius: {
            type: HolderType.condition,
            aliases: ["pir", "playerInRadius"],
            description: "Checks for a given number of players within a radius of the target."
        },
        stance: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the stance of the target mob."
        },
        ismonster: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target is a monster."
        },
        outside: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target has open sky above them."
        },
        playerWithin: {
            type: HolderType.condition,
            aliases: ["playerswithin"],
            description: "Checks if any players are within a radius of the target."
        },
        lineOfSightFromOrigin: {
            type: HolderType.condition,
            aliases: ["inlineofsightfromorigin"],
            description: "Tests if the target is within line of sight of the origin."
        },
        enderdragonPhase: {
            type: HolderType.condition,
            aliases: ["edragonPhase"],
            description: "Tests the phase of the target EnderDragon."
        },
        mobsinradius: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches a range to how many mobs are in the given radius."
        },
        hasEnchantment: {
            type: HolderType.condition,
            aliases: ["hasEnchant"],
            description: "Tests if the target entity has an equipped enchantment."
        },
        holding: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target is holding a given material."
        },
        day: {
            type: HolderType.condition,
            aliases: [],
            description: "If the time is day, from 2000 to 10000 in-game time."
        },
        motionx: {
            type: HolderType.condition,
            aliases: ["motx"],
            description: "Checks the X motion of the target entity against a range."
        },
        motiony: {
            type: HolderType.condition,
            aliases: ["moty"],
            description: "Checks the Y motion of the target entity against a range."
        },
        targetWithin: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target's target is within a certain distance."
        },
        motionz: {
            type: HolderType.condition,
            aliases: ["motz"],
            description: "Checks the Z motion of the target entity against a range."
        },
        localdifficulty: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the difficulty scale at the target location."
        },
        night: {
            type: HolderType.condition,
            aliases: [],
            description: "If the time is night, from 14000 to 22000 in-game time."
        },
        hasPotionEffect: {
            type: HolderType.condition,
            aliases: ["hasPotion"],
            description: "Tests if the target entity has a potion effect."
        },
        world: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the name of the target world."
        },
        heightBelow: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target's Y location is below a given value."
        },
        pitch: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the pitch of the target entity is within a range."
        },
        enchantingLevel: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests the target's enchanting level."
        },
        hasgravity: {
            type: HolderType.condition,
            aliases: ["gravity"],
            description: "Tests if the target has gravity."
        },
        hasOwner: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target mob has an owner."
        },
        DamageCause: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks the damage cause of the current skill tree. Only works with onDamaged trigger or aura."
        },
        isFrozen: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target is fully frozen."
        },
        livinginradius: {
            type: HolderType.condition,
            aliases: [],
            description: "Matches a range to how many living entities are in the given radius."
        },
        MythicKeyId: {
            type: HolderType.condition,
            aliases: ["keyid"],
            description: "Tests for the mythic key id that was pressed/released."
        },
        ownerIsOnline: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the owner of the target mob is online, if the owner is a player."
        },
        isNaturalBlock: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target block was naturally generated."
        },
        itemRecharging: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target's weapon is recharging."
        },
        hasParent: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the target mob has a parent."
        },
        isliving: {
            type: HolderType.condition,
            aliases: [],
            description: "If the target is living."
        },
        height: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target's Y location is within a range."
        },
        offGCD: {
            type: HolderType.condition,
            aliases: [],
            description: "Checks if the target mob has an active Global Cooldown."
        },
        targets: {
            type: HolderType.condition,
            aliases: [],
            description: "Tests if the number of inherited targets from the parent skilltree matches the given range."
        }
    },
    [HolderType.trigger]: {}
} satisfies { [key in HolderType]: { [name: string]: HolderData } };
