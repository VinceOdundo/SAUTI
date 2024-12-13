const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Post = require('../models/Post');
const Project = require('../models/Project');
const Interaction = require('../models/Interaction');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Kenya locations data
const locations = [
  {
    county: 'Nairobi',
    constituencies: [
      {
        name: 'Westlands',
        wards: ['Parklands', 'Kitisuru', 'Mountain View']
      },
      {
        name: 'Dagoretti North',
        wards: ['Kilimani', 'Kawangware', 'Gatina']
      }
    ]
  },
  {
    county: 'Mombasa',
    constituencies: [
      {
        name: 'Nyali',
        wards: ['Frere Town', 'Ziwa La Ng\'ombe', 'Mkomani']
      },
      {
        name: 'Kisauni',
        wards: ['Mjambere', 'Junda', 'Bamburi']
      }
    ]
  },
  {
    county: 'Kisumu',
    constituencies: [
      {
        name: 'Kisumu Central',
        wards: ['Railways', 'Kondele', 'Market Milimani']
      },
      {
        name: 'Kisumu East',
        wards: ['Nyalenda A', 'Nyalenda B', 'Manyatta B']
      }
    ]
  }
];

// Helper function to get random location
const getRandomLocation = () => {
  const county = locations[Math.floor(Math.random() * locations.length)];
  const constituency = county.constituencies[Math.floor(Math.random() * county.constituencies.length)];
  const ward = constituency.wards[Math.floor(Math.random() * constituency.wards.length)];
  return {
    county: county.county,
    constituency: constituency.name,
    ward: ward
  };
};

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Organization.deleteMany({}),
      Post.deleteMany({}),
      Project.deleteMany({}),
      Interaction.deleteMany({})
    ]);

    // Create admin user
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@sauti.com',
      password: 'Admin@123456',
      role: 'admin',
      emailVerified: true,
      verificationStatus: 'approved',
      status: 'active',
      profile: {
        bio: 'System Administrator for Sauti Platform',
        location: getRandomLocation()
      }
    });

    // Create representative users
    const representatives = await Promise.all([
      User.create({
        name: 'John Representative',
        email: 'rep1@sauti.com',
        password: 'Rep@123456',
        role: 'representative',
        emailVerified: true,
        verificationStatus: 'approved',
        status: 'active',
        profile: {
          bio: 'Community Development Specialist with 5 years experience',
          location: getRandomLocation(),
          expertise: ['Community Development', 'Project Management'],
          education: 'Masters in Development Studies'
        }
      }),
      User.create({
        name: 'Sarah Representative',
        email: 'rep2@sauti.com',
        password: 'Rep@123456',
        role: 'representative',
        emailVerified: true,
        verificationStatus: 'approved',
        status: 'active',
        profile: {
          bio: 'Youth Empowerment Advocate and Program Coordinator',
          location: getRandomLocation(),
          expertise: ['Youth Development', 'Skills Training'],
          education: 'Bachelor in Social Sciences'
        }
      })
    ]);

    // Create citizen users
    const citizens = await Promise.all([
      User.create({
        name: 'Alice Citizen',
        email: 'citizen1@example.com',
        password: 'Citizen@123456',
        role: 'citizen',
        emailVerified: true,
        verificationStatus: 'approved',
        status: 'active',
        profile: {
          bio: 'Active community member interested in youth development',
          location: getRandomLocation(),
          interests: ['Education', 'Youth Empowerment']
        }
      }),
      User.create({
        name: 'Bob Citizen',
        email: 'citizen2@example.com',
        password: 'Citizen@123456',
        role: 'citizen',
        emailVerified: true,
        verificationStatus: 'approved',
        status: 'active',
        profile: {
          bio: 'Community activist focused on environmental conservation',
          location: getRandomLocation(),
          interests: ['Environment', 'Community Development']
        }
      }),
      User.create({
        name: 'Carol Citizen',
        email: 'citizen3@example.com',
        password: 'Citizen@123456',
        role: 'citizen',
        emailVerified: true,
        verificationStatus: 'approved',
        status: 'active',
        profile: {
          bio: 'Healthcare worker passionate about community health',
          location: getRandomLocation(),
          interests: ['Healthcare', 'Public Health']
        }
      })
    ]);

    // Create organizations
    const organizations = await Promise.all([
      Organization.create({
        name: 'Community Development Initiative',
        type: 'NGO',
        registrationNumber: 'NGO123456',
        description: 'Working for sustainable community development through education and technology',
        contact: {
          email: 'contact@cdi.org',
          phone: '+254700000000',
          address: getRandomLocation()
        },
        focus: ['Education', 'Technology', 'Youth'],
        mission: 'Empowering communities through sustainable development and technology',
        vision: 'A world where every community thrives through education and innovation',
        representatives: [{ user: representatives[0]._id, role: 'admin' }],
        verified: true,
        socialMedia: {
          facebook: 'https://facebook.com/cdi',
          twitter: 'https://twitter.com/cdi',
          linkedin: 'https://linkedin.com/company/cdi'
        }
      }),
      Organization.create({
        name: 'Youth Empowerment Kenya',
        type: 'CBO',
        registrationNumber: 'CBO789012',
        description: 'Dedicated to empowering youth through skills development and entrepreneurship',
        contact: {
          email: 'info@yek.org',
          phone: '+254711111111',
          address: getRandomLocation()
        },
        focus: ['Youth', 'Economic Empowerment', 'Technology'],
        mission: 'Creating opportunities for youth through skills and entrepreneurship',
        vision: 'A skilled and economically empowered youth population',
        representatives: [{ user: representatives[1]._id, role: 'admin' }],
        verified: true,
        socialMedia: {
          facebook: 'https://facebook.com/yek',
          twitter: 'https://twitter.com/yek',
          instagram: 'https://instagram.com/yek'
        }
      })
    ]);

    // Create projects
    const projects = await Promise.all([
      Project.create({
        title: 'Digital Skills Training Program',
        description: 'Comprehensive digital skills training program for youth',
        organization: organizations[0]._id,
        status: 'active',
        category: 'Education',
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        location: getRandomLocation(),
        budget: {
          amount: 1000000,
          currency: 'KES',
          breakdown: [
            { item: 'Training Materials', amount: 300000 },
            { item: 'Trainers', amount: 400000 },
            { item: 'Equipment', amount: 200000 },
            { item: 'Venue', amount: 100000 }
          ]
        },
        team: [representatives[0]._id],
        objectives: [
          {
            description: 'Train 1000 youth in digital skills',
            completed: false,
            milestones: [
              { description: 'Curriculum development', dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) },
              { description: 'Training of trainers', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
            ]
          },
          {
            description: 'Create 100 job opportunities',
            completed: false,
            milestones: [
              { description: 'Partner with tech companies', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
              { description: 'Job placement program', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) }
            ]
          }
        ],
        impact: {
          beneficiaries: 1000,
          metrics: [
            { name: 'Training Sessions', value: 50, unit: 'sessions' },
            { name: 'Job Placements', value: 0, unit: 'placements' },
            { name: 'Skills Acquired', value: 0, unit: 'skills' }
          ]
        },
        updates: [
          {
            title: 'Project Launch',
            content: 'Successfully launched the Digital Skills Training Program',
            date: new Date(),
            author: representatives[0]._id
          }
        ]
      }),
      Project.create({
        title: 'Community Health Awareness Program',
        description: 'Comprehensive health awareness and screening program',
        organization: organizations[1]._id,
        status: 'active',
        category: 'Health',
        startDate: new Date(),
        endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        location: getRandomLocation(),
        budget: {
          amount: 500000,
          currency: 'KES',
          breakdown: [
            { item: 'Health Equipment', amount: 200000 },
            { item: 'Medical Supplies', amount: 150000 },
            { item: 'Community Outreach', amount: 150000 }
          ]
        },
        team: [representatives[1]._id],
        objectives: [
          {
            description: 'Conduct 50 health awareness sessions',
            completed: false,
            milestones: [
              { description: 'Training materials development', dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) },
              { description: 'Community mobilization', dueDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) }
            ]
          },
          {
            description: 'Screen 5000 community members',
            completed: false,
            milestones: [
              { description: 'Health screening camps setup', dueDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) },
              { description: 'Medical partnerships', dueDate: new Date(Date.now() + 75 * 24 * 60 * 60 * 1000) }
            ]
          }
        ],
        impact: {
          beneficiaries: 5000,
          metrics: [
            { name: 'Health Sessions', value: 0, unit: 'sessions' },
            { name: 'Health Screenings', value: 0, unit: 'screenings' },
            { name: 'Referrals', value: 0, unit: 'referrals' }
          ]
        },
        updates: [
          {
            title: 'Program Initiation',
            content: 'Health Awareness Program officially started with community leaders',
            date: new Date(),
            author: representatives[1]._id
          }
        ]
      })
    ]);

    // Create posts
    const posts = await Promise.all([
      Post.create({
        title: 'Digital Skills Program Launch',
        content: 'We are excited to announce the launch of our Digital Skills Training Program...',
        author: representatives[0]._id,
        organization: organizations[0]._id,
        project: projects[0]._id,
        type: 'announcement',
        status: 'active',
        tags: ['Education', 'Technology', 'Youth'],
        location: getRandomLocation(),
        media: 'https://example.com/images/launch.jpg'
      }),
      Post.create({
        title: 'Community Health Initiative Update',
        content: 'Progress update on our Community Health Awareness Program...',
        author: representatives[1]._id,
        organization: organizations[1]._id,
        project: projects[1]._id,
        type: 'update',
        status: 'active',
        tags: ['Health', 'Community', 'Awareness'],
        location: getRandomLocation()
      })
    ]);

    // Create interactions
    await Promise.all([
      Interaction.create({
        citizen: citizens[0]._id,
        representative: representatives[0]._id,
        organization: organizations[0]._id,
        project: projects[0]._id,
        category: 'feedback',
        subject: 'Digital Skills Program Feedback',
        status: 'pending',
        priority: 'medium',
        messages: [{
          sender: citizens[0]._id,
          content: 'This is a great initiative! Looking forward to participating.',
          type: 'request'
        }]
      }),
      Interaction.create({
        citizen: citizens[1]._id,
        representative: representatives[1]._id,
        organization: organizations[1]._id,
        project: projects[1]._id,
        category: 'inquiry',
        subject: 'Health Screening Schedule',
        status: 'pending',
        priority: 'medium',
        messages: [{
          sender: citizens[1]._id,
          content: 'When will the health screenings start in our area?',
          type: 'request'
        }]
      }),
      Interaction.create({
        citizen: citizens[2]._id,
        representative: representatives[0]._id,
        organization: organizations[0]._id,
        category: 'feedback',
        subject: 'General Program Feedback',
        status: 'pending',
        priority: 'low',
        messages: [{
          sender: citizens[2]._id,
          content: 'I appreciate the work you are doing in our community.',
          type: 'request'
        }]
      })
    ]);

    console.log('Seed data created successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
