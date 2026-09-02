import React, {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from "react";
import {
    MoreHorizontal,
    Eye,
    Pencil,
    Trash2,
    Printer,
} from "lucide-react";
import { createPortal } from "react-dom";

const ActionMenu = ({
    item,
    onView,
    onEdit,
    onDelete,
    onPrint,
    boundaryRef,
}) => {
    const [open, setOpen] = useState(false);

    const buttonRef = useRef(null);
    const menuRef = useRef(null);

    const toggleMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();

        setOpen((prev) => !prev);
    };

    /*
     * Position the portal menu after it has been rendered.
     *
     * boundaryRef is optional, so ActionMenu can still be used
     * without a specific boundary.
     */
    useLayoutEffect(() => {
        if (!open || !buttonRef.current || !menuRef.current) {
            return;
        }

        const updatePosition = () => {
            const button = buttonRef.current;
            const menu = menuRef.current;

            if (!button || !menu) return;

            const buttonRect = button.getBoundingClientRect();

            const menuWidth = menu.offsetWidth;
            const menuHeight = menu.offsetHeight;

            const gap = 4;
            const padding = 8;

            /*
             * Get the boundary at the time of positioning.
             * This is important because the page/container may
             * have moved since the component rendered.
             */
            const boundary = boundaryRef?.current;

            const containerRect = boundary
                ? boundary.getBoundingClientRect()
                : {
                    top: 0,
                    bottom: window.innerHeight,
                    left: 0,
                    right: window.innerWidth,
                };

            /*
             * Available space inside the boundary.
             */
            const spaceAbove =
                buttonRect.top -
                containerRect.top -
                padding;

            const spaceBelow =
                containerRect.bottom -
                buttonRect.bottom -
                padding;

            /*
             * Decide where the menu should open.
             *
             * Priority:
             * 1. Below if it completely fits.
             * 2. Above if it completely fits.
             * 3. If neither fits, use whichever side has more space.
             */
            let top;

            if (spaceBelow >= menuHeight + gap) {
                top = buttonRect.bottom + gap;
            } else if (spaceAbove >= menuHeight + gap) {
                top = buttonRect.top - menuHeight - gap;
            } else if (spaceAbove > spaceBelow) {
                top = Math.max(
                    containerRect.top + padding,
                    buttonRect.top - menuHeight - gap
                );
            } else {
                top = Math.min(
                    buttonRect.bottom + gap,
                    containerRect.bottom - menuHeight - padding
                );
            }

            /*
             * Horizontal positioning.
             */
            let left = buttonRect.right - menuWidth;

            /*
             * Keep the menu inside the viewport horizontally.
             */
            if (left < padding) {
                left = padding;
            }

            if (left + menuWidth > window.innerWidth - padding) {
                left = window.innerWidth - menuWidth - padding;
            }

            /*
             * Apply position directly to the DOM.
             */
            menu.style.top = `${top}px`;
            menu.style.left = `${left}px`;
            menu.style.visibility = "visible";
        };

        /*
         * Wait until the portal menu has actually been rendered
         * so offsetWidth/offsetHeight are available.
         */
        const frame = requestAnimationFrame(updatePosition);

        /*
         * Reposition when scrolling/resizing.
         */
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            cancelAnimationFrame(frame);

            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [open, boundaryRef]);

    /*
     * Close when clicking outside.
     */
    useEffect(() => {
        if (!open) return;

        const handleOutsideClick = (e) => {
            if (
                buttonRef.current &&
                buttonRef.current.contains(e.target)
            ) {
                return;
            }

            if (
                menuRef.current &&
                menuRef.current.contains(e.target)
            ) {
                return;
            }

            setOpen(false);
        };

        document.addEventListener("mousedown", handleOutsideClick);

        return () => {
            document.removeEventListener("mousedown", handleOutsideClick);
        };
    }, [open]);

    const menu = open ? (
        <div
            ref={menuRef}
            className="fixed z-9999 w-36 bg-white dark:bg-gray-950 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100"
            style={{
                visibility: "hidden",
                top: 0,
                left: 0,
            }}
            onClick={(e) => e.stopPropagation()}
        >
            {/* View */}
            <button
                type="button"
                onClick={() => {
                    setOpen(false);
                    onView(item);
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition cursor-pointer"
            >
                <Eye size={16} />
                <span>View</span>
            </button>

            {/* Edit */}
            <button
                type="button"
                onClick={() => {
                    setOpen(false);
                    onEdit(item);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
                <Pencil size={16} />
                <span>Edit</span>
            </button>

            {/* Print */}
            <button
                type="button"
                onClick={() => {
                    setOpen(false);
                    onPrint(item);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
            >
                <Printer size={16} />
                <span>Print</span>
            </button>

            {/* Delete */}
            <button
                type="button"
                onClick={() => {
                    setOpen(false);
                    onDelete(item);
                }}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-800 transition-colors flex items-center gap-2 cursor-pointer">
                <Trash2 size={16} />
                <span>Delete</span>
            </button>
        </div>
    ) : null;

    return (
        <>
            <div
                className="inline-block"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={toggleMenu}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-300 dark:text-gray-400 dark:hover:text-gray-100 dark:hover:bg-gray-600 transition cursor-pointer"
                >
                    <MoreHorizontal size={20} />
                </button>
            </div>

            {open &&
                createPortal(
                    menu,
                    document.body
                )}
        </>
    );
};

export default ActionMenu;