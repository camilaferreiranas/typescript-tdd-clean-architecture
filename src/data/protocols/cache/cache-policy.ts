export class CachePolicy {

    private static maxAgeInDays = 3;
    private constructor() {
    }

    static validate(timestamp: Date, currentDate: Date): boolean {
        const maxAge = new Date(timestamp);
        maxAge.setDate(maxAge.getDate() + CachePolicy.maxAgeInDays);
        return maxAge > currentDate;
    }
}