import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import SEO from '../../components/SEO';

export default function Services() {
  const services = [
    {
      title: 'Slab Flattening & Planing',
      description:
        'Professional slab flattening and planing services to prepare your wood for any project. We can handle slabs of various sizes.',
      icon: '⚒️',
    },
    {
      title: 'Custom CNC Signs & Work',
      description:
        'From personalized home signs to business logos, our CNC capabilities bring your designs to life with precision and detail.',
      icon: '🔤',
    },
    {
      title: 'Laser Engraving',
      description:
        'Add a personal touch with laser engraving on wood, leather, and other materials. Perfect for gifts and custom branding.',
      icon: '⚡',
    },
    {
      title: 'Live Edge Furniture',
      description:
        'Beautiful custom tables, desks, and countertops showcasing the natural edge of the wood. Each piece is one-of-a-kind.',
      icon: '🪵',
    },
    {
      title: 'Custom Epoxy Designs',
      description:
        'Stunning river tables and epoxy-enhanced pieces that combine natural wood with vibrant colored resin for a modern look.',
      icon: '✨',
    },
    {
      title: 'Cornhole Boards & Scoreboards',
      description:
        'Custom cornhole sets perfect for tailgating, backyard BBQs, and family fun. Available in various designs and finishes.',
      icon: '🎯',
    },
    {
      title: 'Custom Cabinetry',
      description:
        'Built-to-fit cabinets and storage solutions for kitchens, bathrooms, garages, and any space that needs organization.',
      icon: '🗄️',
    },
    {
      title: '3D Printing & Design',
      description:
        'From prototypes to finished products, we offer 3D printing services for custom parts, decorative items, and more.',
      icon: '🖨️',
    },
    {
      title: 'Screen Printing',
      description:
        'Custom screen printing on apparel, wood, and other surfaces. Great for businesses, events, and personal projects.',
      icon: '🎨',
    },
  ];

  return (
    <PublicLayout>
      <SEO
        title="Services"
        description="Professional woodworking services: slab flattening, CNC signs, laser engraving, live edge furniture, epoxy designs, cornhole boards, custom cabinetry, 3D printing, and screen printing."
        keywords="slab flattening, CNC signs, laser engraving, live edge furniture, epoxy tables, custom cabinetry, cornhole boards, woodworking services"
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-wood-700 to-wood-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">Our Services</h1>
            <p className="text-xl text-wood-100">
              From custom furniture to precision CNC work, we do it all
            </p>
          </div>
        </section>

        {/* Intro */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xl text-gray-700 leading-relaxed">
              We offer a wide range of woodworking and fabrication services to bring
              your vision to life. Whether you need a custom piece of furniture, CNC
              work, or specialized finishing, we have the skills and equipment to
              deliver exceptional results.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition"
                >
                  <div className="text-6xl mb-6">{service.icon}</div>
                  <h3 className="text-2xl font-bold text-coffee-dark mb-4">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed mb-6">
                    {service.description}
                  </p>
                  <Link to="/contact">
                    <Button variant="secondary" size="sm">
                      Request Quote
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-coffee-dark mb-12 text-center">
              How We Work
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">
                  Consultation
                </h3>
                <p className="text-gray-600">
                  We discuss your vision, needs, and budget to understand your project.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">Design</h3>
                <p className="text-gray-600">
                  We create designs and provide detailed quotes for your approval.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">Build</h3>
                <p className="text-gray-600">
                  Our craftsmen bring your project to life with skill and precision.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-coffee text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">Deliver</h3>
                <p className="text-gray-600">
                  We deliver and install your finished piece, ensuring your satisfaction.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-coffee text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Let's Build Something Amazing</h2>
            <p className="text-xl text-wood-100 mb-8">
              Have a project in mind? Get in touch and let's discuss how we can help.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="bg-sawdust hover:bg-sawdust-dark">
                  Request a Quote
                </Button>
              </Link>
              <Link to="/gallery">
                <Button size="lg" variant="secondary">
                  View Our Work
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
