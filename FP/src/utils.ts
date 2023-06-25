export const W = 'w'
export const A = 'a'
export const S = 's'
export const D = 'd'
export const SPACE = 'space'
export const SHIFT = 'shift'
export const B = 'b';
export const F = 'f';
export const DIRECTIONS = [W, A, S, D]

export class KeyDisplay {

    map: Map<string, HTMLDivElement> = new Map()

    constructor() {
        const w: HTMLDivElement = document.createElement("div")
        const a: HTMLDivElement = document.createElement("div")
        const s: HTMLDivElement = document.createElement("div")
        const d: HTMLDivElement = document.createElement("div")
        const shift: HTMLDivElement = document.createElement("div")
        const space: HTMLDivElement = document.createElement("div")
        const b: HTMLDivElement = document.createElement("div")
        const f: HTMLDivElement = document.createElement("div")


        this.map.set(W, w)
        this.map.set(A, a)
        this.map.set(S, s)
        this.map.set(D, d)
        this.map.set(SHIFT, shift)
        this.map.set(SPACE, space)
        this.map.set(B,b);
        this.map.set(F,f);
    }



}