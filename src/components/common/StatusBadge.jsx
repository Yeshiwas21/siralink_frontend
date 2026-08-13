import { useTranslation } from "react-i18next";

const STATUS_STYLES = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    verified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    unverified: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    rejected: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
};

export function StatusBadge({ status }) {
    const { t } = useTranslation();
    const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
    return (
        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap ${cls}`}>
            {t(`verification_status.${status}`)}
        </span>
    );
}

export default StatusBadge;