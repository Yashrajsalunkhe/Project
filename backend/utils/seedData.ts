import User from '../models/User.js';
import Post from '../models/Post.js';

const indianUsers = [
  { name: 'Arjun Sharma', email: 'arjun.sharma@gmail.com', age: 28 },
  { name: 'Priya Patel', email: 'priya.patel@gmail.com', age: 24 },
  { name: 'Rajesh Kumar', email: 'rajesh.kumar@gmail.com', age: 32 },
  { name: 'Anita Singh', email: 'anita.singh@gmail.com', age: 29 },
  { name: 'Vikram Reddy', email: 'vikram.reddy@gmail.com', age: 26 },
  { name: 'Sneha Gupta', email: 'sneha.gupta@gmail.com', age: 27 },
  { name: 'Rahul Joshi', email: 'rahul.joshi@gmail.com', age: 31 },
  { name: 'Kavya Nair', email: 'kavya.nair@gmail.com', age: 25 },
  { name: 'Aditya Agarwal', email: 'aditya.agarwal@gmail.com', age: 30 },
  { name: 'Meera Iyer', email: 'meera.iyer@gmail.com', age: 23 },
  { name: 'Suresh Chandra', email: 'suresh.chandra@gmail.com', age: 35 },
  { name: 'Riya Desai', email: 'riya.desai@gmail.com', age: 26 },
  { name: 'Karan Malhotra', email: 'karan.malhotra@gmail.com', age: 29 },
  { name: 'Pooja Verma', email: 'pooja.verma@gmail.com', age: 24 },
  { name: 'Abhishek Yadav', email: 'abhishek.yadav@gmail.com', age: 33 }
];

const samplePosts = [
  {
    title: 'Digital India Initiative: A Success Story',
    content: 'The Digital India initiative has transformed how we access government services. From online tax filing to digital payments, technology has made our lives easier and more convenient.'
  },
  {
    title: 'Sustainable Development in Indian Cities',
    content: 'Indian cities are embracing sustainable development practices. From solar energy adoption to waste management systems, we are seeing positive changes in urban planning and environmental consciousness.'
  },
  {
    title: 'The Rise of Indian Startups',
    content: 'India has become a global startup hub with numerous unicorns emerging in various sectors. The entrepreneurial spirit and innovation ecosystem continue to thrive and attract international investment.'
  },
  {
    title: 'Traditional Arts in Modern Times',
    content: 'Indian traditional arts like classical dance, music, and handicrafts are finding new relevance in the modern world. Social media and digital platforms are helping preserve and promote our cultural heritage.'
  },
  {
    title: 'Education Technology Revolution',
    content: 'The education sector in India has witnessed a remarkable digital transformation. Online learning platforms and educational apps have made quality education accessible to students across the country.'
  },
  {
    title: 'Ayurveda and Modern Healthcare',
    content: 'The integration of Ayurveda with modern healthcare is gaining momentum in India. Many wellness centers now offer holistic treatment approaches combining traditional wisdom with contemporary medical practices.'
  },
  {
    title: 'Agricultural Innovation in Rural India',
    content: 'Farmers across India are adopting precision agriculture techniques and modern farming tools. From drone-based crop monitoring to smart irrigation systems, technology is revolutionizing farming practices.'
  },
  {
    title: 'Indian Cinema Goes Global',
    content: 'Bollywood and regional cinema are gaining international recognition. With streaming platforms showcasing Indian content worldwide, our film industry is reaching new audiences and breaking cultural barriers.'
  },
  {
    title: 'Yoga and Wellness Tourism',
    content: 'India has become a premier destination for yoga and wellness tourism. Rishikesh and Kerala attract thousands of international visitors seeking spiritual and physical well-being through ancient practices.'
  },
  {
    title: 'Space Technology Achievements',
    content: 'ISRO continues to make remarkable achievements in space technology. From Mars missions to satellite launches, India is establishing itself as a major player in the global space industry.'
  },
  {
    title: 'Renewable Energy Initiatives',
    content: 'India is leading the way in renewable energy adoption. Solar parks and wind farms across the country are contributing significantly to our clean energy goals and sustainable development.'
  },
  {
    title: 'Indian Cuisine and Food Culture',
    content: 'The diversity of Indian cuisine reflects our rich cultural heritage. From street food to fine dining, Indian flavors are gaining popularity worldwide and showcasing our culinary traditions.'
  }
];

export const seedDatabase = async (): Promise<void> => {
  try {
    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create users
    const createdUsers = await User.insertMany(indianUsers);
    console.log(`👥 Created ${createdUsers.length} Indian users`);

    // Create posts with random user assignments
    const postsWithUsers = samplePosts.map((post, index) => ({
      ...post,
      userId: createdUsers[index % createdUsers.length]!._id
    }));

    const createdPosts = await Post.insertMany(postsWithUsers);
    console.log(`📝 Created ${createdPosts.length} sample posts`);

    console.log('✅ Database seeded successfully with Indian sample data');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};
