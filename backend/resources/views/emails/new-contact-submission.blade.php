<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
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
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1 style="margin: 0;">New Contact Form Submission</h1>
            <p style="margin: 10px 0 0 0;">Sawdust & Coffee Website</p>
        </div>

        <div class="content">
            <p>A new contact form has been submitted on the website.</p>

            <div class="details-box">
                <div class="detail-row">
                    <span class="label">Name:</span><br>
                    <span>{{ $submission->name }}</span>
                </div>

                <div class="detail-row">
                    <span class="label">Email:</span><br>
                    <span><a href="mailto:{{ $submission->email }}">{{ $submission->email }}</a></span>
                </div>

                @if($submission->phone)
                <div class="detail-row">
                    <span class="label">Phone:</span><br>
                    <span><a href="tel:{{ $submission->phone }}">{{ $submission->phone }}</a></span>
                </div>
                @endif

                <div class="detail-row">
                    <span class="label">Message:</span><br>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 5px;">
                        {{ $submission->message }}
                    </div>
                </div>

                <div class="detail-row">
                    <span class="label">Submitted:</span><br>
                    <span>{{ $submission->created_at->format('F j, Y \a\t g:i A') }}</span>
                </div>
            </div>

            <p style="color: #666; font-size: 14px;">
                <strong>Action Required:</strong> Please respond to this customer inquiry as soon as possible.
                You can reply directly to this email or call the customer at the phone number provided.
            </p>
        </div>
    </div>
</body>
</html>
