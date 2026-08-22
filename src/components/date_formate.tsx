export function formatDate(date: string | Date = new Date(), format: string = "d, m Y - h:i A"): string {
    const parseDate = (input: string | Date): Date => new Date(input);
    const pad = (num: number) => num.toString().padStart(2, "0");

    const currentDate = typeof date === "string" ? parseDate(date) : date;

    const replacements: Record<string, string> = {
        Y: currentDate.getFullYear().toString(),
        m: pad(currentDate.getMonth() + 1),
        d: pad(currentDate.getDate()),
        H: pad(currentDate.getHours()),
        h: pad(currentDate.getHours() % 12 || 12),
        i: pad(currentDate.getMinutes()),
        s: pad(currentDate.getSeconds()),
        a: currentDate.getHours() >= 12 ? "pm" : "am",
        A: currentDate.getHours() >= 12 ? "PM" : "AM",
    };

    return format.replace(/Y|m|d|H|h|i|s|a|A/g, (match) => replacements[match]);
}
