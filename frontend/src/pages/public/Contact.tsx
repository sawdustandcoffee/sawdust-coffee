import { useState } from 'react';
import api from '../../lib/axios';
import { Button, Input, Textarea, Card } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      setSubmitting(true);
      await api.post('/public/contact', formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
    } catch (err: any) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        alert(err.response?.data?.message || 'Failed to send message');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PublicLayout>
      <div className="bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-wood-700 to-wood-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-xl text-wood-100">
              Let's discuss your next woodworking project
            </p>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-coffee-dark mb-6">
                Send Us a Message
              </h2>

              {submitted ? (
                <Card>
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-gray-700 mb-6">
                      Thank you for reaching out. We'll get back to you soon!
                    </p>
                    <Button onClick={() => setSubmitted(false)}>
                      Send Another Message
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      error={errors.name?.[0]}
                    />

                    <Input
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      error={errors.email?.[0]}
                    />

                    <Input
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      helperText="Optional - We'll call you back if you prefer"
                      error={errors.phone?.[0]}
                    />

                    <Textarea
                      label="Message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      helperText="Tell us about your project"
                      error={errors.message?.[0]}
                    />

                    <Button type="submit" disabled={submitting} className="w-full">
                      {submitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </Card>
              )}
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-coffee-dark mb-6">
                Get in Touch
              </h2>

              <div className="space-y-6">
                {/* Location */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📍</div>
                    <div>
                      <h3 className="text-xl font-bold text-coffee-dark mb-2">
                        Location
                      </h3>
                      <p className="text-gray-700">
                        Wareham, Massachusetts
                        <br />
                        Gateway to Cape Cod
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Phone */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">📞</div>
                    <div>
                      <h3 className="text-xl font-bold text-coffee-dark mb-2">
                        Phone
                      </h3>
                      <a
                        href="tel:774-836-4958"
                        className="text-coffee hover:underline text-lg"
                      >
                        774-836-4958
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        Call us for immediate assistance
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Email */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">✉️</div>
                    <div>
                      <h3 className="text-xl font-bold text-coffee-dark mb-2">
                        Email
                      </h3>
                      <a
                        href="mailto:info@sawdustandcoffee.com"
                        className="text-coffee hover:underline text-lg"
                      >
                        info@sawdustandcoffee.com
                      </a>
                      <p className="text-sm text-gray-600 mt-1">
                        We'll respond within 24 hours
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Hours */}
                <Card>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">🕐</div>
                    <div>
                      <h3 className="text-xl font-bold text-coffee-dark mb-2">
                        Hours
                      </h3>
                      <p className="text-gray-700">By Appointment</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Contact us to schedule a consultation
                      </p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
