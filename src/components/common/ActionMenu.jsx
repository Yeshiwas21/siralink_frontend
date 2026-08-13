import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { Eye, Edit, Printer, Trash2, MoreHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

export function ActionMenu({ item, onView, onEdit, onDelete, onPrint }) {
    const [open, setOpen] = useState(false);
    const btnRef = useRef(null);
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0 });
    const { t } = useTranslation();

    const openMenu = (e) => {
        e.stopPropagation();

        if (open) {
            setOpen(false);
            return;
        }

        const rect = btnRef.current.getBoundingClientRect();
        const menuWidth = 124;
        const menuHeight = 173;
        const spaceBelow = window.innerHeight - rect.bottom;

        const top =
            spaceBelow >= menuHeight
                ? rect.bottom + 4
                : Math.max(8, rect.top - menuHeight - 4);

        const left = Math.min(
            rect.right - menuWidth,
            window.innerWidth - menuWidth - 8
        );

        setPos({
            top,
            left: Math.max(8, left),
        });

        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handler = (e) => {
            if (
                !menuRef.current?.contains(e.target) &&
                !btnRef.current?.contains(e.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handler);

        return () => {
            document.removeEventListener("mousedown", handler);
        };
    }, [open]);

    useEffect(() => {
        if (!open) return;

        const handler = () => setOpen(false);

        window.addEventListener("scroll", handler, true);

        return () => {
            window.removeEventListener("scroll", handler, true);
        };
    }, [open]);

    const dropdown = open
        ? ReactDOM.createPortal(
            <div
                ref={menuRef}
                style={{
                    position: "fixed",
                    top: pos.top,
                    left: pos.left,
                    zIndex: 9999,
                }}
                className="w-36 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={() => {
                        onView(item);
                        setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <Eye size={13} />
                    {t("actions_menu.view")}
                </button>

                <button
                    onClick={() => {
                        onEdit(item);
                        setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <Edit size={13} />
                    {t("actions_menu.edit")}
                </button>

                <button
                    onClick={() => {
                        onPrint(item);
                        setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors flex items-center gap-2 cursor-pointer"
                >
                    <Printer size={13} />
                    {t("actions_menu.print")}
                </button>

                <hr className="border-gray-200 dark:border-gray-800" />

                <button
                    onClick={() => {
                        onDelete(item.id);
                        setOpen(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/60 transition-colors flex items-center gap-2 cursor-pointer"                >
                    <Trash2 size={13} />
                    {t("actions_menu.delete")}
                </button>
            </div>,
            document.body
        )
        : null;

    return (
        <>
            <button
                ref={btnRef}
                onClick={openMenu}
                className="p-1.5 rounded-lg text-gray-700 dark:text-gray-300 bg-transparent hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                aria-label="Actions"
            >
                <MoreHorizontal size={18} />
            </button>

            {dropdown}
        </>
    );
}

export default ActionMenu;