// place files you want to import through the `$lib` alias in this folder.


export function toCapacity(value: number, type: "bytes" | "mib" | "gib" | "tib" | "pib" | "eib" | "zib" | "yib" = "bytes"): string {
    const bytes = type === "mib" 
        ? value * 1024 * 1024 
        : type === "gib" ? value * 1024 * 1024 * 1024 
        : type === "tib" ? value * 1024 * 1024 * 1024 * 1024
        : value;

    const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const index = bytes > 0 ? Math.floor(Math.log(bytes) / Math.log(1024)) : 0;
    const normalized = bytes / Math.pow(1024, index);
    
    return Number(normalized.toFixed(2)) + " " + units[index];
}