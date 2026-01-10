<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3C2F2F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Sawdust & Coffee</h1>
        <p style="color: #E5D5C3; margin: 10px 0 0 0;">Handcrafted Woodworking</p>
    </div>

    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #3C2F2F; margin-top: 0;">Reset Your Password</h2>

        <p style="font-size: 16px;">Hi {{ $user->name }},</p>

        <p style="font-size: 16px;">
            We received a request to reset the password for your Sawdust & Coffee account.
            If you didn't make this request, you can safely ignore this email.
        </p>

        <p style="font-size: 16px;">
            To reset your password, click the button below. This link will expire in 60 minutes.
        </p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/customer/reset-password?token={{ $token }}&email={{ urlencode($user->email) }}"
               style="display: inline-block; background-color: #6B4226; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Reset Password
            </a>
        </div>

        <div style="background-color: #FFF8F0; padding: 15px; border-left: 4px solid #D4A574; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Security Tip:</strong> If you didn't request a password reset, please ignore this email or contact us if you're concerned about your account security.
            </p>
        </div>

        <p style="font-size: 14px; color: #666; margin-top: 30px;">
            If the button doesn't work, you can copy and paste this link into your browser:
        </p>
        <p style="font-size: 12px; color: #666; word-break: break-all; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
            {{ config('app.frontend_url') }}/customer/reset-password?token={{ $token }}&email={{ urlencode($user->email) }}
        </p>

        <p style="font-size: 16px; margin-top: 30px;">
            If you need assistance, contact us at <a href="mailto:info@sawdustandcoffee.com" style="color: #6B4226;">info@sawdustandcoffee.com</a>
            or call <a href="tel:774-836-4958" style="color: #6B4226;">774-836-4958</a>.
        </p>

        <p style="font-size: 16px; margin-bottom: 0;">
            Best regards,<br>
            <strong>The Sawdust & Coffee Team</strong>
        </p>
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">Sawdust & Coffee Woodworking</p>
        <p style="margin: 5px 0;">Wareham, Massachusetts | Make Cool Sh!t</p>
        <p style="margin: 5px 0;">
            <a href="{{ config('app.frontend_url') }}" style="color: #6B4226; text-decoration: none;">Visit Our Website</a> |
            <a href="{{ config('app.frontend_url') }}/contact" style="color: #6B4226; text-decoration: none;">Contact</a>
        </p>
        <p style="margin: 15px 0 5px 0; color: #999; font-size: 11px;">
            This password reset link will expire in 60 minutes.
        </p>
    </div>
</body>
</html>
