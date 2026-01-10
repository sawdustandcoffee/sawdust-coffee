<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirm Your Newsletter Subscription</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #8B4513;
        }
        .header h1 {
            color: #8B4513;
            margin: 0;
            font-size: 28px;
        }
        .content {
            padding: 30px 0;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #8B4513;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .button:hover {
            background-color: #6d3410;
        }
        .footer {
            text-align: center;
            padding: 20px 0;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
        }
        .highlight {
            background-color: #f9f9f9;
            border-left: 4px solid #8B4513;
            padding: 15px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sawdust & Coffee</h1>
        <p style="color: #666; margin: 5px 0;">Handcrafted Woodworking</p>
    </div>

    <div class="content">
        <h2 style="color: #333;">Confirm Your Subscription</h2>

        <p>Hi{{ $subscriber->name ? ' ' . $subscriber->name : '' }},</p>

        <p>Thank you for subscribing to the Sawdust & Coffee newsletter! We're excited to share updates about our latest handcrafted creations, special offers, and woodworking inspiration with you.</p>

        <div class="highlight">
            <p style="margin: 0;"><strong>Please confirm your subscription by clicking the button below:</strong></p>
        </div>

        <div style="text-align: center;">
            <a href="{{ $confirmUrl }}" class="button">Confirm My Subscription</a>
        </div>

        <p style="font-size: 14px; color: #666;">If the button doesn't work, copy and paste this link into your browser:</p>
        <p style="font-size: 12px; color: #999; word-break: break-all;">{{ $confirmUrl }}</p>

        <p style="margin-top: 30px;">If you didn't subscribe to our newsletter, you can safely ignore this email.</p>

        <p>Best regards,<br>
        <strong>The Sawdust & Coffee Team</strong></p>
    </div>

    <div class="footer">
        <p>Sawdust & Coffee Woodworking<br>
        Wareham, MA</p>
        <p style="margin-top: 10px;">
            <a href="https://www.sawdustandcoffee.com" style="color: #8B4513; text-decoration: none;">www.sawdustandcoffee.com</a>
        </p>
    </div>
</body>
</html>
