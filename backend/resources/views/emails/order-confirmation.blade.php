<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3C2F2F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Sawdust & Coffee</h1>
        <p style="color: #E5D5C3; margin: 10px 0 0 0;">Handcrafted Woodworking</p>
    </div>

    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #3C2F2F; margin-top: 0;">Order Confirmed!</h2>

        <p style="font-size: 16px;">Hi {{ $order->customer_name }},</p>

        <p style="font-size: 16px;">
            Thank you for your order! We've received your order and will begin processing it shortly.
        </p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C2F2F; margin-top: 0;">Order Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Number:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{ $order->order_number }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{ $order->created_at->format('F j, Y') }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="background-color: #FEF3C7; color: #92400E; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500;">
                            {{ ucfirst($order->status) }}
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="color: #3C2F2F;">Items Ordered</h3>
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
                <td style="padding: 15px 0; text-align: right; font-weight: bold;">${{ number_format($item->price * $item->quantity, 2) }}</td>
            </tr>
            @endforeach
        </table>

        <table style="width: 100%; margin-top: 20px;">
            <tr>
                <td style="padding: 8px 0; color: #666;">Subtotal:</td>
                <td style="padding: 8px 0; text-align: right;">${{ number_format($order->subtotal, 2) }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Tax:</td>
                <td style="padding: 8px 0; text-align: right;">${{ number_format($order->tax, 2) }}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; color: #666;">Shipping:</td>
                <td style="padding: 8px 0; text-align: right;">${{ number_format($order->shipping, 2) }}</td>
            </tr>
            <tr style="border-top: 2px solid #3C2F2F;">
                <td style="padding: 12px 0; font-size: 18px; font-weight: bold;">Total:</td>
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #6B4226;">${{ number_format($order->total, 2) }}</td>
            </tr>
        </table>

        @if($order->shipping_address)
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C2F2F; margin-top: 0;">Shipping Information</h3>
            <p style="margin: 5px 0;">{{ $order->customer_name }}</p>
            <p style="margin: 5px 0;">{{ $order->shipping_address }}</p>
            <p style="margin: 5px 0;">{{ $order->city }}, {{ $order->state }} {{ $order->zip }}</p>
            @if($order->customer_phone)
                <p style="margin: 5px 0;">Phone: {{ $order->customer_phone }}</p>
            @endif
        </div>
        @endif

        <div style="background-color: #EFF6FF; padding: 15px; border-left: 4px solid #3B82F6; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                <strong>What's Next?</strong> We'll send you another email when your order ships with tracking information.
                You can also track your order status anytime in your account dashboard.
            </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/customer/orders/{{ $order->id }}"
               style="display: inline-block; background-color: #6B4226; color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                View Order Details
            </a>
        </div>

        <p style="font-size: 16px;">
            If you have any questions about your order, please don't hesitate to contact us at
            <a href="mailto:info@sawdustandcoffee.com" style="color: #6B4226;">info@sawdustandcoffee.com</a>
            or call <a href="tel:774-836-4958" style="color: #6B4226;">774-836-4958</a>.
        </p>

        <p style="font-size: 16px; margin-bottom: 0;">
            Thank you for supporting our craft!<br>
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
