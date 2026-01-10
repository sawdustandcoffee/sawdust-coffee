<?php

namespace App\Mail;

use App\Models\NewsletterSubscriber;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class NewsletterConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public NewsletterSubscriber $subscriber;

    public function __construct(NewsletterSubscriber $subscriber)
    {
        $this->subscriber = $subscriber;
    }

    public function build()
    {
        $confirmUrl = env('FRONTEND_URL') . '/newsletter/confirm/' . $this->subscriber->confirmation_token;

        return $this->subject('Confirm Your Newsletter Subscription - Sawdust & Coffee')
            ->view('emails.newsletter-confirmation')
            ->with([
                'subscriber' => $this->subscriber,
                'confirmUrl' => $confirmUrl,
            ]);
    }
}
