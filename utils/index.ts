export function shuffle(arr: any[]): any[] {
    return arr.sort(() => Math.random() - 0.5);
    }