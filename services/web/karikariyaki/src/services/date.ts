import { DateTime } from "luxon";

export class DateService {
    public static standarizeCurrentDate(targetDate = new Date()): Date {
        const standarizedDate = new Date(targetDate.getTime());

        standarizedDate.setHours(0, 0, 0, 0);

        return standarizedDate;
    }

    public static isToday(target: Date): boolean {
        const splittedTarget = DateService.splitISODate(target.toISOString());
        const splittedNow = DateService.splitISODate(
            DateTime.fromISO(DateTime.now().toISO().split("T")[0])
                .setZone("America/Sao_Paulo")
                .toISO()
        );

        if (splittedTarget[0] !== splittedNow[0]) {
            return false;
        }

        if (splittedTarget[1] !== splittedNow[1]) {
            return false;
        }

        return splittedTarget[2] === splittedNow[2];
    }

    private static splitISODate(target: string): string[] {
        /**
         * Date format: YYYY-MM-DD
         * Result: [YYYY, MM, DD]
         */
        return target.split("T")[0].split("-");
    }
}
