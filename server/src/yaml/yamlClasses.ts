import * as yaml from "yaml";

export interface YAMLValue {
    readonly value: any;
    toString(): string;
    acceptString(str: string): boolean;
    getBaseObject(): any;
}

export const getValue = (value: YAMLValue) => value.value;

export class YAMLNumber implements YAMLValue {
    constructor(public readonly value: number) {}
    public toString() {
        return this.value.toString();
    }
    public acceptString(str: string): boolean {
        return !isNaN(Number(str));
    }
    public getBaseObject() {
        return this.value;
    }
}

export class YAMLString implements YAMLValue {
    constructor(public readonly value: string) {}
    public toString() {
        return this.value;
    }
    public acceptString(str: string): boolean {
        return true;
    }
    public getBaseObject() {
        return this.value;
    }
}

export class YAMLBoolean implements YAMLValue {
    constructor(public readonly value: boolean) {}
    public toString() {
        return this.value.toString();
    }
    public acceptString(str: string): boolean {
        return str === "true" || str === "false";
    }
    public getBaseObject() {
        return this.value;
    }
}

export class YAMLNull implements YAMLValue {
    public readonly value = null;
    constructor() {}
    public toString() {
        return "null";
    }
    public acceptString(str: string): boolean {
        return str === "null";
    }
    public getBaseObject() {
        return this.value;
    }
}

export class YAMLArray implements YAMLValue {
    constructor(public readonly value: YAMLValue[]) {}
    public toString() {
        return this.value.map((v) => v.getBaseObject()).join(", ");
    }
    public acceptString(str: string): boolean {
        return yaml.parse(str) instanceof Array;
    }
    public getBaseObject() {
        return this.value.map((v) => v.getBaseObject());
    }
}

export class YAMLMap implements YAMLValue {
    constructor(public readonly value: { [key: string]: YAMLValue }) {}
    public toString() {
        return yaml.stringify(this.getBaseObject());
    }
    public acceptString(str: string): boolean {
        return yaml.parse(str) instanceof Object;
    }
    public getBaseObject() {
        return Object.fromEntries(Object.entries(this.value).map(([key, value]) => [key, value.getBaseObject()]));
    }
}

export type YAMLBaseType = number | string | boolean | null | YAMLBaseType[] | { [key: string]: YAMLBaseType };

export const toYaml = (value: YAMLBaseType): YAMLValue => {
    if (typeof value === "number") {
        return new YAMLNumber(value);
    }
    if (typeof value === "string") {
        return new YAMLString(value);
    }
    if (typeof value === "boolean") {
        return new YAMLBoolean(value);
    }
    if (value === null) {
        return new YAMLNull();
    }
    if (value instanceof Array) {
        return new YAMLArray(value.map((v) => toYaml(v)));
    }
    if (value instanceof Object) {
        return new YAMLMap(Object.fromEntries(Object.entries(value).map(([key, value]) => [key, toYaml(value)])));
    }
    throw new Error("Invalid YAMLBaseType");
};

// test
const test = new YAMLMap({
    test: toYaml("test"),
    test2: toYaml(2),
    test3: toYaml(true),
    test4: toYaml(null),
    test5: toYaml(["test", 2, true, null]),
    test6: toYaml({
        test: "test",
        test2: 2,
        test3: true,
        test4: null,
        test5: ["test", 2, true, null]
    })
});

console.log(test.getBaseObject());
