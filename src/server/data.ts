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
import materialTypes from "./materials.js";
import { Holder, HolderField, LooseString } from "./hoverManager.js";

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
const listTypeField = (list: string[], caseSensitive: boolean = false, array: boolean = false, defaultValue?: string): HolderField => {
    const output: HolderField = {
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
} satisfies { [key: string]: HolderField };

/**
 * A collection of functions that generate a field dynamically from inputs.
 */
const dynamicTemplates = {
    intRange: (min: number, max: number): HolderField => ({
        description: `An integer between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseInt(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    }),
    floatRange: (min: number, max: number): HolderField => ({
        description: `A floating point number between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseFloat(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    })
} satisfies { [key: string]: (...args: any[]) => HolderField };

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
} satisfies { [key: string]: { [fieldName: string]: HolderField } };

export const defaultFields = {
    mechanics: {
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
    conditions: {},
    targeters: {}
} satisfies { mechanics: { [key: string]: HolderField }; conditions: { [key: string]: HolderField }; targeters: { [key: string]: HolderField } };

export const output = {
    mechanics: {
        togglepiston: {
            type: "mechanic",
            aliases: ["piston"],
            description: "Toggles a piston at the target location."
        },
        playBlockPlaceSound: {
            type: "mechanic",
            aliases: ["blockPlaceSound"],
            description: "Plays the target block's placing sound. Requires Paper."
        },
        explosion: {
            type: "mechanic",
            aliases: ["explode"],
            description: "Causes an explosion at the target location."
        },
        disguiseTarget: {
            type: "mechanic",
            aliases: [],
            description: "Disguises the target entity."
        },
        setgravity: {
            type: "mechanic",
            aliases: ["setusegravity"],
            description: "ets whether gravity affects the target entity."
        },
        setmobcolor: {
            type: "mechanic",
            aliases: ["setcolor"],
            description: "Sets the color the target entity. Must be a colorable entity."
        },
        summonAreaEffectCloud: {
            type: "mechanic",
            aliases: ["summonCloud"],
            description: "Summons an Area Effect Cloud."
        },
        bossBorder: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["endprojectile", "terminateproj", "endproj", "stopprojectile", "stopproj"],
            description: ""
        },
        jump: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to jump."
        },
        "effect:guardianBeam": {
            type: "mechanic",
            aliases: ["guardianbeam", "e:guardianbeam", "effect:beam", "e:beam"],
            description: "Draws a guardian beam between the origin and the target."
        },
        metavariableskill: {
            type: "mechanic",
            aliases: ["variableskill", "vskill"],
            description: "Finds and executes a metaskill."
        },
        "effect:skybox": {
            type: "mechanic",
            aliases: ["skybox", "e:skybox"],
            description: "Modifies the skybox for the target player."
        },
        volley: {
            type: "mechanic",
            aliases: ["shootvolley"],
            description: "Fires a volley of projectiles."
        },
        firework: {
            type: "mechanic",
            aliases: ["fireworks", "effect:firework", "effect:fireworks", "e:firework"],
            description: "Shoots a firework."
        },
        bloodyScreen: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["vehicle"],
            description: "Summons a vehicle for the caster."
        },
        shootfireball: {
            type: "mechanic",
            aliases: ["fireball"],
            description: "Shoots a projectile at the target location."
        },
        barCreate: {
            type: "mechanic",
            aliases: ["barAdd", "createBar"],
            description: "Creates a custom bossbar display.",
            fields: prefilledFields.barFields
        },
        setai: {
            type: "mechanic",
            aliases: ["ai"],
            description: "Sets whether the mob utilizes AI (ai=true/false)."
        },
        runaigoalselector: {
            type: "mechanic",
            aliases: ["aigoal", "aigoals"],
            description: "Modify an AI Goal Selector of the caster."
        },
        sendactionmessage: {
            type: "mechanic",
            aliases: ["actionmessage", "am"],
            description: "Send an Action Bar message to the target player."
        },
        breakBlock: {
            type: "mechanic",
            aliases: ["blockBreak"],
            description: "Breaks the block at the target location."
        },
        disguisemodifynew: {
            type: "mechanic",
            aliases: ["newmodifydisguise"],
            description: "Disguises the target entity."
        },
        pasteSchematic: {
            type: "mechanic",
            aliases: ["schematicPaste", "fawePaste", "wePaste"],
            description: "Pastes a schematic using Fawe."
        },
        activatespawner: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["keyPress", "kp"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is pressed."
        },
        "effect:particles": {
            type: "mechanic",
            aliases: ["effect:particle", "particles", "particle", "e:particles", "e:particle", "e:p"],
            description: "Plays a particle effect at the target location."
        },
        giveitemfromslot: {
            type: "mechanic",
            aliases: ["givefromslot"],
            description: "Gives the target an item in the caster's equipment."
        },
        metaskill: {
            type: "mechanic",
            aliases: ["skill", "meta"],
            description: "Executes a metaskill."
        },
        baseDamage: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["pathto", "navigateto"],
            description: "Path to the target location."
        },
        togglesitting: {
            type: "mechanic",
            aliases: ["sit"],
            description: "Toggles the sitting state of an entity for cats/dogs."
        },
        damage: {
            type: "mechanic",
            aliases: ["d"],
            description: "Deals damage to the target."
        },
        "effect:flames": {
            type: "mechanic",
            aliases: ["flames", "e:flames"],
            description: "Creates a flame effect at the target location."
        },
        heal: {
            type: "mechanic",
            aliases: ["h"],
            description: "Heals the target entity."
        },
        aura: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["msg", "m"],
            description: "Sends a message to the target entity."
        },
        orbital: {
            type: "mechanic",
            aliases: ["o"],
            description: "Applies an orbital aura to the target."
        },
        blockphysics: {
            type: "mechanic",
            aliases: ["bphysics"],
            description: "Force a block physics update at the target location."
        },
        projectile: {
            type: "mechanic",
            aliases: ["p"],
            description: "Launches a custom projectile at the target."
        },
        fly: {
            type: "mechanic",
            aliases: [],
            description: "Aura that enables flying on the target entity."
        },
        "effect:sound": {
            type: "mechanic",
            aliases: ["sound", "s", "e:sound", "e:s"],
            description: "Plays a sound at the target location."
        },
        totem: {
            type: "mechanic",
            aliases: ["toteme", "t"],
            description: "Creates a static totem projectile at the target."
        },
        takeitem: {
            type: "mechanic",
            aliases: ["take", "takeitems", "itemtake"],
            description: "Takes an item from the target."
        },
        command: {
            type: "mechanic",
            aliases: ["cmd"],
            description: "Executes a command."
        },
        chainmissile: {
            type: "mechanic",
            aliases: ["cmi"],
            description: "Shoots a chaining homing missile at the target."
        },
        dropitem: {
            type: "mechanic",
            aliases: ["drop", "dropitems", "itemdrop"],
            description: "Drops an item or droptable."
        },
        consume: {
            type: "mechanic",
            aliases: [],
            description: "Deals damage to the target and heals the caster."
        },
        potionclear: {
            type: "mechanic",
            aliases: ["clearpotions", "clearpotion"],
            description: "Clears all potion effects on the target entity."
        },
        weather: {
            type: "mechanic",
            aliases: [],
            description: "Changes the weather."
        },
        doppleganger: {
            type: "mechanic",
            aliases: ["copyplayer"],
            description: "Disguises the caster as the target entity."
        },
        "effect:spin": {
            type: "mechanic",
            aliases: ["spin", "e:spin"],
            description: "Forces the target entity to spin."
        },
        "effect:smoke": {
            type: "mechanic",
            aliases: ["smoke", "e:smoke"],
            description: ""
        },
        giveitemfromtarget: {
            type: "mechanic",
            aliases: ["givefromtarget", "giveitemsfromtarget", "itemgivefromtarget"],
            description: "Gives the target an item or droptable."
        },
        playBlockFallSound: {
            type: "mechanic",
            aliases: ["blockFallSound"],
            description: "Plays the target block's fall sound. Requires Paper."
        },
        wolfsit: {
            type: "mechanic",
            aliases: [],
            description: "Sets a wolf's sitting state."
        },
        animatearmorstand: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["varMath", "mathVariable", "mathVar"],
            description: "Sets a variable to the result of a math equation, where 'x' is the variable's current value."
        },
        "effect:lightning": {
            type: "mechanic",
            aliases: ["e:lightning"],
            description: "Causes a lightning strike effect at the target location."
        },
        "effect:particletornado": {
            type: "mechanic",
            aliases: ["particletornado", "e:pt"],
            description: ""
        },
        giveitem: {
            type: "mechanic",
            aliases: ["give", "giveitems", "itemgive"],
            description: "Gives the target an item or droptable."
        },
        "effect:totemresurrection": {
            type: "mechanic",
            aliases: ["totemresurrection", "e:totemresurrection", "totemresurrectioneffect", "totemofundying", "e:totemofundying", "totemeffect"],
            description: "Plays a fake totem resurrection effect."
        },
        showentity: {
            type: "mechanic",
            aliases: ["showplayer"],
            description: ""
        },
        teleportin: {
            type: "mechanic",
            aliases: ["tpdir", "tpin", "tpi"],
            description: "Teleports the target in a direction."
        },
        settonguetarget: {
            type: "mechanic",
            aliases: ["tonguetarget"],
            description: "Sets the casting frog's tongue to target the given entity."
        },
        potion: {
            type: "mechanic",
            aliases: [],
            description: "Applies a potion effect to the target entity."
        },
        setSkillCooldown: {
            type: "mechanic",
            aliases: ["skillCooldown", "setskillcd", "skillcd"],
            description: "Sets the cooldown on the given skill for the target."
        },
        recoil: {
            type: "mechanic",
            aliases: ["effect:recoil", "e:recoil"],
            description: "Causes the player's screen to recoil."
        },
        setpathfindingmalus: {
            type: "mechanic",
            aliases: ["setmalus", "malus"],
            description: "Sets the pathfinding malus of a mob."
        },
        stun: {
            type: "mechanic",
            aliases: [],
            description: "Applies an aura that stuns the target entity."
        },
        swingarm: {
            type: "mechanic",
            aliases: ["armAnimation"],
            description: "Makes the caster swing their arm."
        },
        prison: {
            type: "mechanic",
            aliases: [],
            description: "Traps the target entity in blocks."
        },
        setRaiderCanJoinRaid: {
            type: "mechanic",
            aliases: ["setCanJoinRaid"],
            description: "Sets if the target raider can join a raid or not."
        },
        enderDragonSetPhase: {
            type: "mechanic",
            aliases: ["setEnderDragonPhase"],
            description: "Generates the EnderDragon portal."
        },
        bonemeal: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["jsonmessage", "jmsg", "jm"],
            description: "Sends a JSON-formatted message to the target entity."
        },
        variableUnset: {
            type: "mechanic",
            aliases: ["varUnset", "unsetVariable", "unsetVar"],
            description: "Unsets a variable."
        },
        shootpotion: {
            type: "mechanic",
            aliases: [],
            description: "Shoots a splash potion."
        },
        currencyGive: {
            type: "mechanic",
            aliases: ["giveCurrency"],
            description: "Gives an amount of vault currency."
        },
        onbowshoot: {
            type: "mechanic",
            aliases: ["onshoot"],
            description: "Applies an aura to the target that triggers a skill when they shoot a bow."
        },
        onattack: {
            type: "mechanic",
            aliases: ["onhit"],
            description: "Applies an aura to the target that triggers a skill when they damage something."
        },
        "effect:particlebox": {
            type: "mechanic",
            aliases: ["particlebox", "e:pb", "pb"],
            description: ""
        },
        playAnimation: {
            type: "mechanic",
            aliases: ["effect:playanimation", "e:playanimation", "playarmanimation"],
            description: "Forces the entity to play an animation."
        },
        auraRemove: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["OnLeftClick"],
            description: ""
        },
        shootshulkerbullet: {
            type: "mechanic",
            aliases: ["shootshulker"],
            description: "Shoots a shulker bullet at the target entity."
        },
        teleportto: {
            type: "mechanic",
            aliases: ["tpt", "teleportlocation", "tpl"],
            description: "Teleports the target entity to a location."
        },
        enderDragonSetRespawnPhase: {
            type: "mechanic",
            aliases: ["setEnderDragonRespawnPhase"],
            description: "Sets the game phase on an EnderDragon."
        },
        "effect:thunderlevel": {
            type: "mechanic",
            aliases: ["thunderlevel", "e:thunderlevel"],
            description: "Modifies the skybox for the target player."
        },
        currencyTake: {
            type: "mechanic",
            aliases: ["takeCurrency"],
            description: "Removes an amount of vault currency."
        },
        setleashholder: {
            type: "mechanic",
            aliases: ["setleasher"],
            description: "Sets an entity to hold the caster's leash."
        },
        pickupitem: {
            type: "mechanic",
            aliases: [],
            description: "Picks up the target item entity."
        },
        setname: {
            type: "mechanic",
            aliases: [],
            description: "Sets the casting mob's name."
        },
        "effect:particlewave": {
            type: "mechanic",
            aliases: ["particlewave", "e:pw"],
            description: ""
        },
        setRaiderPatrolLeader: {
            type: "mechanic",
            aliases: ["setRaiderLeader"],
            description: "Sets the target raider to patrol the given location."
        },
        setRaiderPatrolBlock: {
            type: "mechanic",
            aliases: ["setRaiderBlock"],
            description: "Sets the target raider to patrol the given location."
        },
        hologram: {
            type: "mechanic",
            aliases: ["summonhologram", "holo"],
            description: "Spawns a hologram at a target location."
        },
        hideFromPlayers: {
            type: "mechanic",
            aliases: ["hideFromPlayer", "hide"],
            description: "Hides the caster from the targeted player(s)."
        },
        onblockbreak: {
            type: "mechanic",
            aliases: ["onbreakblock"],
            description: "Applies an aura to the target that triggers a skill when they break a block."
        },
        randomskill: {
            type: "mechanic",
            aliases: ["randommeta"],
            description: "Executes a random metaskill."
        },
        fillChest: {
            type: "mechanic",
            aliases: ["populateChest", "fillContainer", "populateContainer"],
            description: "Fills a container with loot."
        },
        threat: {
            type: "mechanic",
            aliases: ["threatchange", "threatmod"],
            description: "Modifies the target entities' threat level."
        },
        velocity: {
            type: "mechanic",
            aliases: [],
            description: "Sets the velocity on the target entity."
        },
        "effect:particlesphere": {
            type: "mechanic",
            aliases: ["particlesphere", "e:ps", "ps"],
            description: ""
        },
        healpercent: {
            type: "mechanic",
            aliases: ["percentheal", "hp"],
            description: "Heals the target entity for a percentage of their health."
        },
        blockUnmask: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["modifylevel"],
            description: "Modifies the castering mob's level."
        },
        "effect:particlering": {
            type: "mechanic",
            aliases: ["particlering", "e:pr", "pr"],
            description: ""
        },
        shoot: {
            type: "mechanic",
            aliases: ["shootprojetile"],
            description: "Shoots a projectile at the target location."
        },
        consumeslotitem: {
            type: "mechanic",
            aliases: ["consumeslot"],
            description: "Removes an amount of the target's item in a specified slot."
        },
        "effect:ender": {
            type: "mechanic",
            aliases: ["ender", "e:ender"],
            description: "Creates the ender effect at the target location."
        },
        setspeed: {
            type: "mechanic",
            aliases: [],
            description: "Sets the speed attribute of the target entity."
        },
        shieldbreak: {
            type: "mechanic",
            aliases: ["disableshield"],
            description: "Breaks the target player's shield block."
        },
        closeInventory: {
            type: "mechanic",
            aliases: [],
            description: "Closes the target player's inventory."
        },
        OnInteract: {
            type: "mechanic",
            aliases: ["OnInteract"],
            description: ""
        },
        ejectpassenger: {
            type: "mechanic",
            aliases: ["eject_passenger"],
            description: "Kicks off any entities using the caster as a vehicle."
        },
        "effect:atom": {
            type: "mechanic",
            aliases: ["e:atom", "atom"],
            description: ""
        },
        modifyprojectile: {
            type: "mechanic",
            aliases: [],
            description: "Modifies an attribute of the projectile that executed the mechanic."
        },
        barRemove: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: ["tpy"],
            description: "Teleports to the target Y coordinate."
        },
        "effect:smokeswirl": {
            type: "mechanic",
            aliases: ["smokeswirl", "e:smokeswirl"],
            description: ""
        },
        setrotation: {
            type: "mechanic",
            aliases: ["setrot"],
            description: "Sets the target's yaw and/or pitch without teleporting it. Does not work on players!."
        },
        onKeyRelease: {
            type: "mechanic",
            aliases: ["keyRelease", "kr"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is released."
        },
        GoatRam: {
            type: "mechanic",
            aliases: [],
            description: "Causes the goat to ram the targeted entity."
        },
        chain: {
            type: "mechanic",
            aliases: [],
            description: "Casts a metaskill that bounces between targets."
        },
        decapitate: {
            type: "mechanic",
            aliases: ["dropHead"],
            description: "Drops the target entity's head."
        },
        "effect:particleline": {
            type: "mechanic",
            aliases: ["e:pl", "pl", "particleline"],
            description: ""
        },
        "effect:particleorbital": {
            type: "mechanic",
            aliases: ["e:particleorbital", "particleorbital", "effect:particlecircle", "particlecircle", "e:particlecricle"],
            description: ""
        },
        playBlockStepSound: {
            type: "mechanic",
            aliases: ["blockStepSound"],
            description: "Plays the target block's stepping sound. Requires Paper."
        },
        playBlockBreakSound: {
            type: "mechanic",
            aliases: ["blockBreakSound"],
            description: "Plays the target block's breaking sound. Requires Paper."
        },
        extinguish: {
            type: "mechanic",
            aliases: ["removefire"],
            description: "Removes fire on the target entity."
        },
        tagadd: {
            type: "mechanic",
            aliases: ["addtag", "addscoreboardtag"],
            description: "Adds a scoreboard tag to the target entity."
        },
        setTrackedLocation: {
            type: "mechanic",
            aliases: ["tracklocation", "stl"],
            description: "Sets the mob's tracked location to the targeted location."
        },
        "effect:stopsound": {
            type: "mechanic",
            aliases: ["stopsound", "e:ss", "ss"],
            description: "Stops a sound from playing for the targeted entity."
        },
        missile: {
            type: "mechanic",
            aliases: ["mi"],
            description: "Shoots a homing missile at the target."
        },
        disguiseold: {
            type: "mechanic",
            aliases: [],
            description: "Disguises the target entity."
        },
        modifyscore: {
            type: "mechanic",
            aliases: [],
            description: "Modifies a scoreboard value."
        },
        "effect:enderbeam": {
            type: "mechanic",
            aliases: ["enderbeam"],
            description: "Creates an endercrystal beam pointing at the target."
        },
        blockMask: {
            type: "mechanic",
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
            type: "mechanic",
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
            type: "mechanic",
            aliases: [],
            description: "Strikes lightning at the target location."
        },
        "effect:glow": {
            type: "mechanic",
            aliases: ["glow", "e:glow"],
            description: "Makes the taget entity glow. Requires GlowAPI."
        },
        mounttarget: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to mount the target entity."
        },
        playBlockHitSound: {
            type: "mechanic",
            aliases: ["blockHitSound"],
            description: "Plays the target block's hit sound. Requires Paper."
        },
        blackScreen: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they jump."
        },
        onblockplace: {
            type: "mechanic",
            aliases: ["onplaceblock"],
            description: "Applies an aura to the target that triggers a skill when they place a block."
        },
        swap: {
            type: "mechanic",
            aliases: ["tpswap"],
            description: "Swaps positions with the target entity."
        },
        switch: {
            type: "mechanic",
            aliases: [],
            description: "Acts as a switch/case."
        },
        "effect:itemspray": {
            type: "mechanic",
            aliases: ["itemspray", "e:itemspray"],
            description: "Sprays items everywhere."
        },
        feed: {
            type: "mechanic",
            aliases: [],
            description: "Feeds the target entity."
        },
        blockDestabilize: {
            type: "mechanic",
            aliases: ["destabilizeBlock", "destabilizeBlocks"],
            description: "Turns a block into a falling block."
        },
        modifytargetscore: {
            type: "mechanic",
            aliases: ["mts"],
            description: ""
        },
        sendtoast: {
            type: "mechanic",
            aliases: ["advancementmessage", "advmessage", "toastmessage", "toastmsg"],
            description: "Sends a message to the target player as an advancement."
        },
        suicide: {
            type: "mechanic",
            aliases: [],
            description: "Kills the caster."
        },
        randommessage: {
            type: "mechanic",
            aliases: ["randommsg", "rmsg", "rm"],
            description: "Sends a random message to the target player."
        },
        modifyglobalscore: {
            type: "mechanic",
            aliases: ["mgs"],
            description: ""
        },
        throw: {
            type: "mechanic",
            aliases: [],
            description: "Throws the target entity."
        },
        removeHeldItem: {
            type: "mechanic",
            aliases: ["consumeHeldItem", "takeHeldItem"],
            description: "Removes an amount of the target's held item."
        },
        togglelever: {
            type: "mechanic",
            aliases: ["lever"],
            description: "Toggles a lever at the target location."
        },
        tagremove: {
            type: "mechanic",
            aliases: ["removetag", "removescoreboardtag"],
            description: "Removes a scoreboard tag from the target entity."
        },
        disguisemodify: {
            type: "mechanic",
            aliases: ["modifydisguise"],
            description: "Disguises the target entity."
        },
        "effect:geyser": {
            type: "mechanic",
            aliases: ["geyser", "e:geyser"],
            description: "Creates a geyser at the target location."
        },
        "effect:explosion": {
            type: "mechanic",
            aliases: ["e:explosion", "effect:explode", "e:explode"],
            description: "Causes an explosion effect at the target location."
        },
        sudoskill: {
            type: "mechanic",
            aliases: ["sudo"],
            description: "Forces the inherited target to execute the skill at the targeted entity."
        },
        raytraceTo: {
            type: "mechanic",
            aliases: [],
            description: "Executes a skill with the result of a raytrace to the target location.",
            pluginReqs: [pluginReq.mythicMobsPremium]
        },
        posearmorstand: {
            type: "mechanic",
            aliases: ["armorstandpose"],
            description: "Poses the target armor stand."
        },
        breakBlockAndGiveItem: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: [],
            description: "Pulls the target entity towards the caster."
        },
        raytrace: {
            type: "mechanic",
            aliases: [],
            description: "Executes a skill with the result of a raytrace.",
            pluginReqs: [pluginReq.mythicMobsPremium]
        },
        undisguise: {
            type: "mechanic",
            aliases: ["disguiseRemove"],
            description: "Removes a disguise from the target entity."
        },
        propel: {
            type: "mechanic",
            aliases: [],
            description: "Propels the caster towards the target."
        },
        oxygen: {
            type: "mechanic",
            aliases: [],
            description: "Gives the target player oxygen."
        },
        gcd: {
            type: "mechanic",
            aliases: ["globalcooldown", "setgcd", "setglobalcooldown"],
            description: "Triggers the global cooldown for the caster."
        },
        remount: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to remount their mount."
        },
        teleport: {
            type: "mechanic",
            aliases: ["tp"],
            description: "Teleports to the target location."
        },
        freeze: {
            type: "mechanic",
            aliases: [],
            description: "Chills the target entity."
        },
        damagePercent: {
            type: "mechanic",
            aliases: ["percentDamage"],
            description: "Deals a percentage of the target's health in damage."
        },
        removeowner: {
            type: "mechanic",
            aliases: ["clearowner"],
            description: ""
        },
        variableSetLocation: {
            type: "mechanic",
            aliases: ["setVariableLocation", "setVarLoc"],
            description: "Sets a variable to the given location."
        },
        setfaction: {
            type: "mechanic",
            aliases: [],
            description: "Sets the target mob's faction."
        },
        forcepull: {
            type: "mechanic",
            aliases: [],
            description: "Teleports the target entity to the caster."
        },
        modifymobscore: {
            type: "mechanic",
            aliases: ["mms"],
            description: ""
        },
        cancelEvent: {
            type: "mechanic",
            aliases: [],
            description: "Cancels the calling event."
        },
        look: {
            type: "mechanic",
            aliases: [],
            description: "Forces the caster to look at the target location."
        },
        threatclear: {
            type: "mechanic",
            aliases: ["clearthreat"],
            description: "Clears the caster's threat table."
        },
        delay: {
            type: "mechanic",
            aliases: [],
            description: "Delays the execution of the next mechanic."
        },
        speak: {
            type: "mechanic",
            aliases: ["speech"],
            description: "Makes the caster speak using chat and speech bubbles."
        },
        cquip: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to cquip an item or droptable."
        },
        rally: {
            type: "mechanic",
            aliases: ["callforhelp"],
            description: "Calls for nearby entities to attack the target."
        },
        arrowvolley: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: [],
            description: "Sets whether the mob is collidable."
        },
        ignite: {
            type: "mechanic",
            aliases: [],
            description: "Sets the target entity on fire."
        },
        pushbutton: {
            type: "mechanic",
            aliases: ["buttonpush"],
            description: "Pushes a button at the target location."
        },
        cast: {
            type: "mechanic",
            aliases: [],
            description: "Casts a metaskill with various options."
        },
        enderDragonResetCrystals: {
            type: "mechanic",
            aliases: ["resetEnderResetCrystals"],
            description: "Generates the EnderDragon crystals."
        },
        dismount: {
            type: "mechanic",
            aliases: [],
            description: "Dismounts the target entity."
        },
        barSet: {
            type: "mechanic",
            aliases: [],
            description: "Sets the display values on a custom bossbar.",
            fields: prefilledFields.barFields
        },
        leap: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to leap to the target location."
        },
        remove: {
            type: "mechanic",
            aliases: [],
            description: "Removes the target entity from existence."
        },
        runaitargetselector: {
            type: "mechanic",
            aliases: ["aitarget"],
            description: "Modify an AI Target Selector of the caster."
        },
        setscore: {
            type: "mechanic",
            aliases: [],
            description: "Sets a scoreboard value."
        },
        setgamemode: {
            type: "mechanic",
            aliases: [],
            description: "Sets the gamemode of the target player."
        },
        disengage: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to leap backwards away from the target entity."
        },
        enderDragonSpawnPortal: {
            type: "mechanic",
            aliases: ["spawnEnderDragonPortal"],
            description: "Sets the game phase on an EnderDragon."
        },
        setNoDamageTicks: {
            type: "mechanic",
            aliases: ["setimmunityticks"],
            description: "Sets damage immunity ticks on the target entity."
        },
        mountme: {
            type: "mechanic",
            aliases: [],
            description: "Causes the ctarget entity to mount the caster."
        },
        bouncy: {
            type: "mechanic",
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
            type: "mechanic",
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they die."
        },
        lunge: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to lunge forward at the target."
        },
        disguise: {
            type: "mechanic",
            aliases: [],
            description: "Disguises the target entity."
        },
        ondamaged: {
            type: "mechanic",
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they take damage."
        },
        equip: {
            type: "mechanic",
            aliases: [],
            description: "Causes the caster to equip an item or droptable."
        },
        setpitch: {
            type: "mechanic",
            aliases: [],
            description: "Modifies the head pitch of the target entity."
        }
    },
    targeters: {
        projectileforward: {
            type: "targeter",
            aliases: [""],
            description: "Targets a point in front of the casting projectile."
        },
        ringAroundOrigin: {
            type: "targeter",
            aliases: ["ringOrigin", "RAO"],
            description: "Targets points in a ring around the skill origin."
        },
        forwardwall: {
            type: "targeter",
            aliases: [],
            description: "Targets a plane in front of the caster."
        },
        trackedLocation: {
            type: "targeter",
            aliases: [],
            description: "Targets the caster's tracked location."
        },
        locationsOfTargets: {
            type: "targeter",
            aliases: ["locationOfTarget", "LOT"],
            description: "Targets the location of the inherited targets."
        },
        trigger: {
            type: "targeter",
            aliases: [],
            description: "Targets the entity that triggered the skill."
        },
        targetedTarget: {
            type: "targeter",
            aliases: ["targeted"],
            description: "Targets the inherited targets."
        },
        livingInLine: {
            type: "targeter",
            aliases: ["entitiesInLine", "livingEntitiesInLine", "LEIL", "EIL"],
            description: "Targets random points in a cone shape."
        },
        selfEyeLocation: {
            type: "targeter",
            aliases: ["eyeDirection", "casterEyeLocation", "bossEyeLocation", "mobEyeLocation"],
            description: "Targets the location of the caster."
        },
        livingNearTargetLocation: {
            type: "targeter",
            aliases: ["LNTL", "ENTL", "ENT"],
            description: "Targets entities near the target location."
        },
        blocksinradius: {
            type: "targeter",
            aliases: [],
            description: "Targets all blocks in the radius of the inherited target."
        },
        entitiesNearOrigin: {
            type: "targeter",
            aliases: ["NearOrigin", "ENO"],
            description: "Targets entities near the origin."
        },
        owner: {
            type: "targeter",
            aliases: [],
            description: "Targets the caster's owner."
        },
        randomLocationsNearTargets: {
            type: "targeter",
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
            type: "targeter",
            aliases: ["RLO", "randomLocationsOrigin", "RLNO"],
            description: "Targets random locations near the caster."
        },
        playerByName: {
            type: "targeter",
            aliases: ["specificplayer"],
            description: "Targets a specific player by name."
        },
        ring: {
            type: "targeter",
            aliases: [],
            description: "Targets points in a ring around the caster."
        },
        itemsInRadius: {
            type: "targeter",
            aliases: ["IIR"],
            description: "Gets all items in a radius around the caster."
        },
        obstructingBlock: {
            type: "targeter",
            aliases: [],
            description: "Tries to target blocks in front of the caster that are obstructing it."
        },
        randomThreatTargetLocation: {
            type: "targeter",
            aliases: ["RTTL"],
            description: "Targets the location of a random entity on the caster's threat table."
        },
        livingInCone: {
            type: "targeter",
            aliases: ["entitiesInCone", "livingEntitiesInCone", "LEIC", "EIC"],
            description: "Targets random points in a cone shape."
        },
        mount: {
            type: "targeter",
            aliases: ["vehicle"],
            description: "Targets the caster's mount."
        },
        self: {
            type: "targeter",
            aliases: ["caster", "boss", "mob"],
            description: "Targets the caster."
        },
        mother: {
            type: "targeter",
            aliases: ["mommy", "mom"],
            description: ""
        },
        floorOfTargets: {
            type: "targeter",
            aliases: ["floorsOfTarget", "FOT"],
            description: "Targets the first solid block below the inherited targets."
        },
        children: {
            type: "targeter",
            aliases: ["child", "summons"],
            description: "Targets any child entities summoned by the caster."
        },
        entitiesInRadius: {
            type: "targeter",
            aliases: ["livingEntitiesInRadius", "livingInRadius", "allInRadius", "EIR"],
            description: "Targets entities around the caster."
        },
        UniqueIdentifier: {
            type: "targeter",
            aliases: ["uuid"],
            description: "Targets a specific entity with that uuid."
        },
        origin: {
            type: "targeter",
            aliases: ["source"],
            description: "Targets the origin of the current skill."
        },
        cone: {
            type: "targeter",
            aliases: [],
            description: "Targets random points in a cone in front of the caster."
        },
        siblings: {
            type: "targeter",
            aliases: ["sibling", "brothers", "sisters"],
            description: "Targets any child entities summoned by the caster's parent."
        },
        targetedLocation: {
            type: "targeter",
            aliases: ["targetedLocations", "targetedLoc"],
            description: "Targets the location the caster is targeting."
        },
        selfLocation: {
            type: "targeter",
            aliases: ["casterLocation", "bossLocation", "mobLocation"],
            description: "Targets the location of the caster."
        },
        notLivingNearOrigin: {
            type: "targeter",
            aliases: ["NLNO", "nonLivingNearOrigin"],
            description: "Targets non living entities near origin."
        },
        targetBlock: {
            type: "targeter",
            aliases: [],
            description: "Targets the block the caster is targeting."
        },
        randomLocationsNearCaster: {
            type: "targeter",
            aliases: ["RLNC", "randomLocations"],
            description: "Targets random locations near the caster."
        },
        playersInRadius: {
            type: "targeter",
            aliases: ["PIR"],
            description: "Targets the players in a radius around the caster."
        },
        target: {
            type: "targeter",
            aliases: ["T"],
            description: "Targets the caster's target."
        },
        variableLocation: {
            type: "targeter",
            aliases: ["varLocation"],
            description: "Targets the location stored in a variable."
        },
        father: {
            type: "targeter",
            aliases: ["dad", "daddy"],
            description: ""
        },
        nearestStructure: {
            type: "targeter",
            aliases: [],
            description: "Targets the nearest structure."
        },
        parent: {
            type: "targeter",
            aliases: ["summoner"],
            description: "Targets the caster's parent/summoner."
        },
        playersOnServer: {
            type: "targeter",
            aliases: ["server"],
            description: "Targets all players on the server."
        },
        targetLocation: {
            type: "targeter",
            aliases: ["targetLoc", "TL"],
            description: "Targets the location the caster is targeting."
        },
        itemsNearOrigin: {
            type: "targeter",
            aliases: ["INO"],
            description: "Gets all items in a radius around the origin."
        },
        randomRingPoint: {
            type: "targeter",
            aliases: [],
            description: "Targets random points in a ring around the caster."
        },
        triggerlocation: {
            type: "targeter",
            aliases: [],
            description: "Targets the location of the entity that triggered the skill."
        },
        blocksnearorigin: {
            type: "targeter",
            aliases: [],
            description: "Targets all blocks in the radius around the origin."
        },
        entitiesInRing: {
            type: "targeter",
            aliases: ["EIRR"],
            description: "Targets all entities in a ring."
        },
        spawnLocation: {
            type: "targeter",
            aliases: [],
            description: "Targets the caster's spawn location."
        },
        spawners: {
            type: "targeter",
            aliases: [],
            description: "Targets the location of specified mob spawners."
        },
        forward: {
            type: "targeter",
            aliases: [],
            description: "Targets a point in front of the caster."
        },
        line: {
            type: "targeter",
            aliases: [],
            description: "Targets points in a line from the caster to the target location."
        },
        sphere: {
            type: "targeter",
            aliases: [],
            description: "Targets points in a sphere around the caster."
        },
        casterSpawnLocation: {
            type: "targeter",
            aliases: ["casterSpawn"],
            description: "Targets the caster's spawn location."
        },
        blocksinchunk: {
            type: "targeter",
            aliases: [],
            description: "Targets all blocks in the targeted chunk."
        },
        a: {
            type: "targeter",
            aliases: [],
            description: "Vanilla selector that targets all online players."
        },
        r: {
            type: "targeter",
            aliases: [],
            description: "Vanilla selector that targets a random online player."
        },
        p: {
            type: "targeter",
            aliases: [],
            description: "Vanilla selector that targets the nearest online player."
        },
        s: {
            type: "targeter",
            aliases: [],
            description: "Vanilla selector that targets the caster."
        },
        e: {
            type: "targeter",
            aliases: [],
            description: "Vanilla selector that targets all entities."
        }
    },
    conditions: {
        hasoffhand: {
            type: "condition",
            aliases: ["offhand"],
            description: "Tests if the target entity has something in offhand."
        },
        onBlock: {
            type: "condition",
            aliases: [],
            description: "Matches the block the target entity is standing on."
        },
        variableIsSet: {
            type: "condition",
            aliases: ["varisset", "varset"],
            description: "Checks if the given variable is set."
        },
        itemissimilar: {
            type: "condition",
            aliases: ["issimilar", "similarto"],
            description: "Checks if the ItemStack is similar."
        },
        playerNotWithin: {
            type: "condition",
            aliases: ["playersnotwithin"],
            description: "Checks if any players are within a radius of the target."
        },
        bowTension: {
            type: "condition",
            aliases: ["bowshoottension"],
            description: ""
        },
        dawn: {
            type: "condition",
            aliases: [],
            description: "If the time is dawn, from 22000 to 2000 in-game time."
        },
        enchantingExperience: {
            type: "condition",
            aliases: ["enchantingExp", "enchantExperience", "enchantExp"],
            description: "Tests the target's enchanting experience."
        },
        sunny: {
            type: "condition",
            aliases: ["issunny"],
            description: "If the weather is sunny in the target world."
        },
        notInRegion: {
            type: "condition",
            aliases: [],
            description: "If the target location is not within the given WorldGuard region."
        },
        owner: {
            type: "condition",
            aliases: [],
            description: "Checks if the target entity is the owner of the caster."
        },
        variableInRange: {
            type: "condition",
            aliases: ["varinrange", "varrange"],
            description: "Checks if the given numeric variable is within a certain range."
        },
        thundering: {
            type: "condition",
            aliases: ["stormy", "isthundering", "isstormy"],
            description: "If it's thundering in the target world."
        },
        samefaction: {
            type: "condition",
            aliases: ["factionsame"],
            description: "Tests if the target is in the same faction as the caster."
        },
        distance: {
            type: "condition",
            aliases: [],
            description: "Whether the distance between the caster and target is within the given range."
        },
        size: {
            type: "condition",
            aliases: ["mobSize"],
            description: "Checks against the entity's size."
        },
        isplayer: {
            type: "condition",
            aliases: [],
            description: "If the target is a player."
        },
        fieldOfView: {
            type: "condition",
            aliases: ["infieldofview", "fov"],
            description: "Tests if the target is within the given angle from where the caster is looking."
        },
        worldtime: {
            type: "condition",
            aliases: [],
            description: "Matches a range against the target location's world's time."
        },
        fallSpeed: {
            type: "condition",
            aliases: ["fallingspeed"],
            description: "If the fall speed of the target is within the given range."
        },
        premium: {
            type: "condition",
            aliases: ["ispremium", "iscool"],
            description: "Whether or not premium is enabledd."
        },
        nearClaim: {
            type: "condition",
            aliases: ["nearClaims"],
            description: "If the target location is near any GriefPrevention claims."
        },
        distanceFromSpawn: {
            type: "condition",
            aliases: [],
            description: "Whether the distance from the world's spawn point to the target is within the given range."
        },
        hasAI: {
            type: "condition",
            aliases: [],
            description: "Tests if target has AI."
        },
        sprinting: {
            type: "condition",
            aliases: ["issprinting"],
            description: "Whether or not the target entity is sprinting. Only works on players."
        },
        moving: {
            type: "condition",
            aliases: ["ismoving"],
            description: "If the target has a velocity greater than zero."
        },
        isClimbing: {
            type: "condition",
            aliases: ["climbing"],
            description: "If the target is climbing."
        },
        name: {
            type: "condition",
            aliases: ["castername"],
            description: "Checks against the entity's name."
        },
        crouching: {
            type: "condition",
            aliases: ["sneaking", "iscrouching", "issneaking"],
            description: "Whether or not the target entity is crouching."
        },
        iscaster: {
            type: "condition",
            aliases: [],
            description: "If the target is the caster of the skill."
        },
        lastSignal: {
            type: "condition",
            aliases: [],
            description: "Matches the last signal received by the target mob."
        },
        wearing: {
            type: "condition",
            aliases: ["iswearing", "wielding", "iswielding"],
            description: "Tests what the target entity has equipped."
        },
        lunarPhase: {
            type: "condition",
            aliases: [],
            description: "Checks the target world's lunar phase."
        },
        variableEquals: {
            type: "condition",
            aliases: ["variableeq", "varequals", "vareq"],
            description: "Checks if the given variable has a particular value."
        },
        faction: {
            type: "condition",
            aliases: [],
            description: "Tests the target's faction."
        },
        parent: {
            type: "condition",
            aliases: ["isParent"],
            description: "Checks if the target entity is the parent/summoner of the caster."
        },
        yaw: {
            type: "condition",
            aliases: [],
            description: "Checks the yaw of the target entity against a range."
        },
        mobsinworld: {
            type: "condition",
            aliases: [],
            description: "Matches a range to how many mobs are in the target world."
        },
        onGround: {
            type: "condition",
            aliases: ["grounded"],
            description: "If the target entity is standing on solid ground."
        },
        distanceFromTrackedLocation: {
            type: "condition",
            aliases: ["distanceFromTL"],
            description: "Tests if the caster is within a certain distance of its tracked location."
        },
        hasTag: {
            type: "condition",
            aliases: ["hasScoreboardTag"],
            description: "Tests if the target has a scoreboard tag."
        },
        playerKills: {
            type: "condition",
            aliases: [],
            description: "Matches how many players the target mob has killed."
        },
        inblock: {
            type: "condition",
            aliases: ["insideblock"],
            description: "Checks the material at the target location."
        },
        hasAuraStacks: {
            type: "condition",
            aliases: ["hasbuffstacks", "hasdebuffstacks", "aurastacks", "buffstacks", "debuffstacks"],
            description: "Tests if the target has the given range of stacks from an aura."
        },
        foodSaturation: {
            type: "condition",
            aliases: ["hungerSaturation"],
            description: "Matches the target's food saturation level."
        },
        IsLeashed: {
            type: "condition",
            aliases: [],
            description: "If the target is leashed."
        },
        heightAbove: {
            type: "condition",
            aliases: [],
            description: "Checks if the target's Y location is above a value."
        },
        stringEquals: {
            type: "condition",
            aliases: ["stringEq"],
            description: "Checks if value1 equals value2. Both values can use variables and placeholders."
        },
        children: {
            type: "condition",
            aliases: [],
            description: "Tests how many children the caster has."
        },
        incombat: {
            type: "condition",
            aliases: [],
            description: "If the target mob is considered in combat."
        },
        foodlevel: {
            type: "condition",
            aliases: ["hunger", "food", "hungerlevel"],
            description: "Matches the target's food level."
        },
        hasAura: {
            type: "condition",
            aliases: ["hasbuff", "hasdebuff"],
            description: "Checks if the target entity has the given aura."
        },
        cuboid: {
            type: "condition",
            aliases: ["incuboid"],
            description: "Whether the target is within the given cuboid between location1 x location2."
        },
        skillOnCooldown: {
            type: "condition",
            aliases: [],
            description: "Whether the caster has the specified skill on cooldown."
        },
        inClaim: {
            type: "condition",
            aliases: ["inclaim"],
            description: "If the target location is inside a GriefPrevention claim."
        },
        biometype: {
            type: "condition",
            aliases: ["biomecategory"],
            description: "Tests if the target is within the given list of biome types."
        },
        isInSurvivalMode: {
            type: "condition",
            aliases: ["inSurvivalMode"],
            description: "If the target is in survival mode."
        },
        dusk: {
            type: "condition",
            aliases: [],
            description: "If the time is dusk, from 14000 to 18000 in-game time."
        },
        hasCurrency: {
            type: "condition",
            aliases: ["hasmoney"],
            description: "If the target has the given amount of vault currency."
        },
        color: {
            type: "condition",
            aliases: ["clr"],
            description: "Checks for entity's color."
        },
        targetInLineOfSight: {
            type: "condition",
            aliases: [],
            description: "Tests if the target has line of sight to their target."
        },
        health: {
            type: "condition",
            aliases: ["hp"],
            description: "Matches the target's health."
        },
        burning: {
            type: "condition",
            aliases: ["isburning", "isonfire"],
            description: "Whether or not the target entity is on fire."
        },
        targetnotwithin: {
            type: "condition",
            aliases: [],
            description: "Tests if the target's target is not within a certain distance."
        },
        vehicleisdead: {
            type: "condition",
            aliases: [],
            description: "If the target's vehicle is dead."
        },
        altitude: {
            type: "condition",
            aliases: ["heightfromsurface"],
            description: "Tests how far above the ground the target entity is."
        },
        entityMaterialType: {
            type: "condition",
            aliases: [],
            description: "Tests the material type of the target item entity."
        },
        gliding: {
            type: "condition",
            aliases: ["isgliding"],
            description: "If the target is gliding."
        },
        globalscore: {
            type: "condition",
            aliases: ["scoreglobal"],
            description: "Checks a global scoreboard value."
        },
        mounted: {
            type: "condition",
            aliases: [],
            description: "If the target entity is riding a mount/vehicle."
        },
        isRaiderPatrolLeader: {
            type: "condition",
            aliases: ["isPatrolLeader"],
            description: "Checks if the target entity is the captain of a pillager group."
        },
        isCreeperPrimed: {
            type: "condition",
            aliases: [],
            description: "If the target creeper is primed to explode."
        },
        score: {
            type: "condition",
            aliases: [],
            description: "Checks a scoreboard value of the target entity."
        },
        plugin: {
            type: "condition",
            aliases: ["pluginexists", "hasplugin"],
            description: "Whether or not a specific plugin exists."
        },
        dimension: {
            type: "condition",
            aliases: ["environment"],
            description: "Tests if the target is within a certain dimension."
        },
        charged: {
            type: "condition",
            aliases: ["isCharged", "creeperCharged"],
            description: "Whether or not the creeper is charged."
        },
        HasItem: {
            type: "condition",
            aliases: [],
            description: "Checks the inventory for this item."
        },
        targetNotInLineOfSight: {
            type: "condition",
            aliases: [],
            description: "Tests if the target doesn't have line of sight to their target."
        },
        ydiff: {
            type: "condition",
            aliases: [],
            description: "Whether the y-difference between the caster and target is within the given range."
        },
        mobsinchunk: {
            type: "condition",
            aliases: [],
            description: "Matches a range to how many mobs are in the target location's chunk."
        },
        lightLevelfromblocks: {
            type: "condition",
            aliases: ["blocklightlevel"],
            description: "Tests the light level at the target location."
        },
        haspassenger: {
            type: "condition",
            aliases: [],
            description: "If the target entity has a passenger."
        },
        haspermission: {
            type: "condition",
            aliases: ["permission"],
            description: "Tests if the target player has a permission."
        },
        entityitemissimilar: {
            type: "condition",
            aliases: [],
            description: "Tests if the item entity is similar to an itemstack."
        },
        inside: {
            type: "condition",
            aliases: [],
            description: "Checks if the target has a block over their head."
        },
        DamageAmount: {
            type: "condition",
            aliases: [],
            description: "Checks the damage amount that caused the current skill tree. Only works with onDamaged trigger or aura."
        },
        blockType: {
            type: "condition",
            aliases: [],
            description: "Tests the material type present at the target location."
        },
        velocity: {
            type: "condition",
            aliases: [],
            description: "Checks the velocity of the target entity against a range."
        },
        lightLevel: {
            type: "condition",
            aliases: [],
            description: "Tests the light level at the target location."
        },
        lineOfSight: {
            type: "condition",
            aliases: ["inlineofsight"],
            description: "Tests if the target is within line of sight of the caster."
        },
        ischild: {
            type: "condition",
            aliases: ["child"],
            description: "If the target is a child of the caster."
        },
        entityType: {
            type: "condition",
            aliases: ["mobtype"],
            description: "Tests the entity type of the target."
        },
        mythicMobType: {
            type: "condition",
            aliases: ["mmType"],
            description: "Checks the MythicMob type of the target mob."
        },
        raining: {
            type: "condition",
            aliases: ["israining"],
            description: "If it's raining in the target world."
        },
        lastDamageCause: {
            type: "condition",
            aliases: [],
            description: "Checks the target's last damage cause."
        },
        level: {
            type: "condition",
            aliases: [],
            description: "Checks the target MythicMob's level."
        },
        region: {
            type: "condition",
            aliases: ["inregion"],
            description: "If the target is within the given WorldGuard region."
        },
        hasInventorySpace: {
            type: "condition",
            aliases: [],
            description: "If the target has empty inventory space."
        },
        blocking: {
            type: "condition",
            aliases: ["isblocking"],
            description: "Tests if the target entity is blocking with a shield."
        },
        biome: {
            type: "condition",
            aliases: [],
            description: "Tests if the target is within the given list of biomes."
        },
        entityItemType: {
            type: "condition",
            aliases: [],
            description: "Tests the item type of the target item entity."
        },
        playersInRadius: {
            type: "condition",
            aliases: ["pir", "playerInRadius"],
            description: "Checks for a given number of players within a radius of the target."
        },
        stance: {
            type: "condition",
            aliases: [],
            description: "Checks the stance of the target mob."
        },
        ismonster: {
            type: "condition",
            aliases: [],
            description: "If the target is a monster."
        },
        outside: {
            type: "condition",
            aliases: [],
            description: "If the target has open sky above them."
        },
        playerWithin: {
            type: "condition",
            aliases: ["playerswithin"],
            description: "Checks if any players are within a radius of the target."
        },
        lineOfSightFromOrigin: {
            type: "condition",
            aliases: ["inlineofsightfromorigin"],
            description: "Tests if the target is within line of sight of the origin."
        },
        enderdragonPhase: {
            type: "condition",
            aliases: ["edragonPhase"],
            description: "Tests the phase of the target EnderDragon."
        },
        mobsinradius: {
            type: "condition",
            aliases: [],
            description: "Matches a range to how many mobs are in the given radius."
        },
        hasEnchantment: {
            type: "condition",
            aliases: ["hasEnchant"],
            description: "Tests if the target entity has an equipped enchantment."
        },
        holding: {
            type: "condition",
            aliases: [],
            description: "Checks if the target is holding a given material."
        },
        day: {
            type: "condition",
            aliases: [],
            description: "If the time is day, from 2000 to 10000 in-game time."
        },
        motionx: {
            type: "condition",
            aliases: ["motx"],
            description: "Checks the X motion of the target entity against a range."
        },
        motiony: {
            type: "condition",
            aliases: ["moty"],
            description: "Checks the Y motion of the target entity against a range."
        },
        targetWithin: {
            type: "condition",
            aliases: [],
            description: "Tests if the target's target is within a certain distance."
        },
        motionz: {
            type: "condition",
            aliases: ["motz"],
            description: "Checks the Z motion of the target entity against a range."
        },
        localdifficulty: {
            type: "condition",
            aliases: [],
            description: "Tests the difficulty scale at the target location."
        },
        night: {
            type: "condition",
            aliases: [],
            description: "If the time is night, from 14000 to 22000 in-game time."
        },
        hasPotionEffect: {
            type: "condition",
            aliases: ["hasPotion"],
            description: "Tests if the target entity has a potion effect."
        },
        world: {
            type: "condition",
            aliases: [],
            description: "Checks the name of the target world."
        },
        heightBelow: {
            type: "condition",
            aliases: [],
            description: "Checks if the target's Y location is below a given value."
        },
        pitch: {
            type: "condition",
            aliases: [],
            description: "Checks if the pitch of the target entity is within a range."
        },
        enchantingLevel: {
            type: "condition",
            aliases: [],
            description: "Tests the target's enchanting level."
        },
        hasgravity: {
            type: "condition",
            aliases: ["gravity"],
            description: "Tests if the target has gravity."
        },
        hasOwner: {
            type: "condition",
            aliases: [],
            description: "Tests if the target mob has an owner."
        },
        DamageCause: {
            type: "condition",
            aliases: [],
            description: "Checks the damage cause of the current skill tree. Only works with onDamaged trigger or aura."
        },
        isFrozen: {
            type: "condition",
            aliases: [],
            description: "Tests if the target is fully frozen."
        },
        livinginradius: {
            type: "condition",
            aliases: [],
            description: "Matches a range to how many living entities are in the given radius."
        },
        MythicKeyId: {
            type: "condition",
            aliases: ["keyid"],
            description: "Tests for the mythic key id that was pressed/released."
        },
        ownerIsOnline: {
            type: "condition",
            aliases: [],
            description: "Checks if the owner of the target mob is online, if the owner is a player."
        },
        isNaturalBlock: {
            type: "condition",
            aliases: [],
            description: "Checks if the target block was naturally generated."
        },
        itemRecharging: {
            type: "condition",
            aliases: [],
            description: "Checks if the target's weapon is recharging."
        },
        hasParent: {
            type: "condition",
            aliases: [],
            description: "Tests if the target mob has a parent."
        },
        isliving: {
            type: "condition",
            aliases: [],
            description: "If the target is living."
        },
        height: {
            type: "condition",
            aliases: [],
            description: "Checks if the target's Y location is within a range."
        },
        offGCD: {
            type: "condition",
            aliases: [],
            description: "Checks if the target mob has an active Global Cooldown."
        },
        targets: {
            type: "condition",
            aliases: [],
            description: "Tests if the number of inherited targets from the parent skilltree matches the given range."
        }
    }
} satisfies { mechanics: { [name: string]: Holder }; targeters: { [name: string]: Holder }; conditions: { [name: string]: Holder } };
