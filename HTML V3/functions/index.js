const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// CHANGE THESE TO YOUR EMAIL SETTINGS
const SENDER_EMAIL = "your-email@gmail.com"; // Your Gmail address
const SENDER_PASSWORD = "your-16-char-app-password"; // App password from Google
const ADMIN_EMAIL = "your-email@gmail.com"; // Where to send admin notifications

// Configure email transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: SENDER_EMAIL,
    pass: SENDER_PASSWORD
  }
});

// Cloud Function: Send emails when new collaboration request is submitted
exports.onCollaborationSubmitted = functions.database
  .ref("collaborations/{pushId}")
  .onCreate(async (snapshot) => {
    const request = snapshot.val();
    const timestamp = new Date(request.timestamp).toLocaleString();

    try {
      // EMAIL 1: Confirmation email to the user who submitted the form
      const userEmailOptions = {
        from: SENDER_EMAIL,
        to: request.yourEmail,
        subject: `🤝 Collaboration Request Received - ${request.rapperName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00f5ff, #ff006e); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .message-box { background: white; border-left: 4px solid #00f5ff; padding: 15px; margin: 15px 0; }
              .footer { color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px; }
              a { color: #00f5ff; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🎵 Music Crib</h2>
              </div>
              
              <div class="content">
                <h3>Thanks for Your Collaboration Request!</h3>
                <p>Hi <strong>${request.yourName}</strong>,</p>
                
                <p>We received your collaboration request for <strong style="color: #ff006e;">${request.rapperName}</strong>.</p>
                
                <div class="message-box">
                  <p><strong>Your Message:</strong></p>
                  <p>"${request.message}"</p>
                </div>
                
                <p><strong>Request Details:</strong></p>
                <ul>
                  <li>Email: ${request.yourEmail}</li>
                  ${request.phone ? `<li>Phone: ${request.phone}</li>` : ""}
                  <li>Submitted: ${timestamp}</li>
                </ul>
                
                <p>We'll review your collaboration request and get back to you within 2-3 business days.</p>
                
                <p>Best regards,<br><strong>Music Crib Team</strong></p>
              </div>
              
              <div class="footer">
                <p>This is an automated email from Music Crib. Do not reply to this email.</p>
                <p>&copy; 2025 Music Crib. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      // EMAIL 2: Admin notification with full details
      const adminEmailOptions = {
        from: SENDER_EMAIL,
        to: ADMIN_EMAIL,
        subject: `📬 New Collaboration Request: ${request.rapperName} - ${request.yourName}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #00f5ff, #ff006e); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .content { background: #f9f9f9; padding: 20px; border-radius: 8px; }
              .detail-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              .detail-table tr { border-bottom: 1px solid #ddd; }
              .detail-table td { padding: 12px; }
              .detail-table td:first-child { font-weight: bold; width: 30%; background: #f0f0f0; }
              .message-box { background: white; border-left: 4px solid #ff006e; padding: 15px; margin: 15px 0; }
              .button { background: #ff006e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin-top: 15px; }
              .footer { color: #999; font-size: 12px; border-top: 1px solid #ddd; padding-top: 15px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h2 style="margin: 0;">🎵 Music Crib Admin</h2>
                <p style="margin: 5px 0 0 0;">New Collaboration Request</p>
              </div>
              
              <div class="content">
                <h3>📬 New Collaboration Request Received!</h3>
                
                <table class="detail-table">
                  <tr>
                    <td>From:</td>
                    <td><strong>${request.yourName}</strong></td>
                  </tr>
                  <tr>
                    <td>Email:</td>
                    <td><a href="mailto:${request.yourEmail}">${request.yourEmail}</a></td>
                  </tr>
                  <tr>
                    <td>Phone:</td>
                    <td>${request.phone || "Not provided"}</td>
                  </tr>
                  <tr>
                    <td>For Artist:</td>
                    <td><strong style="color: #ff006e; font-size: 16px;">${request.rapperName}</strong></td>
                  </tr>
                  <tr>
                    <td>Status:</td>
                    <td><span style="background: #fff3cd; padding: 4px 8px; border-radius: 3px; font-weight: bold;">PENDING</span></td>
                  </tr>
                  <tr>
                    <td>Submitted:</td>
                    <td>${timestamp}</td>
                  </tr>
                </table>
                
                <div class="message-box">
                  <p><strong>Collaboration Message:</strong></p>
                  <p>${request.message}</p>
                </div>
                
                <p><strong>Actions:</strong></p>
                <ul>
                  <li>Review the request</li>
                  <li>Approve or reject in your dashboard</li>
                  <li>Contact ${request.yourName} at ${request.yourEmail}</li>
                </ul>
                
                <a href="https://your-website.com/dashboard.html" class="button">View in Dashboard</a>
              </div>
              
              <div class="footer">
                <p>This is an automated notification. Check your dashboard for more details.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      // Send both emails
      await transporter.sendMail(userEmailOptions);
      console.log("✅ User confirmation email sent to:", request.yourEmail);

      await transporter.sendMail(adminEmailOptions);
      console.log("✅ Admin notification sent to:", ADMIN_EMAIL);

      return { success: true };
    } catch (error) {
      console.error("❌ Error sending emails:", error);
      throw error;
    }
  });
