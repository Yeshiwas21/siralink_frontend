/**
 * Converts a Gregorian date string (YYYY-MM-DD) into an Ethiopian date string (YYYY-MM-DD).
 * 
 * @param {string} gDateStr - Gregorian date formatted as "YYYY-MM-DD"
 * @returns {string} Ethiopian date formatted as "YYYY-MM-DD"
 */
export const gregorianToEthiopian = (gDateStr) => {
    if (!gDateStr) return "";

    const [gYear, gMonth, gDay] = gDateStr.split("-").map(Number);
    if (!gYear || !gMonth || !gDay) return "";

    // Target date in UTC
    const targetDate = new Date(Date.UTC(gYear, gMonth - 1, gDay));

    // Reference point: 2007-09-12 GC = 2000-01-01 EC
    const refDate = new Date(Date.UTC(2007, 8, 12));

    // Total days difference between target and reference date
    let totalDays = Math.round((targetDate - refDate) / (1000 * 60 * 60 * 24));

    let ethYear = 2000;

    if (totalDays >= 0) {
        while (true) {
            const yearDays = (ethYear + 1) % 4 === 0 ? 366 : 365;
            if (totalDays < yearDays) break;
            totalDays -= yearDays;
            ethYear++;
        }
    } else {
        while (totalDays < 0) {
            ethYear--;
            const yearDays = (ethYear + 1) % 4 === 0 ? 366 : 365;
            totalDays += yearDays;
        }
    }

    const ethMonth = Math.floor(totalDays / 30) + 1;
    const ethDay = (totalDays % 30) + 1;

    const formattedMonth = String(ethMonth).padStart(2, "0");
    const formattedDay = String(ethDay).padStart(2, "0");

    return `${ethYear}-${formattedMonth}-${formattedDay}`;
};