import { Link } from 'react-router-dom';
import { Button } from '../../components/ui';
import Breadcrumb from '../../components/Breadcrumb';
import PublicLayout from '../../layouts/PublicLayout';
import SEO from '../../components/SEO';

export default function About() {
  const team = [
    {
      name: 'Paul Neri',
      role: 'Master Craftsman',
      bio: 'Expert in custom furniture and live edge designs with over 20 years of experience.',
    },
    {
      name: 'Jason Neri',
      role: 'CNC Specialist',
      bio: 'Specializes in CNC carving and precision work, bringing designs to life with cutting-edge technology.',
    },
    {
      name: 'Patrick Willett',
      role: 'Designer & Builder',
      bio: 'Focuses on custom designs and project management, ensuring every piece exceeds expectations.',
    },
  ];

  return (
    <PublicLayout>
      <SEO
        title="About Us"
        description="Meet the team at Sawdust & Coffee Woodworking. Family-owned business from Wareham, MA specializing in custom woodworking. Learn about Paul, Jason, and Patrick Neri."
        keywords="about Sawdust Coffee, woodworking team, Wareham Massachusetts, family woodworking business, custom craftsmen"
      />
      <div className="bg-white">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-wood-700 to-wood-900 text-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl font-bold mb-6">About Us</h1>
            <p className="text-xl text-wood-100">
              Family-owned woodworking from the Gateway to Cape Cod
            </p>
          </div>
        </section>

        {/* Breadcrumb */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb items={[{ label: 'About' }]} />
        </div>

        {/* Story Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-coffee-dark mb-6 text-center">
              Our Story
            </h2>
            <div className="text-lg text-gray-700 space-y-4 leading-relaxed">
              <p>
                Sawdust & Coffee Woodworking is a family-owned business located in
                Wareham, Massachusetts - the Gateway to Cape Cod. We specialize in
                custom woodworking, from live edge furniture to CNC signs and
                everything in between.
              </p>
              <p>
                Our mission is to create unique, high-quality pieces that bring warmth
                and character to your space. Every piece is handcrafted with attention
                to detail and a passion for the craft.
              </p>
              <p>
                Whether you're looking for a stunning live edge table, custom cabinetry,
                or a personalized CNC sign, we work closely with you to bring your
                vision to life. We believe in the beauty of natural wood and the
                artistry of craftsmanship.
              </p>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-coffee-dark mb-6">Our Mission</h2>
            <p className="text-xl text-gray-700 leading-relaxed">
              To create exceptional, handcrafted woodwork that celebrates the natural
              beauty of wood while delivering functional art that our customers will
              treasure for generations.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-coffee-dark mb-12 text-center">
              Meet the Team
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-lg p-6 text-center hover:shadow-xl transition"
                >
                  <div className="w-32 h-32 bg-gradient-to-br from-wood-400 to-wood-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-2xl font-bold text-coffee-dark mb-2">
                    {member.name}
                  </h3>
                  <p className="text-coffee font-semibold mb-4">{member.role}</p>
                  <p className="text-gray-600">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-coffee-dark mb-12 text-center">
              What We Value
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">
                  Quality Craftsmanship
                </h3>
                <p className="text-gray-600">
                  Every piece is built to last, using premium materials and expert
                  techniques.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">💡</div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">
                  Custom Designs
                </h3>
                <p className="text-gray-600">
                  We work with you to create pieces that match your unique vision and
                  space.
                </p>
              </div>
              <div className="text-center">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-coffee-dark mb-2">
                  Customer Satisfaction
                </h3>
                <p className="text-gray-600">
                  Your happiness with our work is our top priority, from concept to
                  delivery.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-coffee-dark mb-6">
              Ready to Work Together?
            </h2>
            <p className="text-xl text-gray-700 mb-8">
              Let's discuss your next woodworking project and bring your ideas to life.
            </p>
            <Link to="/contact">
              <Button size="lg">Get in Touch</Button>
            </Link>
          </div>
        </section>
      </div>
    </PublicLayout>
  );
}
