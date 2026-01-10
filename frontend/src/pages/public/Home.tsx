import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { Product, GalleryItem } from '../../types';
import { Button, Spinner } from '../../components/ui';
import PublicLayout from '../../layouts/PublicLayout';
import SEO from '../../components/SEO';

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHomeData();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, galleryRes] = await Promise.all([
        api.get('/public/products?featured=true&per_page=6'),
        api.get('/public/gallery?featured_only=true&per_page=6'),
      ]);

      setFeaturedProducts(productsRes.data.data || productsRes.data);
      setGalleryItems(galleryRes.data.data || galleryRes.data);
    } catch (err) {
      console.error('Failed to load home data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <SEO
        title="Home"
        description="Handcrafted custom woodworking from Wareham, Massachusetts. Specializing in live edge furniture, CNC signs, laser engraving, epoxy designs, and more. Make Cool Sh!t with us!"
        keywords="custom furniture, live edge tables, CNC signs, laser engraving, woodworking Massachusetts, Cape Cod woodworking, epoxy resin furniture"
      />
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-wood-700 to-wood-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Make Cool Sh!t
          </h1>
          <p className="text-xl md:text-2xl text-wood-100 mb-8">
            Handcrafted Woodworking from Wareham, Massachusetts
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/shop">
              <Button size="lg" className="bg-sawdust hover:bg-sawdust-dark">
                Shop Now
              </Button>
            </Link>
            <Link to="/contact">
              <Button size="lg" variant="secondary">
                Request a Quote
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* About Snippet */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-coffee-dark mb-6">
              Crafted with Passion
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-8">
              Sawdust & Coffee Woodworking is a family-owned business located in
              Wareham, Massachusetts - the Gateway to Cape Cod. We specialize in
              custom woodworking, from live edge furniture to CNC signs and
              everything in between.
            </p>
            <Link to="/about">
              <Button variant="secondary">Learn More About Us</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-coffee-dark mb-4">
              Featured Products
            </h2>
            <p className="text-lg text-gray-600">
              Check out some of our favorite pieces
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : featuredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/shop/${product.slug}`}
                    className="group"
                  >
                    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
                      <div className="aspect-square bg-gray-200 flex items-center justify-center">
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0].path}
                            alt={product.images[0].alt_text || product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                            loading="lazy"
                          />
                        ) : (
                          <span className="text-gray-400">No Image</span>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-coffee transition">
                          {product.name}
                        </h3>
                        {product.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {product.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <div>
                            {product.sale_price ? (
                              <div className="flex items-center gap-2">
                                <span className="text-2xl font-bold text-green-600">
                                  ${parseFloat(product.sale_price).toFixed(2)}
                                </span>
                                <span className="text-lg text-gray-500 line-through">
                                  ${parseFloat(product.price).toFixed(2)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-2xl font-bold text-coffee">
                                ${parseFloat(product.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-12">
                <Link to="/shop">
                  <Button size="lg">View All Products</Button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">
              No featured products available at the moment.
            </p>
          )}
        </div>
      </section>

      {/* Gallery Highlights */}
      {galleryItems.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-coffee-dark mb-4">
                Recent Work
              </h2>
              <p className="text-lg text-gray-600">
                See what we've been creating
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition"
                >
                  <div className="aspect-video bg-gray-200">
                    <img
                      src={item.image_path}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition">
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-semibold">{item.title}</h3>
                      {item.description && (
                        <p className="text-sm text-gray-200 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link to="/gallery">
                <Button size="lg" variant="secondary">
                  View Full Gallery
                </Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Services Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-coffee-dark mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600">
              From custom furniture to CNC work, we do it all
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Live Edge Furniture',
                description:
                  'Custom tables, desks, and countertops featuring natural wood edges',
                icon: '🪵',
              },
              {
                title: 'Custom CNC Signs',
                description:
                  'Personalized signs and decorative pieces with precision CNC carving',
                icon: '🔤',
              },
              {
                title: 'Epoxy Designs',
                description:
                  'Stunning river tables and epoxy-enhanced wood pieces',
                icon: '✨',
              },
              {
                title: 'Custom Cabinetry',
                description:
                  'Built-to-fit cabinets and storage solutions for any space',
                icon: '🗄️',
              },
              {
                title: 'Cornhole Boards',
                description:
                  'Custom cornhole sets perfect for tailgating and backyard fun',
                icon: '🎯',
              },
              {
                title: 'Slab Flattening',
                description:
                  'Professional planing and flattening services for your wood slabs',
                icon: '⚒️',
              },
            ].map((service, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition"
              >
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-coffee-dark mb-2">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/services">
              <Button size="lg">View All Services</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-coffee text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Your Project?</h2>
          <p className="text-xl text-wood-100 mb-8">
            Let's bring your vision to life with custom woodworking crafted just for
            you.
          </p>
          <Link to="/contact">
            <Button size="lg" className="bg-sawdust hover:bg-sawdust-dark">
              Get a Free Quote
            </Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
