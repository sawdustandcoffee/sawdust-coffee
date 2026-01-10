<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Order Received</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background-color: #3C2F2F; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <h1 style="color: #D4A574; margin: 0; font-size: 28px;">Sawdust & Coffee</h1>
        <p style="color: #E5D5C3; margin: 10px 0 0 0;">Admin Notification</p>
    </div>

    <div style="background-color: #ffffff; padding: 40px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #3C2F2F; margin-top: 0;">🎉 New Order Received!</h2>

        <div style="background-color: #EFF6FF; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #3C2F2F; margin-top: 0;">Order #{{ $order->order_number }}</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Date:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold;">{{ $order->created_at->format('F j, Y g:i A') }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Order Total:</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #059669; font-size: 18px;">${{ number_format($order->total, 2) }}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #666;">Payment Status:</td>
                    <td style="padding: 8px 0; text-align: right;">
                        <span style="background-color: #D1FAE5; color: #065F46; padding: 4px 12px; border-radius: 12px; font-size: 14px; font-weight: 500;">
                            Paid
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <h3 style="color: #3C2F2F;">Customer Information</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Name:</strong> {{ $order->customer_name }}</p>
            <p style="margin: 5px 0;"><strong>Email:</strong> {{ $order->customer_email }}</p>
            @if($order->customer_phone)
                <p style="margin: 5px 0;"><strong>Phone:</strong> {{ $order->customer_phone }}</p>
            @endif
        </div>

        @if($order->shipping_address)
        <h3 style="color: #3C2F2F;">Shipping Address</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;">{{ $order->shipping_address }}</p>
            <p style="margin: 5px 0;">{{ $order->city }}, {{ $order->state }} {{ $order->zip }}</p>
        </div>
        @endif

        <h3 style="color: #3C2F2F;">Order Items</h3>
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
                <td style="padding: 15px 0; text-align: right; font-weight: bold;">${{ number_format($item->subtotal, 2) }}</td>
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
                <td style="padding: 12px 0; text-align: right; font-size: 18px; font-weight: bold; color: #059669;">${{ number_format($order->total, 2) }}</td>
            </tr>
        </table>

        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ config('app.url') }}/admin/orders"
               style="display: inline-block; background-color: #6B4226; color: #ffffff; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                View in Admin Panel
            </a>
        </div>

        <div style="background-color: #FEF3C7; padding: 15px; border-left: 4px solid #F59E0B; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px;">
                <strong>Action Required:</strong> Process this order, update inventory, and prepare for shipping.
            </p>
        </div>
    </div>

    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #666;">
        <p style="margin: 5px 0;">This is an automated notification from your Sawdust & Coffee e-commerce system.</p>
    </div>
</body>
</html>
