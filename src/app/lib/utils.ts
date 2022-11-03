export function sanitizeTrackerMarkdown(input: string) {
    // remove all images from markdown markup like the following:
    // ![image.png](/ajax/v2/attachments/14?inline=true =x400)
    return input.replace(/\s*!\[[^\]]+\]\([^)]+\)\s*\n?\s*/g, '');
}
