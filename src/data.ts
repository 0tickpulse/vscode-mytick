const templates = {
    spawner: {
        completions: [],
        placeholder: "<spawner>"
    },
    duration: {
        description: "The duration, in ticks (one tick is 0.05 seconds, there's 20 ticks in a second).",
        validator: (value: string) => !Number.isNaN(parseInt(value))
    },
    booleanDefaultTrue: {
        completions: ["true", "false"],
        placeholder: true
    },
    booleanDefaultFalse: {
        completions: ["false", "true"],
        placeholder: false
    },
    vector: {
        description: "A vector, in the format x,y,z.",
        placeholder: "0,0,0"
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
        aliases: ["bartimercolor"],
        description: "The color of the bossbar. Can be `PINK`, `BLUE`, `RED`, `GREEN`, `YELLOW`, `PURPLE`, or `WHITE`.",
        validator: (value: string) => value in bossbarColors,
        placeholder: "RED"
    },
    barStyle: {
        aliases: ["bartimerstyle"],
        description: "The style of the bossbar. Can be `SOLID`, `SEGMENTED_6`, `SEGMENTED_10`, `SEGMENTED_12`, `SEGMENTED_20`.",
        validator: (value: string) => value in bossbarStyles,
        placeholder: "SOLID"
    }
};

const dynamicTemplates = {
    intRange: (min: number, max: number): Field => ({
        description: `An integer between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseInt(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    }),
    floatRange: (min: number, max: number): Field => ({
        description: `A floating point number between ${min} and ${max}.`,
        validator: (value: string) => {
            const parsed = parseFloat(value);
            return !Number.isNaN(parsed) && parsed >= min && parsed <= max;
        }
    })
};

const bossbarColors = ["PINK", "BLUE", "RED", "GREEN", "YELLOW", "PURPLE", "WHITE"];
const bossbarStyles = ["SOLID", "SEGMENTED_6", "SEGMENTED_10", "SEGMENTED_12", "SEGMENTED_20"];

const maxInt = 2147483647;

const prefilledFields = {
    auraFields: {
        auraname: {
            aliases: ["buffname", "debuffname"],
            description: "The name of the aura."
        },
        charges: {
            aliases: ["c"],
            description: "The number of charges to apply.",
            placeholder: 0
        },
        duration: {
            aliases: ["ticks", "t", "d", "time"],
            description: "The duration of the aura in ticks.",
            placeholder: 200
        },
        maxStacks: {
            ...templates.int,
            aliases: ["ms"],
            description: "How many times the aura stacks on the same targeted entity if applied multiple times.",
            placeholder: 1
        },
        mergeall: {
            ...templates.booleanDefaultFalse,
            aliases: ["ma"],
            description:
                "Merges all of the same auras applied by any and all entities to another into one aura (Prevents multiple mobs from being able to stack an aura multiple times on the same entity)"
        },
        overwriteall: {
            ...templates.booleanDefaultFalse,
            aliases: ["overwrite", "oa"],
            description: "When applied, stops all of the same auras applied on the target and replaces them with the new aura."
        },
        overwritesamecaster: {
            ...templates.booleanDefaultFalse,
            aliases: ["osc", "oc"],
            // TODO Ambiguous description
            description: "When applied, stops all of the same auras applied on the target by the same caster and replaces them with the new aura"
        },
        mergesamecaster: {
            /**
             * According to the source code, this will be set to true if mergeAll, overwriteAll, and overwriteSameCaster are all set to false.
             * However, I'm too lazy to do that.
             */
            ...templates.booleanDefaultFalse,
            aliases: ["msc", "mc"],
            description:
                "Merges all of the same auras applied by one entity to another into one aura (Prevents a mob from being able to stack an aura multiple times on the same entity)"
        },
        refreshduration: {
            ...templates.booleanDefaultTrue,
            aliases: ["rd"],
            description:
                "Makes the aura's duration refresh to the amount defined in the mechanic should the entity have the same aura applied to it again"
        },
        showbartimer: {
            ...templates.booleanDefaultFalse,
            aliases: ["bartimer", "bt"],
            description: "Shows a bossbar timer for the aura."
        },
        bartimerdisplay: {
            aliases: ["bartimertext"],
            /**
             * According to the source code, this defaults to the auraname if unspecified.
             * However, I'm too lazy to do that.
             */
            description: "The text to display on the bossbar timer. Defaults to the aura's name."
        },
        bartimercolor: templates.barColor,
        bartimerstyle: templates.barStyle,
        cancelongivedamage: {
            ...templates.booleanDefaultFalse,
            aliases: ["cogd"],
            description: "Cancels the aura if the entity with the aura deals any damage to another entity."
        },
        cancelontakedamage: {
            ...templates.booleanDefaultFalse,
            aliases: ["cotd"],
            description: "Cancels the aura if the entity with the aura takes any damage."
        },
        cancelondeath: {
            ...templates.booleanDefaultTrue,
            aliases: ["cod"],
            description: "Cancels the aura if the entity with the aura dies."
        },
        cancelonteleport: {
            ...templates.booleanDefaultFalse,
            aliases: ["cot"],
            description: "Cancels the aura if the entity with the aura teleports."
        },
        cancelonchangeworld: {
            ...templates.booleanDefaultFalse,
            aliases: ["cocw"],
            description: "Cancels the aura if the entity with the aura changes worlds (most of the time, this applies to players)."
        },
        cancelonskilluse: {
            ...templates.booleanDefaultFalse,
            aliases: ["cosu"],
            description: "Cancels the aura if the entity with the aura uses another skill."
        },
        cancelonquit: {
            ...templates.booleanDefaultTrue,
            aliases: ["coq"],
            description: "Cancels the aura if the entity with the aura quits the server (almost entirely applies to players)."
        },
        doendskillonterminate: {
            ...templates.booleanDefaultTrue,
            /**
             * What does "ares" mean?
             * I'm too lazy to find out.
             */
            aliases: ["desot", "alwaysrunendskill", "ares"],
            description: "Runs the end skill of the aura even when the aura is cancelled."
        },
        onstartskill: {
            ...templates.metaskill,
            aliases: ["onstart, os"],
            description: "The meta-skill to run when the aura is first applied."
        },
        ontickskill: {
            ...templates.metaskill,
            aliases: ["ontick, ot"],
            description: "The meta-skill to run every set interval (determined by the `interval` field) while the aura is active."
        },
        onendskill: {
            ...templates.metaskill,
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
        color: templates.barColor,
        style: templates.barStyle
    }
};

/**
 * Represents a field of a mechanic, targeter, trigger, or condition.
 * A skill can have multiple fields, and each field can have a single value.
 * An example:
 *
 * ```yaml
 * - projectile{onTick=MySkill}
 * ```
 *
 * In this example, the field `onTick` has the value `MySkill`.
 *
 */
interface Field {
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
    placeholder?: string | boolean | number;
    /**
     * A function that validates the field's value. If the function returns false, the value is invalid.
     * When invalid, an error will display.
     * @param value The value to validate.
     */
    validator?: (value: string) => boolean;
    /**
     * A list of completions that will be displayed when the field is being typed.
     */
    completions?: string[];
}
interface Holder {
    aliases: string[];
    description?: string;
    fields?: { [key: string]: Field };
}

export const defaultFields = {
    mechanics: {
        cooldown: {
            ...templates.seconds,
            aliases: ["cd"]
        },
        delay: {
            ...templates.duration
        },
        targetinterval: {
            ...templates.float,
            aliases: ["targeti"],
            description: "The interval (in ticks) at which the skill will run between targets."
        },
        repeat: {
            ...templates.int,
            description: "The number of times the skill will repeat, not including when it runs normally (`repeat=2` means it'll run, and then repeat two times, therefore running a total of 3 times)."
        },
        repeatinterval: {
            ...templates.duration,
            aliases: ["repeati"],
            description: "The interval (in ticks) at which the skill will repeat."
        },
        power: {
            ...templates.float,
            description: "The power of the skill More information here: [Wiki entry: Power Scaling](https://git.lumine.io/mythiccraft/MythicMobs/-/wikis/Mobs/Power)."
        },
        powersplitbetweentargets: {
            ...templates.booleanDefaultFalse,
            aliases: ["powersplit", "splitpower"],
            description: "Whether or not to split the power between targets. If this is true, the power will be divided by the number of targets."
        },
        forcesync: {
            ...templates.booleanDefaultFalse,
            aliases: ["sync"],
            description: "Whether or not to force the skill to run synchronously. This is useful for skills that need to run on the main thread."
        },
        targetisorigin: {
            ...templates.booleanDefaultFalse,
            description: "Changes the origin to whatever targeter is supplied."
        },
        sourceisorigin: {
            ...templates.booleanDefaultFalse,
            aliases: ["castfromorigin", "fromorigin", "fo"],
            description: "Run the skill from the origin"
        },
        origin: {
            // TODO: Origin should tab complete and validate with targeters
            description: "The origin of the skill."
        }
    }
};

export const data: { mechanics: { [name: string]: Holder }; targeters: { [name: string]: Holder }; conditions: { [name: string]: Holder } } = {
    mechanics: {
        togglepiston: {
            aliases: ["piston"],
            description: "Toggles a piston at the target location."
        },
        playBlockPlaceSound: {
            aliases: ["blockPlaceSound"],
            description: "Plays the target block's placing sound. Requires Paper."
        },
        explosion: {
            aliases: ["explode"],
            description: "Causes an explosion at the target location."
        },
        disguiseTarget: {
            aliases: [],
            description: "Disguises the target entity."
        },
        setgravity: {
            aliases: ["setusegravity"],
            description: "ets whether gravity affects the target entity."
        },
        setmobcolor: {
            aliases: ["setcolor"],
            description: "Sets the color the target entity. Must be a colorable entity."
        },
        summonAreaEffectCloud: {
            aliases: ["summonCloud"],
            description: "Summons an Area Effect Cloud."
        },
        bossBorder: {
            aliases: ["effect:bossBorder", "e:bossBorder"],
            description: "Draws a world border to create a boss arena."
        },
        terminateProjectile: {
            aliases: ["endprojectile", "terminateproj", "endproj", "stopprojectile", "stopproj"],
            description: ""
        },
        jump: {
            aliases: [],
            description: "Causes the caster to jump."
        },
        "effect:guardianBeam": {
            aliases: ["guardianbeam", "e:guardianbeam", "effect:beam", "e:beam"],
            description: "Draws a guardian beam between the origin and the target."
        },
        metavariableskill: {
            aliases: ["variableskill", "vskill"],
            description: "Finds and executes a metaskill."
        },
        "effect:skybox": {
            aliases: ["skybox", "e:skybox"],
            description: "Modifies the skybox for the target player."
        },
        volley: {
            aliases: ["shootvolley"],
            description: "Fires a volley of projectiles."
        },
        firework: {
            aliases: ["fireworks", "effect:firework", "effect:fireworks", "e:firework"],
            description: "Shoots a firework."
        },
        bloodyScreen: {
            aliases: ["effect:bloodyScreen", "e:bloodyScreen", "redScreen", "effect:redScreen", "e:redScreen"],
            description: "Causes the player's screen to be covered in blood."
        },
        mount: {
            aliases: ["vehicle"],
            description: "Summons a vehicle for the caster."
        },
        shootfireball: {
            aliases: ["fireball"],
            description: "Shoots a projectile at the target location."
        },
        barCreate: {
            aliases: ["barAdd", "createBar"],
            description: "Creates a custom bossbar display.",
            fields: prefilledFields.barFields
        },
        setai: {
            aliases: ["ai"],
            description: "Sets whether the mob utilizes AI (ai=true/false)."
        },
        runaigoalselector: {
            aliases: ["aigoal", "aigoals"],
            description: "Modify an AI Goal Selector of the caster."
        },
        sendactionmessage: {
            aliases: ["actionmessage", "am"],
            description: "Send an Action Bar message to the target player."
        },
        breakBlock: {
            aliases: ["blockBreak"],
            description: "Breaks the block at the target location."
        },
        disguisemodifynew: {
            aliases: ["newmodifydisguise"],
            description: "Disguises the target entity."
        },
        pasteSchematic: {
            aliases: ["schematicPaste", "fawePaste", "wePaste"],
            description: "Pastes a schematic using Fawe."
        },
        activatespawner: {
            aliases: ["as"],
            description: "Activate a Mythic Spawner.",
            fields: {
                spawner: {
                    aliases: ["spawners", 's"'],
                    description: "The spawner to activate."
                }
            }
        },
        onKeyPress: {
            aliases: ["keyPress", "kp"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is pressed."
        },
        "effect:particles": {
            aliases: ["effect:particle", "particles", "particle", "e:particles", "e:particle", "e:p"],
            description: "Plays a particle effect at the target location."
        },
        giveitemfromslot: {
            aliases: ["givefromslot"],
            description: "Gives the target an item in the caster's equipment."
        },
        metaskill: {
            aliases: ["skill", "meta"],
            description: "Executes a metaskill."
        },
        baseDamage: {
            aliases: ["bd", "weaponDamage", "wd"],
            description: "Deals a percent of the mob's damage stat as damage."
        },
        goto: {
            aliases: ["pathto", "navigateto"],
            description: "Path to the target location."
        },
        togglesitting: {
            aliases: ["sit"],
            description: "Toggles the sitting state of an entity for cats/dogs."
        },
        damage: {
            aliases: ["d"],
            description: "Deals damage to the target."
        },
        "effect:flames": {
            aliases: ["flames", "e:flames"],
            description: "Creates a flame effect at the target location."
        },
        heal: {
            aliases: ["h"],
            description: "Heals the target entity."
        },
        aura: {
            aliases: ["buff", "debuff"],
            description: "Applies a generic aura to the target.",
            fields: prefilledFields.auraFields
        },
        message: {
            aliases: ["msg", "m"],
            description: "Sends a message to the target entity."
        },
        orbital: {
            aliases: ["o"],
            description: "Applies an orbital aura to the target."
        },
        blockphysics: {
            aliases: ["bphysics"],
            description: "Force a block physics update at the target location."
        },
        projectile: {
            aliases: ["p"],
            description: "Launches a custom projectile at the target."
        },
        fly: {
            aliases: [],
            description: "Aura that enables flying on the target entity."
        },
        "effect:sound": {
            aliases: ["sound", "s", "e:sound", "e:s"],
            description: "Plays a sound at the target location."
        },
        totem: {
            aliases: ["toteme", "t"],
            description: "Creates a static totem projectile at the target."
        },
        takeitem: {
            aliases: ["take", "takeitems", "itemtake"],
            description: "Takes an item from the target."
        },
        command: {
            aliases: ["cmd"],
            description: "Executes a command."
        },
        chainmissile: {
            aliases: ["cmi"],
            description: "Shoots a chaining homing missile at the target."
        },
        dropitem: {
            aliases: ["drop", "dropitems", "itemdrop"],
            description: "Drops an item or droptable."
        },
        consume: {
            aliases: [],
            description: "Deals damage to the target and heals the caster."
        },
        potionclear: {
            aliases: ["clearpotions", "clearpotion"],
            description: "Clears all potion effects on the target entity."
        },
        weather: {
            aliases: [],
            description: "Changes the weather."
        },
        doppleganger: {
            aliases: ["copyplayer"],
            description: "Disguises the caster as the target entity."
        },
        "effect:spin": {
            aliases: ["spin", "e:spin"],
            description: "Forces the target entity to spin."
        },
        "effect:smoke": {
            aliases: ["smoke", "e:smoke"],
            description: ""
        },
        giveitemfromtarget: {
            aliases: ["givefromtarget", "giveitemsfromtarget", "itemgivefromtarget"],
            description: "Gives the target an item or droptable."
        },
        playBlockFallSound: {
            aliases: ["blockFallSound"],
            description: "Plays the target block's fall sound. Requires Paper."
        },
        wolfsit: {
            aliases: [],
            description: "Sets a wolf's sitting state."
        },
        animatearmorstand: {
            aliases: ["animateas", "animas"],
            description: "Makes an armor stand assume a pose over a specified time.",
            fields: {
                duration: templates.duration,
                smart: {
                    ...templates.booleanDefaultTrue,
                    description: "If true, the animation will play smoother."
                },
                ignoreEmpty: {
                    ...templates.booleanDefaultTrue,
                    description: "If true, the animation will ignore unspecified slots."
                },
                usedegrees: {
                    ...templates.booleanDefaultTrue,
                    description: "If true, the animation will use degrees instead of radians."
                },
                head: {
                    ...templates.vector,
                    description: "A vector representing the head's rotation."
                },
                body: {
                    ...templates.vector,
                    description: "A vector representing the body's rotation."
                },
                leftarm: {
                    ...templates.vector,
                    description: "A vector representing the left arm's rotation."
                },
                rightarm: {
                    ...templates.vector,
                    description: "A vector representing the right arm's rotation."
                },
                leftleg: {
                    ...templates.vector,
                    description: "A vector representing the left leg's rotation."
                },
                rightleg: {
                    ...templates.vector,
                    description: "A vector representing the right leg's rotation."
                }
            }
        },
        variableMath: {
            aliases: ["varMath", "mathVariable", "mathVar"],
            description: "Sets a variable to the result of a math equation, where 'x' is the variable's current value."
        },
        "effect:lightning": {
            aliases: ["e:lightning"],
            description: "Causes a lightning strike effect at the target location."
        },
        "effect:particletornado": {
            aliases: ["particletornado", "e:pt"],
            description: ""
        },
        giveitem: {
            aliases: ["give", "giveitems", "itemgive"],
            description: "Gives the target an item or droptable."
        },
        "effect:totemresurrection": {
            aliases: ["totemresurrection", "e:totemresurrection", "totemresurrectioneffect", "totemofundying", "e:totemofundying", "totemeffect"],
            description: "Plays a fake totem resurrection effect."
        },
        showentity: {
            aliases: ["showplayer"],
            description: ""
        },
        teleportin: {
            aliases: ["tpdir", "tpin", "tpi"],
            description: "Teleports the target in a direction."
        },
        settonguetarget: {
            aliases: ["tonguetarget"],
            description: "Sets the casting frog's tongue to target the given entity."
        },
        potion: {
            aliases: [],
            description: "Applies a potion effect to the target entity."
        },
        setSkillCooldown: {
            aliases: ["skillCooldown", "setskillcd", "skillcd"],
            description: "Sets the cooldown on the given skill for the target."
        },
        recoil: {
            aliases: ["effect:recoil", "e:recoil"],
            description: "Causes the player's screen to recoil."
        },
        setpathfindingmalus: {
            aliases: ["setmalus", "malus"],
            description: "Sets the pathfinding malus of a mob."
        },
        stun: {
            aliases: [],
            description: "Applies an aura that stuns the target entity."
        },
        swingarm: {
            aliases: ["armAnimation"],
            description: "Makes the caster swing their arm."
        },
        prison: {
            aliases: [],
            description: "Traps the target entity in blocks."
        },
        setRaiderCanJoinRaid: {
            aliases: ["setCanJoinRaid"],
            description: "Sets if the target raider can join a raid or not."
        },
        enderDragonSetPhase: {
            aliases: ["setEnderDragonPhase"],
            description: "Generates the EnderDragon portal."
        },
        bonemeal: {
            aliases: [],
            description: "Applies bonemeal to the targeted location."
        },
        messagejson: {
            aliases: ["jsonmessage", "jmsg", "jm"],
            description: "Sends a JSON-formatted message to the target entity."
        },
        variableUnset: {
            aliases: ["varUnset", "unsetVariable", "unsetVar"],
            description: "Unsets a variable."
        },
        shootpotion: {
            aliases: [],
            description: "Shoots a splash potion."
        },
        currencyGive: {
            aliases: ["giveCurrency"],
            description: "Gives an amount of vault currency."
        },
        onbowshoot: {
            aliases: ["onshoot"],
            description: "Applies an aura to the target that triggers a skill when they shoot a bow."
        },
        onattack: {
            aliases: ["onhit"],
            description: "Applies an aura to the target that triggers a skill when they damage something."
        },
        "effect:particlebox": {
            aliases: ["particlebox", "e:pb", "pb"],
            description: ""
        },
        playAnimation: {
            aliases: ["effect:playanimation", "e:playanimation", "playarmanimation"],
            description: "Forces the entity to play an animation."
        },
        auraRemove: {
            aliases: ["removeaura", "removebuff", "removedebuff"],
            description: "Removes an aura from the target.",
            fields: {
                aura: {
                    aliases: ["buff", "debuff", "name", "b", "n"],
                    description: 'The aura to remove. If set to "any", all auras will be removed.'
                },
                stacks: {
                    ...templates.int,
                    aliases: ["s"],
                    description: `The number of stacks to remove. Defaults to ${maxInt}.`
                }
            }
        },
        OnSwing: {
            aliases: ["OnLeftClick"],
            description: ""
        },
        shootshulkerbullet: {
            aliases: ["shootshulker"],
            description: "Shoots a shulker bullet at the target entity."
        },
        teleportto: {
            aliases: ["tpt", "teleportlocation", "tpl"],
            description: "Teleports the target entity to a location."
        },
        enderDragonSetRespawnPhase: {
            aliases: ["setEnderDragonRespawnPhase"],
            description: "Sets the game phase on an EnderDragon."
        },
        "effect:thunderlevel": {
            aliases: ["thunderlevel", "e:thunderlevel"],
            description: "Modifies the skybox for the target player."
        },
        currencyTake: {
            aliases: ["takeCurrency"],
            description: "Removes an amount of vault currency."
        },
        setleashholder: {
            aliases: ["setleasher"],
            description: "Sets an entity to hold the caster's leash."
        },
        pickupitem: {
            aliases: [],
            description: "Picks up the target item entity."
        },
        setname: {
            aliases: [],
            description: "Sets the casting mob's name."
        },
        "effect:particlewave": {
            aliases: ["particlewave", "e:pw"],
            description: ""
        },
        setRaiderPatrolLeader: {
            aliases: ["setRaiderLeader"],
            description: "Sets the target raider to patrol the given location."
        },
        setRaiderPatrolBlock: {
            aliases: ["setRaiderBlock"],
            description: "Sets the target raider to patrol the given location."
        },
        hologram: {
            aliases: ["summonhologram", "holo"],
            description: "Spawns a hologram at a target location."
        },
        hideFromPlayers: {
            aliases: ["hideFromPlayer", "hide"],
            description: "Hides the caster from the targeted player(s)."
        },
        onblockbreak: {
            aliases: ["onbreakblock"],
            description: "Applies an aura to the target that triggers a skill when they break a block."
        },
        randomskill: {
            aliases: ["randommeta"],
            description: "Executes a random metaskill."
        },
        fillChest: {
            aliases: ["populateChest", "fillContainer", "populateContainer"],
            description: "Fills a container with loot."
        },
        threat: {
            aliases: ["threatchange", "threatmod"],
            description: "Modifies the target entities' threat level."
        },
        velocity: {
            aliases: [],
            description: "Sets the velocity on the target entity."
        },
        "effect:particlesphere": {
            aliases: ["particlesphere", "e:ps", "ps"],
            description: ""
        },
        healpercent: {
            aliases: ["percentheal", "hp"],
            description: "Heals the target entity for a percentage of their health."
        },
        blockUnmask: {
            aliases: ["effect:blockUnmask", "e:blockunmask"],
            description: "Unmasks any nearby blocks that have been masked."
        },
        setlevel: {
            aliases: ["modifylevel"],
            description: "Modifies the castering mob's level."
        },
        "effect:particlering": {
            aliases: ["particlering", "e:pr", "pr"],
            description: ""
        },
        shoot: {
            aliases: ["shootprojetile"],
            description: "Shoots a projectile at the target location."
        },
        consumeslotitem: {
            aliases: ["consumeslot"],
            description: "Removes an amount of the target's item in a specified slot."
        },
        "effect:ender": {
            aliases: ["ender", "e:ender"],
            description: "Creates the ender effect at the target location."
        },
        setspeed: {
            aliases: [],
            description: "Sets the speed attribute of the target entity."
        },
        shieldbreak: {
            aliases: ["disableshield"],
            description: "Breaks the target player's shield block."
        },
        closeInventory: {
            aliases: [],
            description: "Closes the target player's inventory."
        },
        OnInteract: {
            aliases: ["OnInteract"],
            description: ""
        },
        ejectpassenger: {
            aliases: ["eject_passenger"],
            description: "Kicks off any entities using the caster as a vehicle."
        },
        "effect:atom": {
            aliases: ["e:atom", "atom"],
            description: ""
        },
        modifyprojectile: {
            aliases: [],
            description: "Modifies an attribute of the projectile that executed the mechanic."
        },
        barRemove: {
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
            aliases: ["tpy"],
            description: "Teleports to the target Y coordinate."
        },
        "effect:smokeswirl": {
            aliases: ["smokeswirl", "e:smokeswirl"],
            description: ""
        },
        setrotation: {
            aliases: ["setrot"],
            description: "Sets the target's yaw and/or pitch without teleporting it. Does not work on players!."
        },
        onKeyRelease: {
            aliases: ["keyRelease", "kr"],
            description: "Applies an aura to the targeted entity that triggers a skill when a key is released."
        },
        GoatRam: {
            aliases: [],
            description: "Causes the goat to ram the targeted entity."
        },
        chain: {
            aliases: [],
            description: "Casts a metaskill that bounces between targets."
        },
        decapitate: {
            aliases: ["dropHead"],
            description: "Drops the target entity's head."
        },
        "effect:particleline": {
            aliases: ["e:pl", "pl", "particleline"],
            description: ""
        },
        "effect:particleorbital": {
            aliases: ["e:particleorbital", "particleorbital", "effect:particlecircle", "particlecircle", "e:particlecricle"],
            description: ""
        },
        playBlockStepSound: {
            aliases: ["blockStepSound"],
            description: "Plays the target block's stepping sound. Requires Paper."
        },
        playBlockBreakSound: {
            aliases: ["blockBreakSound"],
            description: "Plays the target block's breaking sound. Requires Paper."
        },
        extinguish: {
            aliases: ["removefire"],
            description: "Removes fire on the target entity."
        },
        tagadd: {
            aliases: ["addtag", "addscoreboardtag"],
            description: "Adds a scoreboard tag to the target entity."
        },
        setTrackedLocation: {
            aliases: ["tracklocation", "stl"],
            description: "Sets the mob's tracked location to the targeted location."
        },
        "effect:stopsound": {
            aliases: ["stopsound", "e:ss", "ss"],
            description: "Stops a sound from playing for the targeted entity."
        },
        missile: {
            aliases: ["mi"],
            description: "Shoots a homing missile at the target."
        },
        disguiseold: {
            aliases: [],
            description: "Disguises the target entity."
        },
        modifyscore: {
            aliases: [],
            description: "Modifies a scoreboard value."
        },
        "effect:enderbeam": {
            aliases: ["enderbeam"],
            description: "Creates an endercrystal beam pointing at the target."
        },
        blockMask: {
            aliases: ["effect:blockMask", "e:blockMask"],
            description: "Temporarily masks a block as a different block."
        },
        blockWave: {
            aliases: ["effect:blockWave", "e:blockWave"],
            description: "Temporarily masks a block as a different block."
        },
        lightning: {
            aliases: [],
            description: "Strikes lightning at the target location."
        },
        "effect:glow": {
            aliases: ["glow", "e:glow"],
            description: "Makes the taget entity glow. Requires GlowAPI."
        },
        mounttarget: {
            aliases: [],
            description: "Causes the caster to mount the target entity."
        },
        playBlockHitSound: {
            aliases: ["blockHitSound"],
            description: "Plays the target block's hit sound. Requires Paper."
        },
        blackScreen: {
            aliases: ["effect:blackScreen", "e:blackScreen"],
            description: "Causes the player's screen to black out."
        },
        OnJump: {
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they jump."
        },
        onblockplace: {
            aliases: ["onplaceblock"],
            description: "Applies an aura to the target that triggers a skill when they place a block."
        },
        swap: {
            aliases: ["tpswap"],
            description: "Swaps positions with the target entity."
        },
        switch: {
            aliases: [],
            description: "Acts as a switch/case."
        },
        "effect:itemspray": {
            aliases: ["itemspray", "e:itemspray"],
            description: "Sprays items everywhere."
        },
        feed: {
            aliases: [],
            description: "Feeds the target entity."
        },
        blockDestabilize: {
            aliases: ["destabilizeBlock", "destabilizeBlocks"],
            description: "Turns a block into a falling block."
        },
        modifytargetscore: {
            aliases: ["mts"],
            description: ""
        },
        sendtoast: {
            aliases: ["advancementmessage", "advmessage", "toastmessage", "toastmsg"],
            description: "Sends a message to the target player as an advancement."
        },
        suicide: {
            aliases: [],
            description: "Kills the caster."
        },
        randommessage: {
            aliases: ["randommsg", "rmsg", "rm"],
            description: "Sends a random message to the target player."
        },
        modifyglobalscore: {
            aliases: ["mgs"],
            description: ""
        },
        throw: {
            aliases: [],
            description: "Throws the target entity."
        },
        removeHeldItem: {
            aliases: ["consumeHeldItem", "takeHeldItem"],
            description: "Removes an amount of the target's held item."
        },
        togglelever: {
            aliases: ["lever"],
            description: "Toggles a lever at the target location."
        },
        tagremove: {
            aliases: ["removetag", "removescoreboardtag"],
            description: "Removes a scoreboard tag from the target entity."
        },
        disguisemodify: {
            aliases: ["modifydisguise"],
            description: "Disguises the target entity."
        },
        "effect:geyser": {
            aliases: ["geyser", "e:geyser"],
            description: "Creates a geyser at the target location."
        },
        "effect:explosion": {
            aliases: ["e:explosion", "effect:explode", "e:explode"],
            description: "Causes an explosion effect at the target location."
        },
        sudoskill: {
            aliases: ["sudo"],
            description: "Forces the inherited target to execute the skill at the targeted entity."
        },
        raytraceTo: {
            aliases: [],
            description: "Executes a skill with the result of a raytrace to the target location."
        },
        posearmorstand: {
            aliases: ["armorstandpose"],
            description: "Poses the target armor stand."
        },
        breakBlockAndGiveItem: {
            aliases: ["blockBreakAndGiveItem"],
            description: "Breaks the block at the target location."
        },
        pull: {
            aliases: [],
            description: "Pulls the target entity towards the caster."
        },
        raytrace: {
            aliases: [],
            description: "Executes a skill with the result of a raytrace."
        },
        undisguise: {
            aliases: ["disguiseRemove"],
            description: "Removes a disguise from the target entity."
        },
        propel: {
            aliases: [],
            description: "Propels the caster towards the target."
        },
        oxygen: {
            aliases: [],
            description: "Gives the target player oxygen."
        },
        gcd: {
            aliases: ["globalcooldown", "setgcd", "setglobalcooldown"],
            description: "Triggers the global cooldown for the caster."
        },
        remount: {
            aliases: [],
            description: "Causes the caster to remount their mount."
        },
        teleport: {
            aliases: ["tp"],
            description: "Teleports to the target location."
        },
        freeze: {
            aliases: [],
            description: "Chills the target entity."
        },
        damagePercent: {
            aliases: ["percentDamage"],
            description: "Deals a percentage of the target's health in damage."
        },
        removeowner: {
            aliases: ["clearowner"],
            description: ""
        },
        variableSetLocation: {
            aliases: ["setVariableLocation", "setVarLoc"],
            description: "Sets a variable to the given location."
        },
        setfaction: {
            aliases: [],
            description: "Sets the target mob's faction."
        },
        forcepull: {
            aliases: [],
            description: "Teleports the target entity to the caster."
        },
        modifymobscore: {
            aliases: ["mms"],
            description: ""
        },
        cancelEvent: {
            aliases: [],
            description: "Cancels the calling event."
        },
        look: {
            aliases: [],
            description: "Forces the caster to look at the target location."
        },
        threatclear: {
            aliases: ["clearthreat"],
            description: "Clears the caster's threat table."
        },
        delay: {
            aliases: [],
            description: "Delays the execution of the next mechanic."
        },
        speak: {
            aliases: ["speech"],
            description: "Makes the caster speak using chat and speech bubbles."
        },
        cquip: {
            aliases: [],
            description: "Causes the caster to cquip an item or droptable."
        },
        rally: {
            aliases: ["callforhelp"],
            description: "Calls for nearby entities to attack the target."
        },
        arrowvolley: {
            aliases: [],
            description: "Shoots a volley of arrows.",
            fields: {
                amount: {
                    ...templates.int,
                    description: "The amount of arrows to shoot.",
                    placeholder: 20
                },
                spread: {
                    ...templates.int,
                    description: "How spread out the arrows are.",
                    placeholder: 45
                },
                fireTicks: {
                    ...templates.int,
                    description: "How long the arrows should be on fire for.",
                    placeholder: 0
                },
                velocity: {
                    ...templates.float,
                    description: "How fast the arrows should travel.",
                    placeholder: 20.0
                },
                removeDelay: {
                    ...templates.int,
                    description: "How long the arrows should last for before they are removed.",
                    placeholder: 200
                }
            }
        },
        setcollidable: {
            aliases: [],
            description: "Sets whether the mob is collidable."
        },
        ignite: {
            aliases: [],
            description: "Sets the target entity on fire."
        },
        pushbutton: {
            aliases: ["buttonpush"],
            description: "Pushes a button at the target location."
        },
        cast: {
            aliases: [],
            description: "Casts a metaskill with various options."
        },
        enderDragonResetCrystals: {
            aliases: ["resetEnderResetCrystals"],
            description: "Generates the EnderDragon crystals."
        },
        dismount: {
            aliases: [],
            description: "Dismounts the target entity."
        },
        barSet: {
            aliases: [],
            description: "Sets the display values on a custom bossbar.",
            fields: prefilledFields.barFields
        },
        leap: {
            aliases: [],
            description: "Causes the caster to leap to the target location."
        },
        remove: {
            aliases: [],
            description: "Removes the target entity from existence."
        },
        runaitargetselector: {
            aliases: ["aitarget"],
            description: "Modify an AI Target Selector of the caster."
        },
        setscore: {
            aliases: [],
            description: "Sets a scoreboard value."
        },
        setgamemode: {
            aliases: [],
            description: "Sets the gamemode of the target player."
        },
        disengage: {
            aliases: [],
            description: "Causes the caster to leap backwards away from the target entity."
        },
        enderDragonSpawnPortal: {
            aliases: ["spawnEnderDragonPortal"],
            description: "Sets the game phase on an EnderDragon."
        },
        setNoDamageTicks: {
            aliases: ["setimmunityticks"],
            description: "Sets damage immunity ticks on the target entity."
        },
        mountme: {
            aliases: [],
            description: "Causes the ctarget entity to mount the caster."
        },
        bouncy: {
            aliases: [],
            description: "Applies an aura to the target that makes it bouncy."
        },
        ondeath: {
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they die."
        },
        lunge: {
            aliases: [],
            description: "Causes the caster to lunge forward at the target."
        },
        disguise: {
            aliases: [],
            description: "Disguises the target entity."
        },
        ondamaged: {
            aliases: [],
            description: "Applies an aura to the target that triggers a skill when they take damage."
        },
        equip: {
            aliases: [],
            description: "Causes the caster to equip an item or droptable."
        },
        setpitch: {
            aliases: [],
            description: "Modifies the head pitch of the target entity."
        }
    },
    targeters: {
        projectileforward: {
            aliases: [""],
            description: "Targets a point in front of the casting projectile."
        },
        ringAroundOrigin: {
            aliases: ["ringOrigin", "RAO"],
            description: "Targets points in a ring around the skill origin."
        },
        forwardwall: {
            aliases: [],
            description: "Targets a plane in front of the caster."
        },
        trackedLocation: {
            aliases: [],
            description: "Targets the caster's tracked location."
        },
        locationsOfTargets: {
            aliases: ["locationOfTarget", "LOT"],
            description: "Targets the location of the inherited targets."
        },
        trigger: {
            aliases: [],
            description: "Targets the entity that triggered the skill."
        },
        targetedTarget: {
            aliases: ["targeted"],
            description: "Targets the inherited targets."
        },
        livingInLine: {
            aliases: ["entitiesInLine", "livingEntitiesInLine", "LEIL", "EIL"],
            description: "Targets random points in a cone shape."
        },
        selfEyeLocation: {
            aliases: ["eyeDirection", "casterEyeLocation", "bossEyeLocation", "mobEyeLocation"],
            description: "Targets the location of the caster."
        },
        livingNearTargetLocation: {
            aliases: ["LNTL", "ENTL", "ENT"],
            description: "Targets entities near the target location."
        },
        blocksinradius: {
            aliases: [],
            description: "Targets all blocks in the radius of the inherited target."
        },
        entitiesNearOrigin: {
            aliases: ["NearOrigin", "ENO"],
            description: "Targets entities near the origin."
        },
        owner: {
            aliases: [],
            description: "Targets the caster's owner."
        },
        randomLocationsNearTargets: {
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
            aliases: ["RLO", "randomLocationsOrigin", "RLNO"],
            description: "Targets random locations near the caster."
        },
        playerByName: {
            aliases: ["specificplayer"],
            description: "Targets a specific player by name."
        },
        ring: {
            aliases: [],
            description: "Targets points in a ring around the caster."
        },
        itemsInRadius: {
            aliases: ["IIR"],
            description: "Gets all items in a radius around the caster."
        },
        obstructingBlock: {
            aliases: [],
            description: "Tries to target blocks in front of the caster that are obstructing it."
        },
        randomThreatTargetLocation: {
            aliases: ["RTTL"],
            description: "Targets the location of a random entity on the caster's threat table."
        },
        livingInCone: {
            aliases: ["entitiesInCone", "livingEntitiesInCone", "LEIC", "EIC"],
            description: "Targets random points in a cone shape."
        },
        mount: {
            aliases: ["vehicle"],
            description: "Targets the caster's mount."
        },
        self: {
            aliases: ["caster", "boss", "mob"],
            description: "Targets the caster."
        },
        mother: {
            aliases: ["mommy", "mom"],
            description: ""
        },
        floorOfTargets: {
            aliases: ["floorsOfTarget", "FOT"],
            description: "Targets the first solid block below the inherited targets."
        },
        children: {
            aliases: ["child", "summons"],
            description: "Targets any child entities summoned by the caster."
        },
        entitiesInRadius: {
            aliases: ["livingEntitiesInRadius", "livingInRadius", "allInRadius", "EIR"],
            description: "Targets entities around the caster."
        },
        UniqueIdentifier: {
            aliases: ["uuid"],
            description: "Targets a specific entity with that uuid."
        },
        origin: {
            aliases: ["source"],
            description: "Targets the origin of the current skill."
        },
        cone: {
            aliases: [],
            description: "Targets random points in a cone in front of the caster."
        },
        siblings: {
            aliases: ["sibling", "brothers", "sisters"],
            description: "Targets any child entities summoned by the caster's parent."
        },
        targetedLocation: {
            aliases: ["targetedLocations", "targetedLoc"],
            description: "Targets the location the caster is targeting."
        },
        selfLocation: {
            aliases: ["casterLocation", "bossLocation", "mobLocation"],
            description: "Targets the location of the caster."
        },
        notLivingNearOrigin: {
            aliases: ["NLNO", "nonLivingNearOrigin"],
            description: "Targets non living entities near origin."
        },
        targetBlock: {
            aliases: [],
            description: "Targets the block the caster is targeting."
        },
        randomLocationsNearCaster: {
            aliases: ["RLNC", "randomLocations"],
            description: "Targets random locations near the caster."
        },
        playersInRadius: {
            aliases: ["PIR"],
            description: "Targets the players in a radius around the caster."
        },
        target: {
            aliases: ["T"],
            description: "Targets the caster's target."
        },
        variableLocation: {
            aliases: ["varLocation"],
            description: "Targets the location stored in a variable."
        },
        father: {
            aliases: ["dad", "daddy"],
            description: ""
        },
        nearestStructure: {
            aliases: [],
            description: "Targets the nearest structure."
        },
        parent: {
            aliases: ["summoner"],
            description: "Targets the caster's parent/summoner."
        },
        playersOnServer: {
            aliases: ["server"],
            description: "Targets all players on the server."
        },
        targetLocation: {
            aliases: ["targetLoc", "TL"],
            description: "Targets the location the caster is targeting."
        },
        itemsNearOrigin: {
            aliases: ["INO"],
            description: "Gets all items in a radius around the origin."
        },
        randomRingPoint: {
            aliases: [],
            description: "Targets random points in a ring around the caster."
        },
        triggerlocation: {
            aliases: [],
            description: "Targets the location of the entity that triggered the skill."
        },
        blocksnearorigin: {
            aliases: [],
            description: "Targets all blocks in the radius around the origin."
        },
        entitiesInRing: {
            aliases: ["EIRR"],
            description: "Targets all entities in a ring."
        },
        spawnLocation: {
            aliases: [],
            description: "Targets the caster's spawn location."
        },
        spawners: {
            aliases: [],
            description: "Targets the location of specified mob spawners."
        },
        forward: {
            aliases: [],
            description: "Targets a point in front of the caster."
        },
        line: {
            aliases: [],
            description: "Targets points in a line from the caster to the target location."
        },
        sphere: {
            aliases: [],
            description: "Targets points in a sphere around the caster."
        },
        casterSpawnLocation: {
            aliases: ["casterSpawn"],
            description: "Targets the caster's spawn location."
        },
        blocksinchunk: {
            aliases: [],
            description: "Targets all blocks in the targeted chunk."
        }
    },
    conditions: {
        hasoffhand: {
            aliases: ["offhand"],
            description: "Tests if the target entity has something in offhand."
        },
        onBlock: {
            aliases: [],
            description: "Matches the block the target entity is standing on."
        },
        variableIsSet: {
            aliases: ["varisset", "varset"],
            description: "Checks if the given variable is set."
        },
        itemissimilar: {
            aliases: ["issimilar", "similarto"],
            description: "Checks if the ItemStack is similar."
        },
        playerNotWithin: {
            aliases: ["playersnotwithin"],
            description: "Checks if any players are within a radius of the target."
        },
        bowTension: {
            aliases: ["bowshoottension"],
            description: ""
        },
        dawn: {
            aliases: [],
            description: "If the time is dawn, from 22000 to 2000 in-game time."
        },
        enchantingExperience: {
            aliases: ["enchantingExp", "enchantExperience", "enchantExp"],
            description: "Tests the target's enchanting experience."
        },
        sunny: {
            aliases: ["issunny"],
            description: "If the weather is sunny in the target world."
        },
        notInRegion: {
            aliases: [],
            description: "If the target location is not within the given WorldGuard region."
        },
        owner: {
            aliases: [],
            description: "Checks if the target entity is the owner of the caster."
        },
        variableInRange: {
            aliases: ["varinrange", "varrange"],
            description: "Checks if the given numeric variable is within a certain range."
        },
        thundering: {
            aliases: ["stormy", "isthundering", "isstormy"],
            description: "If it's thundering in the target world."
        },
        samefaction: {
            aliases: ["factionsame"],
            description: "Tests if the target is in the same faction as the caster."
        },
        distance: {
            aliases: [],
            description: "Whether the distance between the caster and target is within the given range."
        },
        size: {
            aliases: ["mobSize"],
            description: "Checks against the entity's size."
        },
        isplayer: {
            aliases: [],
            description: "If the target is a player."
        },
        fieldOfView: {
            aliases: ["infieldofview", "fov"],
            description: "Tests if the target is within the given angle from where the caster is looking."
        },
        worldtime: {
            aliases: [],
            description: "Matches a range against the target location's world's time."
        },
        fallSpeed: {
            aliases: ["fallingspeed"],
            description: "If the fall speed of the target is within the given range."
        },
        premium: {
            aliases: ["ispremium", "iscool"],
            description: "Whether or not premium is enabledd."
        },
        nearClaim: {
            aliases: ["nearClaims"],
            description: "If the target location is near any GriefPrevention claims."
        },
        distanceFromSpawn: {
            aliases: [],
            description: "Whether the distance from the world's spawn point to the target is within the given range."
        },
        hasAI: {
            aliases: [],
            description: "Tests if target has AI."
        },
        sprinting: {
            aliases: ["issprinting"],
            description: "Whether or not the target entity is sprinting. Only works on players."
        },
        moving: {
            aliases: ["ismoving"],
            description: "If the target has a velocity greater than zero."
        },
        isClimbing: {
            aliases: ["climbing"],
            description: "If the target is climbing."
        },
        name: {
            aliases: ["castername"],
            description: "Checks against the entity's name."
        },
        crouching: {
            aliases: ["sneaking", "iscrouching", "issneaking"],
            description: "Whether or not the target entity is crouching."
        },
        iscaster: {
            aliases: [],
            description: "If the target is the caster of the skill."
        },
        lastSignal: {
            aliases: [],
            description: "Matches the last signal received by the target mob."
        },
        wearing: {
            aliases: ["iswearing", "wielding", "iswielding"],
            description: "Tests what the target entity has equipped."
        },
        lunarPhase: {
            aliases: [],
            description: "Checks the target world's lunar phase."
        },
        variableEquals: {
            aliases: ["variableeq", "varequals", "vareq"],
            description: "Checks if the given variable has a particular value."
        },
        faction: {
            aliases: [],
            description: "Tests the target's faction."
        },
        parent: {
            aliases: ["isParent"],
            description: "Checks if the target entity is the parent/summoner of the caster."
        },
        yaw: {
            aliases: [],
            description: "Checks the yaw of the target entity against a range."
        },
        mobsinworld: {
            aliases: [],
            description: "Matches a range to how many mobs are in the target world."
        },
        onGround: {
            aliases: ["grounded"],
            description: "If the target entity is standing on solid ground."
        },
        distanceFromTrackedLocation: {
            aliases: ["distanceFromTL"],
            description: "Tests if the caster is within a certain distance of its tracked location."
        },
        hasTag: {
            aliases: ["hasScoreboardTag"],
            description: "Tests if the target has a scoreboard tag."
        },
        playerKills: {
            aliases: [],
            description: "Matches how many players the target mob has killed."
        },
        inblock: {
            aliases: ["insideblock"],
            description: "Checks the material at the target location."
        },
        hasAuraStacks: {
            aliases: ["hasbuffstacks", "hasdebuffstacks", "aurastacks", "buffstacks", "debuffstacks"],
            description: "Tests if the target has the given range of stacks from an aura."
        },
        foodSaturation: {
            aliases: ["hungerSaturation"],
            description: "Matches the target's food saturation level."
        },
        IsLeashed: {
            aliases: [],
            description: "If the target is leashed."
        },
        heightAbove: {
            aliases: [],
            description: "Checks if the target's Y location is above a value."
        },
        stringEquals: {
            aliases: ["stringEq"],
            description: "Checks if value1 equals value2. Both values can use variables and placeholders."
        },
        children: {
            aliases: [],
            description: "Tests how many children the caster has."
        },
        incombat: {
            aliases: [],
            description: "If the target mob is considered in combat."
        },
        foodlevel: {
            aliases: ["hunger", "food", "hungerlevel"],
            description: "Matches the target's food level."
        },
        hasAura: {
            aliases: ["hasbuff", "hasdebuff"],
            description: "Checks if the target entity has the given aura."
        },
        cuboid: {
            aliases: ["incuboid"],
            description: "Whether the target is within the given cuboid between location1 x location2."
        },
        skillOnCooldown: {
            aliases: [],
            description: "Whether the caster has the specified skill on cooldown."
        },
        inClaim: {
            aliases: ["inclaim"],
            description: "If the target location is inside a GriefPrevention claim."
        },
        biometype: {
            aliases: ["biomecategory"],
            description: "Tests if the target is within the given list of biome types."
        },
        isInSurvivalMode: {
            aliases: ["inSurvivalMode"],
            description: "If the target is in survival mode."
        },
        dusk: {
            aliases: [],
            description: "If the time is dusk, from 14000 to 18000 in-game time."
        },
        hasCurrency: {
            aliases: ["hasmoney"],
            description: "If the target has the given amount of vault currency."
        },
        color: {
            aliases: ["clr"],
            description: "Checks for entity's color."
        },
        targetInLineOfSight: {
            aliases: [],
            description: "Tests if the target has line of sight to their target."
        },
        health: {
            aliases: ["hp"],
            description: "Matches the target's health."
        },
        burning: {
            aliases: ["isburning", "isonfire"],
            description: "Whether or not the target entity is on fire."
        },
        targetnotwithin: {
            aliases: [],
            description: "Tests if the target's target is not within a certain distance."
        },
        vehicleisdead: {
            aliases: [],
            description: "If the target's vehicle is dead."
        },
        altitude: {
            aliases: ["heightfromsurface"],
            description: "Tests how far above the ground the target entity is."
        },
        entityMaterialType: {
            aliases: [],
            description: "Tests the material type of the target item entity."
        },
        gliding: {
            aliases: ["isgliding"],
            description: "If the target is gliding."
        },
        globalscore: {
            aliases: ["scoreglobal"],
            description: "Checks a global scoreboard value."
        },
        mounted: {
            aliases: [],
            description: "If the target entity is riding a mount/vehicle."
        },
        isRaiderPatrolLeader: {
            aliases: ["isPatrolLeader"],
            description: "Checks if the target entity is the captain of a pillager group."
        },
        isCreeperPrimed: {
            aliases: [],
            description: "If the target creeper is primed to explode."
        },
        score: {
            aliases: [],
            description: "Checks a scoreboard value of the target entity."
        },
        plugin: {
            aliases: ["pluginexists", "hasplugin"],
            description: "Whether or not a specific plugin exists."
        },
        dimension: {
            aliases: ["environment"],
            description: "Tests if the target is within a certain dimension."
        },
        charged: {
            aliases: ["isCharged", "creeperCharged"],
            description: "Whether or not the creeper is charged."
        },
        HasItem: {
            aliases: [],
            description: "Checks the inventory for this item."
        },
        targetNotInLineOfSight: {
            aliases: [],
            description: "Tests if the target doesn't have line of sight to their target."
        },
        ydiff: {
            aliases: [],
            description: "Whether the y-difference between the caster and target is within the given range."
        },
        mobsinchunk: {
            aliases: [],
            description: "Matches a range to how many mobs are in the target location's chunk."
        },
        lightLevelfromblocks: {
            aliases: ["blocklightlevel"],
            description: "Tests the light level at the target location."
        },
        haspassenger: {
            aliases: [],
            description: "If the target entity has a passenger."
        },
        haspermission: {
            aliases: ["permission"],
            description: "Tests if the target player has a permission."
        },
        entityitemissimilar: {
            aliases: [],
            description: "Tests if the item entity is similar to an itemstack."
        },
        inside: {
            aliases: [],
            description: "Checks if the target has a block over their head."
        },
        DamageAmount: {
            aliases: [],
            description: "Checks the damage amount that caused the current skill tree. Only works with onDamaged trigger or aura."
        },
        blockType: {
            aliases: [],
            description: "Tests the material type present at the target location."
        },
        velocity: {
            aliases: [],
            description: "Checks the velocity of the target entity against a range."
        },
        lightLevel: {
            aliases: [],
            description: "Tests the light level at the target location."
        },
        lineOfSight: {
            aliases: ["inlineofsight"],
            description: "Tests if the target is within line of sight of the caster."
        },
        ischild: {
            aliases: ["child"],
            description: "If the target is a child of the caster."
        },
        entityType: {
            aliases: ["mobtype"],
            description: "Tests the entity type of the target."
        },
        mythicMobType: {
            aliases: ["mmType"],
            description: "Checks the MythicMob type of the target mob."
        },
        raining: {
            aliases: ["israining"],
            description: "If it's raining in the target world."
        },
        lastDamageCause: {
            aliases: [],
            description: "Checks the target's last damage cause."
        },
        level: {
            aliases: [],
            description: "Checks the target MythicMob's level."
        },
        region: {
            aliases: ["inregion"],
            description: "If the target is within the given WorldGuard region."
        },
        hasInventorySpace: {
            aliases: [],
            description: "If the target has empty inventory space."
        },
        blocking: {
            aliases: ["isblocking"],
            description: "Tests if the target entity is blocking with a shield."
        },
        biome: {
            aliases: [],
            description: "Tests if the target is within the given list of biomes."
        },
        entityItemType: {
            aliases: [],
            description: "Tests the item type of the target item entity."
        },
        playersInRadius: {
            aliases: ["pir", "playerInRadius"],
            description: "Checks for a given number of players within a radius of the target."
        },
        stance: {
            aliases: [],
            description: "Checks the stance of the target mob."
        },
        ismonster: {
            aliases: [],
            description: "If the target is a monster."
        },
        outside: {
            aliases: [],
            description: "If the target has open sky above them."
        },
        playerWithin: {
            aliases: ["playerswithin"],
            description: "Checks if any players are within a radius of the target."
        },
        lineOfSightFromOrigin: {
            aliases: ["inlineofsightfromorigin"],
            description: "Tests if the target is within line of sight of the origin."
        },
        enderdragonPhase: {
            aliases: ["edragonPhase"],
            description: "Tests the phase of the target EnderDragon."
        },
        mobsinradius: {
            aliases: [],
            description: "Matches a range to how many mobs are in the given radius."
        },
        hasEnchantment: {
            aliases: ["hasEnchant"],
            description: "Tests if the target entity has an equipped enchantment."
        },
        holding: {
            aliases: [],
            description: "Checks if the target is holding a given material."
        },
        day: {
            aliases: [],
            description: "If the time is day, from 2000 to 10000 in-game time."
        },
        motionx: {
            aliases: ["motx"],
            description: "Checks the X motion of the target entity against a range."
        },
        motiony: {
            aliases: ["moty"],
            description: "Checks the Y motion of the target entity against a range."
        },
        targetWithin: {
            aliases: [],
            description: "Tests if the target's target is within a certain distance."
        },
        motionz: {
            aliases: ["motz"],
            description: "Checks the Z motion of the target entity against a range."
        },
        localdifficulty: {
            aliases: [],
            description: "Tests the difficulty scale at the target location."
        },
        night: {
            aliases: [],
            description: "If the time is night, from 14000 to 22000 in-game time."
        },
        hasPotionEffect: {
            aliases: ["hasPotion"],
            description: "Tests if the target entity has a potion effect."
        },
        world: {
            aliases: [],
            description: "Checks the name of the target world."
        },
        heightBelow: {
            aliases: [],
            description: "Checks if the target's Y location is below a given value."
        },
        pitch: {
            aliases: [],
            description: "Checks if the pitch of the target entity is within a range."
        },
        enchantingLevel: {
            aliases: [],
            description: "Tests the target's enchanting level."
        },
        hasgravity: {
            aliases: ["gravity"],
            description: "Tests if the target has gravity."
        },
        hasOwner: {
            aliases: [],
            description: "Tests if the target mob has an owner."
        },
        DamageCause: {
            aliases: [],
            description: "Checks the damage cause of the current skill tree. Only works with onDamaged trigger or aura."
        },
        isFrozen: {
            aliases: [],
            description: "Tests if the target is fully frozen."
        },
        livinginradius: {
            aliases: [],
            description: "Matches a range to how many living entities are in the given radius."
        },
        MythicKeyId: {
            aliases: ["keyid"],
            description: "Tests for the mythic key id that was pressed/released."
        },
        ownerIsOnline: {
            aliases: [],
            description: "Checks if the owner of the target mob is online, if the owner is a player."
        },
        isNaturalBlock: {
            aliases: [],
            description: "Checks if the target block was naturally generated."
        },
        itemRecharging: {
            aliases: [],
            description: "Checks if the target's weapon is recharging."
        },
        hasParent: {
            aliases: [],
            description: "Tests if the target mob has a parent."
        },
        isliving: {
            aliases: [],
            description: "If the target is living."
        },
        height: {
            aliases: [],
            description: "Checks if the target's Y location is within a range."
        },
        offGCD: {
            aliases: [],
            description: "Checks if the target mob has an active Global Cooldown."
        },
        targets: {
            aliases: [],
            description: "Tests if the number of inherited targets from the parent skilltree matches the given range."
        }
    }
};
