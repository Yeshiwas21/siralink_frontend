/**
 * Utility to generate and trigger printing for Client profiles
 * @param {Object} client - The client object to print
 */
export const handlePrintClient = (client) => {
    if (!client) return;

    const name =
        client.client_type === "company"
            ? client.company_name || "—"
            : [client.first_name, client.last_name].filter(Boolean).join(" ") || "—";

    const win = window.open("", "_blank", "width=750,height=700");

    win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Client Summary — ${name}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937; padding: 40px; background: #fff; }
        .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
        .header h1 { font-size: 22px; font-weight: 700; color: #111827; }
        .header p { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 11px; font-weight: 600; text-transform: capitalize; background: #f3f4f6; color: #374151; }
        .section-title { font-size: 14px; font-weight: 700; color: #374151; text-transform: uppercase; tracking: 0.05em; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #f3f4f6; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 4px; }
        tr { border-bottom: 1px solid #e5e7eb; }
        td { padding: 10px 8px; font-size: 13px; }
        td:first-child { width: 180px; font-weight: 600; color: #4b5563; }
        .footer { margin-top: 40px; font-size: 11px; color: #9ca3af; text-align: center; border-top: 1px dashed #e5e7eb; padding-top: 16px; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Client Profile</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <span class="badge">${client.verification_status_display || client.verification_status || "—"}</span>
      </div>

      <div class="section-title">General Information</div>
      <table>
        <tr><td>System ID</td><td>#${client.id}</td></tr>
        <tr><td>Client Type</td><td>${client.client_type === "company" ? "Company" : "Individual"}</td></tr>
        ${client.client_type === "company"
            ? `<tr><td>Company Name</td><td>${client.company_name || "—"}</td></tr>`
            : ""
        }
        <tr><td>First Name</td><td>${client.first_name || "—"}</td></tr>
        <tr><td>Last Name</td><td>${client.last_name || "—"}</td></tr>
      </table>

      <div class="section-title">Contact & Location</div>
      <table>
        <tr><td>Email Address</td><td>${client.email || "—"}</td></tr>
        <tr><td>Phone Number</td><td>${client.phone || "—"}</td></tr>
        <tr><td>Location</td><td>${client.location || "—"}</td></tr>
        ${client.national_id
            ? `<tr><td>National ID</td><td>${client.national_id}</td></tr>`
            : ""
        }
      </table>

      <div class="footer">Client Management Record • Confidential</div>
      <script>
        window.onload = () => {
          window.print();
          window.onafterprint = () => window.close();
        };
      </script>
    </body>
    </html>
  `);

    win.document.close();
};