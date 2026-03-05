export default function SinceUpdated(dateStr: string): string {
    let diff: number;
    try {
        diff = Date.now() - new Date(dateStr).getTime();
        if (isNaN(diff)) throw new Error();
    } catch {
        return "unknown";
    }

    const mins = Math.floor(diff / 60_000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}