export function StatCard({ title, value, icon, color = "amber" }) {
    const colorMap = {
        amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        yellow: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
        blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
        green: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300",
        red: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
        purple: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300",
        gray: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
    };

    return (
        <div className="w-full bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-100 dark:border-gray-700 p-5 flex items-center justify-between transition-colors">
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400"> {title}
                </p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {value}
                </h2>
            </div>

            <div className={`p-3 rounded-xl ${colorMap[color] || colorMap.amber}`}>
                {icon}
            </div>
        </div>
    );
}
export default StatCard;