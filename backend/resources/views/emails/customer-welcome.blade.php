<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Sawdust & Coffee</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3C2F2F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Sawdust & Coffee</h1>
        <p style="color: #E5D5C3; margin: 10px 0 0 0;">Handcrafted Woodworking</p>
    </div>

    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #3C2F2F; margin-top: 0;">Welcome, {{ $user->name }}!</h2>

        <p style="font-size: 16px;">Thank you for creating an account with Sawdust & Coffee Woodworking!</p>

        <p style="font-size: 16px;">
            We're thrilled to have you join our community of woodworking enthusiasts. Your account has been successfully created,
            and you now have access to all our features:
        </p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C2F2F; margin-top: 0;">What You Can Do:</h3>
            <ul style="padding-left: 20px;">
                <li style="margin-bottom: 10px;">Browse and shop our handcrafted woodworking products</li>
                <li style="margin-bottom: 10px;">Track your orders in real-time</li>
                <li style="margin-bottom: 10px;">Save your favorite items for later</li>
                <li style="margin-bottom: 10px;">Manage your account settings and preferences</li>
                <li style="margin-bottom: 10px;">Request custom quotes for special projects</li>
            </ul>
        </div>

        <p style="font-size: 16px;">Ready to get started? Here are some quick links:</p>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/shop"
               style="display: inline-block; background-color: #D4A574; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">
                Shop Now
            </a>
            <a href="{{ config('app.frontend_url') }}/customer/dashboard"
               style="display: inline-block; background-color: #6B4226; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px;">
                My Account
            </a>
        </div>

        <div style="background-color: #FFF8F0; padding: 15px; border-left: 4px solid #D4A574; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Quick Tip:</strong> Check out our gallery to see examples of our custom work,
                and don't hesitate to reach out if you have a unique project in mind!
            </p>
        </div>

        <p style="font-size: 16px;">
            If you have any questions or need assistance, our team is here to help.
            Feel free to contact us at <a href="mailto:info@sawdustandcoffee.com" style="color: #6B4226;">info@sawdustandcoffee.com</a>
            or call us at <a href="tel:774-836-4958" style="color: #6B4226;">774-836-4958</a>.
        </p>

        <p style="font-size: 16px; margin-bottom: 0;">
            Happy shopping!<br>
            <strong>The Sawdust & Coffee Team</strong>
        </p>
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">Sawdust & Coffee Woodworking</p>
        <p style="margin: 5px 0;">Wareham, Massachusetts | Make Cool Sh!t</p>
        <p style="margin: 5px 0;">
            <a href="{{ config('app.frontend_url') }}" style="color: #6B4226; text-decoration: none;">Visit Our Website</a> |
            <a href="{{ config('app.frontend_url') }}/about" style="color: #6B4226; text-decoration: none;">About Us</a> |
            <a href="{{ config('app.frontend_url') }}/contact" style="color: #6B4226; text-decoration: none;">Contact</a>
        </p>
    </div>
</body>
</html>
