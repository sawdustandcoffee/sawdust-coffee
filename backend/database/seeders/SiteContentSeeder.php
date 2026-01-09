<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $content = [
            // Homepage content
            [
                'key' => 'hero_title',
                'value' => 'Make Cool Sh!t',
                'type' => 'text',
                'group' => 'home',
                'description' => 'Main hero title on homepage',
            ],
            [
                'key' => 'hero_subtitle',
                'value' => 'Handcrafted Woodworking from Wareham, Massachusetts',
                'type' => 'text',
                'group' => 'home',
                'description' => 'Hero subtitle on homepage',
            ],
            [
                'key' => 'hero_cta_text',
                'value' => 'Shop Now',
                'type' => 'text',
                'group' => 'home',
                'description' => 'Hero call-to-action button text',
            ],
            [
                'key' => 'hero_cta_link',
                'value' => '/shop',
                'type' => 'text',
                'group' => 'home',
                'description' => 'Hero call-to-action button link',
            ],

            // About content
            [
                'key' => 'about_intro',
                'value' => 'Sawdust & Coffee Woodworking is a family-owned business located in Wareham, Massachusetts - the Gateway to Cape Cod. We specialize in custom woodworking, from live edge furniture to CNC signs and everything in between.',
                'type' => 'text',
                'group' => 'about',
                'description' => 'About page introduction paragraph',
            ],
            [
                'key' => 'about_mission',
                'value' => 'Our mission is to create unique, high-quality pieces that bring warmth and character to your space. Every piece is handcrafted with attention to detail and a passion for the craft.',
                'type' => 'text',
                'group' => 'about',
                'description' => 'Mission statement',
            ],

            // Contact information
            [
                'key' => 'contact_phone',
                'value' => '774-836-4958',
                'type' => 'text',
                'group' => 'contact',
                'description' => 'Business phone number',
            ],
            [
                'key' => 'contact_email',
                'value' => 'info@sawdustandcoffee.com',
                'type' => 'text',
                'group' => 'contact',
                'description' => 'Business email address',
            ],
            [
                'key' => 'contact_address',
                'value' => 'Wareham, Massachusetts',
                'type' => 'text',
                'group' => 'contact',
                'description' => 'Business location',
            ],
            [
                'key' => 'business_hours',
                'value' => 'By Appointment',
                'type' => 'text',
                'group' => 'contact',
                'description' => 'Business hours',
            ],

            // Services content
            [
                'key' => 'services_intro',
                'value' => 'We offer a wide range of woodworking services to bring your vision to life.',
                'type' => 'text',
                'group' => 'services',
                'description' => 'Services page introduction',
            ],

            // Team members
            [
                'key' => 'team_members',
                'value' => json_encode([
                    [
                        'name' => 'Paul Neri',
                        'role' => 'Master Craftsman',
                        'bio' => 'Expert in custom furniture and live edge designs',
                    ],
                    [
                        'name' => 'Jason Neri',
                        'role' => 'CNC Specialist',
                        'bio' => 'Specializes in CNC carving and precision work',
                    ],
                    [
                        'name' => 'Patrick Willett',
                        'role' => 'Designer & Builder',
                        'bio' => 'Focuses on custom designs and project management',
                    ],
                ]),
                'type' => 'json',
                'group' => 'about',
                'description' => 'Team member information',
            ],
        ];

        foreach ($content as $item) {
            SiteContent::updateOrCreate(
                ['key' => $item['key']],
                $item
            );
        }

        $this->command->info('Site content seeded successfully.');
    }
}
