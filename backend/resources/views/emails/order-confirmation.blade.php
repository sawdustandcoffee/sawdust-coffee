<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background-color: #7C3E26;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
            background-color: #f9f9f9;
        }
        .order-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .item-row {
            border-bottom: 1px solid #e5e7eb;
            padding: 15px 0;
        }
        .item-row:last-child {
            border-bottom: none;
        }
        .total-row {
            font-size: 18px;
            font-weight: bold;
            padding-top: 15px;
            border-top: 2px solid #7C3E26;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #8B4513;
            text-align: center;
            color: #666;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background-color: #7C3E26;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">Thank You for Your Order!</h1>
            <p style="margin: 10px 0 0 0;">Sawdust & Coffee Woodworking</p>
        </div>

        <div class="content">
            <p>Hi {{ $order->customer_name }},</p>

            <p>Thank you for your order! We've received your order and will begin processing it right away.</p>

            <div class="order-details">
                <h2 style="color: #7C3E26; margin-top: 0;">Order #{{ $order->order_number }}</h2>
                <p><strong>Order Date:</strong> {{ $order->created_at->format('F j, Y') }}</p>
                <p><strong>Status:</strong> {{ ucfirst($order->status) }}</p>

                <h3 style="color: #7C3E26;">Order Items:</h3>
                @foreach($order->items as $item)
                <div class="item-row">
                    <div>
                        <strong>{{ $item->product->name }}</strong>
                        @if($item->variant)
                            <span style="color: #666;">({{ $item->variant->name }})</span>
                        @endif
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-top: 5px;">
                        <span>Quantity: {{ $item->quantity }}</span>
                        <span>${{ number_format($item->price_at_purchase * $item->quantity, 2) }}</span>
                    </div>
                </div>
                @endforeach

                <div class="total-row">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Total:</span>
                        <span>${{ number_format($order->total_amount, 2) }}</span>
                    </div>
                </div>

                @if($order->shipping_address)
                <div style="margin-top: 20px;">
                    <h3 style="color: #7C3E26;">Shipping Address:</h3>
                    <p style="margin: 5px 0;">
                        {{ $order->shipping_address }}<br>
                        {{ $order->shipping_city }}, {{ $order->shipping_state }} {{ $order->shipping_zip }}
                    </p>
                </div>
                @endif
            </div>

            <h3 style="color: #7C3E26;">What's Next?</h3>
            <ul>
                <li>We'll send you another email when your order ships</li>
                <li>Most custom orders are ready within 2-4 weeks</li>
                <li>Questions? Call us at 774-836-4958 or reply to this email</li>
            </ul>

            <p>Thank you for supporting our family business!</p>

            <p>
                Paul, Jason & Patrick<br>
                <strong>Sawdust & Coffee Woodworking</strong>
            </p>
        </div>

        <div class="footer">
            <p>
                <strong>Sawdust & Coffee Woodworking</strong><br>
                Wareham, Massachusetts<br>
                774-836-4958<br>
                info@sawdustandcoffee.com
            </p>
            <p style="font-size: 12px; color: #999;">
                This email was sent because you placed an order on our website.
            </p>
        </div>
    </div>
</body>
</html>
