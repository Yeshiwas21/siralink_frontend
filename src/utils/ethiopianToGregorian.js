// src/utils/ethiopianToGregorian.js

/**
 * Converts an Ethiopian date string (YYYY-MM-DD) into a Gregorian date string (YYYY-MM-DD)
 * for backend compatibility.
 * 
 * @param {string} ethDateStr - Ethiopian date formatted as "YYYY-MM-DD"
 * @returns {string} Gregorian date formatted as "YYYY-MM-DD"
 */
export const ethiopianToGregorian = (ethDateStr) => {
    if (!ethDateStr) return "";

    const [ethYear, ethMonth, ethDay] = ethDateStr.split("-").map(Number);
    if (!ethYear || !ethMonth || !ethDay) return "";

    let totalDays = 0;

    // Calculate days relative to reference year 2000 EC
    if (ethYear >= 2000) {
        for (let y = 2000; y < ethYear; y++) {
            totalDays += (y + 1) % 4 === 0 ? 366 : 365;
        }
    } else {
        for (let y = ethYear; y < 2000; y++) {
            totalDays -= (y + 1) % 4 === 0 ? 366 : 365;
        }
    }

    totalDays += (ethMonth - 1) * 30 + (ethDay - 1);

    // 2000-01-01 EC corresponds to 2007-09-12 GC
    const refDate = new Date(Date.UTC(2007, 8, 12));
    refDate.setUTCDate(refDate.getUTCDate() + totalDays);

    const gYear = refDate.getUTCFullYear();
    const gMonth = String(refDate.getUTCMonth() + 1).padStart(2, "0");
    const gDay = String(refDate.getUTCDate()).padStart(2, "0");

    return `${gYear}-${gMonth}-${gDay}`;
};