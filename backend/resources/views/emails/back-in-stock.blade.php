<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $product->name }} is Back in Stock!</title>
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
        .product-card {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .product-image {
            width: 100%;
            max-width: 400px;
            height: auto;
            border-radius: 6px;
            margin-bottom: 15px;
        }
        .product-name {
            font-size: 22px;
            font-weight: 600;
            color: #333;
            margin: 10px 0;
        }
        .product-price {
            font-size: 24px;
            font-weight: 700;
            color: #8B4513;
            margin: 10px 0;
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
        .badge {
            display: inline-block;
            background-color: #22c55e;
            color: white;
            padding: 6px 12px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin: 10px 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sawdust & Coffee</h1>
        <p style="color: #666; margin: 5px 0;">Handcrafted Woodworking</p>
    </div>

    <div class="content">
        <h2 style="color: #333;">Great News!</h2>

        <p>The product you've been waiting for is back in stock!</p>

        <div class="product-card">
            @if($product->images && count($product->images) > 0)
                <div style="text-align: center;">
                    <img src="{{ $product->images[0]->path }}" alt="{{ $product->name }}" class="product-image">
                </div>
            @endif

            <div class="product-name">{{ $product->name }}</div>

            @if($product->description)
                <p style="color: #666; margin: 10px 0;">{{ $product->description }}</p>
            @endif

            <div class="product-price">
                @if($product->sale_price)
                    <span style="color: #22c55e;">${{ number_format($product->sale_price, 2) }}</span>
                    <span style="font-size: 18px; color: #999; text-decoration: line-through; margin-left: 10px;">
                        ${{ number_format($product->price, 2) }}
                    </span>
                    <span class="badge">ON SALE</span>
                @else
                    ${{ number_format($product->price, 2) }}
                @endif
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="{{ $productUrl }}" class="button">View Product & Buy Now</a>
            </div>
        </div>

        <p style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
            <strong>⏰ Hurry!</strong> This item is in high demand and stock is limited. Get yours before it's gone again!
        </p>

        <p style="margin-top: 30px; font-size: 14px; color: #666;">
            You're receiving this email because you signed up to be notified when this product came back in stock.
        </p>

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
