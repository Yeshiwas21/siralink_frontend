/**
 * Utility to generate and trigger printing for Worker profiles
 * @param {Object} worker - The worker object to print
 */
export const handlePrintWorker = (worker) => {
    if (!worker) return;

    const name =
        [worker.first_name, worker.last_name].filter(Boolean).join(" ") || "—";

    const win = window.open("", "_blank", "width=750,height=700");

    win.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <title>Worker Summary — ${name}</title>
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
          <h1>Worker Profile</h1>
          <p>Generated on ${new Date().toLocaleString()}</p>
        </div>
        <span class="badge">${worker.verification_status_display || worker.verification_status || "—"}</span>
      </div>

      <div class="section-title">Personal Information</div>
      <table>
        <tr><td>System ID</td><td>#${worker.id}</td></tr>
        <tr><td>Full Name</td><td>${name}</td></tr>
        <tr><td>National ID</td><td>${worker.national_id || "—"}</td></tr>
      </table>

      <div class="section-title">Contact & Details</div>
      <table>
        <tr><td>Email Address</td><td>${worker.email || "—"}</td></tr>
        <tr><td>Phone Number</td><td>${worker.phone || "—"}</td></tr>
        <tr><td>Location</td><td>${worker.location || "—"}</td></tr>
        <tr><td>Verification Status</td><td>${worker.verification_status_display || worker.verification_status || "—"}</td></tr>
      </table>

      <div class="footer">Worker Management Record • Confidential</div>
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