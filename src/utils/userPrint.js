/**
 * Utility function to generate and trigger printing of a user profile document.
 * 
 * @param {Object} user - The user object containing detail fields.
 * @param {Function} t - The i18next translation function.
 */
export const handleUserPrint = (user, t) => {
    if (!user) return;

    const name = user.first_name
        ? `${user.first_name} ${user.last_name || ""}`.trim()
        : "—";

    const win = window.open("", "_blank", "width=700,height=600");

    if (!win) {
        console.error("Failed to open print window. Check popup blocker settings.");
        return;
    }

    win.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${t("all_users.print.document_title", "User Document")} — ${name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1a1a2e; padding: 40px; }
        .header { border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { font-size: 22px; font-weight: 700; }
        .header p  { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; background: #f3f4f6; color: #374151; text-transform: capitalize; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        tr { border-bottom: 1px solid #e5e7eb; }
        td { padding: 10px 8px; font-size: 14px; }
        td:first-child { width: 160px; font-weight: 600; color: #6b7280; }
        .footer { margin-top: 32px; font-size: 11px; color: #9ca3af; text-align: center; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>${t("all_users.print.user_profile", "User Profile")}</h1>
          <p>${t("all_users.print.generated", "Generated on")}: ${new Date().toLocaleString()}</p>
        </div>
        <span class="badge">${user.account_status || "—"}</span>
      </div>
      <table>
        <tr><td>${t("all_users.table.id", "ID")}</td><td>#${user.id}</td></tr>
        <tr><td>${t("all_users.print.company_name", "Name")}</td><td>${name}</td></tr>
        <tr><td>${t("all_users.table.email", "Email")}</td><td>${user.email || "—"}</td></tr>
        <tr><td>${t("all_users.table.phone", "Phone")}</td><td>${user.phone || "—"}</td></tr>
        <tr><td>${t("all_users.table.role", "Role")}</td><td>${user.user_type || "—"}</td></tr>
        <tr><td>${t("all_users.table.status", "Status")}</td><td>${user.account_status || "—"}</td></tr>
      </table>
      <div class="footer">${t("all_users.print.footer", "Confidential Internal Document")}</div>
      <script>
        window.onload = () => { 
          window.print(); 
          window.onafterprint = () => window.close(); 
        }
      </script>
    </body>
    </html>
  `);
    win.document.close();
};

export default handleUserPrint;