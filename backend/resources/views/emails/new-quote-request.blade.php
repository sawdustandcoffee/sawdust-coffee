<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Quote Request</title>
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
            padding: 20px;
            text-align: center;
        }
        .content {
            padding: 30px 20px;
            background-color: #f9f9f9;
        }
        .details-box {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #7C3E26;
        }
        .detail-row {
            margin: 10px 0;
        }
        .label {
            font-weight: bold;
            color: #7C3E26;
        }
        .highlight {
            background-color: #FFF3CD;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #FFC107;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">New Quote Request</h1>
            <p style="margin: 10px 0 0 0;">Custom Project Inquiry</p>
        </div>

        <div class="content">
            <div class="highlight">
                <strong>⚠️ Action Required:</strong> A customer is interested in a custom project and needs a quote.
            </div>

            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Customer Name:</span><br>
                    <span>{{ $quote->name }}</span>
                </div>

                <div class="detail-row">
                    <span class="label">Email:</span><br>
                    <span><a href="mailto:{{ $quote->email }}">{{ $quote->email }}</a></span>
                </div>

                @if($quote->phone)
                <div class="detail-row">
                    <span class="label">Phone:</span><br>
                    <span><a href="tel:{{ $quote->phone }}">{{ $quote->phone }}</a></span>
                </div>
                @endif

                @if($quote->project_type)
                <div class="detail-row">
                    <span class="label">Project Type:</span><br>
                    <span>{{ $quote->project_type }}</span>
                </div>
                @endif

                <div class="detail-row">
                    <span class="label">Project Description:</span><br>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 5px;">
                        {{ $quote->description }}
                    </div>
                </div>

                <div class="detail-row">
                    <span class="label">Submitted:</span><br>
                    <span>{{ $quote->created_at->format('F j, Y \a\t g:i A') }}</span>
                </div>

                <div class="detail-row">
                    <span class="label">Status:</span><br>
                    <span style="background: #4CAF50; color: white; padding: 5px 10px; border-radius: 3px;">
                        {{ ucfirst($quote->status) }}
                    </span>
                </div>
            </div>

            <h3 style="color: #7C3E26;">Next Steps:</h3>
            <ol>
                <li>Review the project details above</li>
                <li>Contact the customer to discuss requirements</li>
                <li>Provide a detailed quote and timeline</li>
                <li>Mark the quote as "responded" in the admin dashboard</li>
            </ol>

            <p style="color: #666; font-size: 14px;">
                <strong>Pro Tip:</strong> Customers who request quotes are highly interested.
                Try to respond within 24 hours for the best conversion rate.
            </p>
        </div>
    </div>
</body>
</html>
