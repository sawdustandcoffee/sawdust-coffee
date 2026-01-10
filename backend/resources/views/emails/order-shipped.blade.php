<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Order Has Shipped</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3C2F2F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Sawdust & Coffee</h1>
        <p style="color: #E5D5C3; margin: 10px 0 0 0;">Handcrafted Woodworking</p>
    </div>

    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #3C2F2F; margin-top: 0;">📦 Your Order is On Its Way!</h2>

        <p style="font-size: 16px;">Hi {{ $order->customer_name }},</p>

        <p style="font-size: 16px;">
            Great news! Your order has been shipped and is on its way to you. We've carefully packaged
            your handcrafted items and they're ready for delivery.
        </p>

        <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #3C2F2F; margin-top: 0;">Order #{{ $order->order_number }}</h3>
            <p style="color: #666; margin: 10px 0;">Shipped on {{ now()->format('F j, Y') }}</p>
            
            @if($order->tracking_number)
            <div style="margin: 20px 0;">
                <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Tracking Number:</p>
                <div style="background-color: #ffffff; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 18px; font-weight: bold; color: #3C2F2F;">
                    {{ $order->tracking_number }}
                </div>
            </div>
            @endif
        </div>

        @if($order->tracking_number)
        <div style="text-align: center; margin: 30px 0;">
            <a href="https://tools.usps.com/go/TrackConfirmAction?tLabels={{ $order->tracking_number }}"
               style="display: inline-block; background-color: #6B4226; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Track Your Package
            </a>
        </div>
        @endif

        <h3 style="color: #3C2F2F;">What's in Your Package</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            @foreach($order->items as $item)
            <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 15px 0;">
                    <strong>{{ $item->product_name }}</strong>
                    @if($item->variant_name)
                        <br><span style="color: #666; font-size: 14px;">{{ $item->variant_name }}</span>
                    @endif
                </td>
                <td style="padding: 15px 0; text-align: center; color: #666;">x{{ $item->quantity }}</td>
            </tr>
            @endforeach
        </table>

        @if($order->shipping_address)
        <h3 style="color: #3C2F2F;">Delivery Address</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;">{{ $order->customer_name }}</p>
            <p style="margin: 5px 0;">{{ $order->shipping_address }}</p>
            <p style="margin: 5px 0;">{{ $order->city }}, {{ $order->state }} {{ $order->zip }}</p>
        </div>
        @endif

        <div style="background-color: #D1FAE5; padding: 15px; border-left: 4px solid #059669; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Estimated Delivery:</strong> Your order should arrive within 3-7 business days.
                We'll notify you once it's been delivered!
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/customer/orders/{{ $order->id }}"
               style="display: inline-block; background-color: #ffffff; color: #6B4226; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; border: 2px solid #6B4226;">
                View Order Details
            </a>
        </div>

        <h3 style="color: #3C2F2F;">Questions About Your Order?</h3>
        <p style="font-size: 16px;">
            We're here to help! If you have any questions about your shipment or need assistance,
            please don't hesitate to reach out:
        </p>
        <ul style="list-style: none; padding: 0;">
            <li style="padding: 5px 0;">📧 Email: <a href="mailto:info@sawdustandcoffee.com" style="color: #6B4226;">info@sawdustandcoffee.com</a></li>
            <li style="padding: 5px 0;">📞 Phone: <a href="tel:774-836-4958" style="color: #6B4226;">774-836-4958</a></li>
        </ul>

        <p style="font-size: 16px; margin-top: 30px;">
            Thank you for supporting our craft! We hope you love your handmade woodworking piece.
        </p>

        <p style="font-size: 16px; margin-bottom: 0;">
            With gratitude,<br>
            <strong>The Sawdust & Coffee Team</strong>
        </p>
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">Sawdust & Coffee Woodworking</p>
        <p style="margin: 5px 0;">Wareham, Massachusetts | Make Cool Sh!t</p>
        <p style="margin: 5px 0;">
            <a href="{{ config('app.frontend_url') }}" style="color: #6B4226; text-decoration: none;">Visit Our Website</a> |
            <a href="{{ config('app.frontend_url') }}/customer/dashboard" style="color: #6B4226; text-decoration: none;">My Account</a> |
            <a href="{{ config('app.frontend_url') }}/contact" style="color: #6B4226; text-decoration: none;">Contact</a>
        </p>
    </div>
</body>
</html>
