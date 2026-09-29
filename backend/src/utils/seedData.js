import { User } from '../models/User.js';
import { DailyMenu } from '../models/DailyMenu.js';
import { Reward } from '../models/Reward.js';
import { CoinTransaction } from '../models/CoinTransaction.js';
import { Booking } from '../models/Booking.js';
import { getTodayDateString } from './dateHelper.js';
import { generateQrCodeDataUrl } from './qr.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('🌱 Database already seeded. Skipping initial seed.');
      return;
    }

    console.log('🌱 Starting initial database seed for SRM College...');

    // 1. Create SRM Cafeteria Admin
    const admin = await User.create({
      name: 'SRM Cafeteria Manager',
      email: 'admin@srmist.edu.in',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210',
    });

    // 2. Create Sample SRM Students
    const student1 = await User.create({
      name: 'Bharathram N',
      email: 'bharath@srmist.edu.in',
      studentId: 'RA2111003010001',
      password: 'student123',
      role: 'student',
      phone: '+91 91234 56789',
      coins: 35, // 10 welcome + 25 earned
    });

    const student2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@srmist.edu.in',
      studentId: 'RA2111003010002',
      password: 'student123',
      role: 'student',
      phone: '+91 92345 67890',
      coins: 15,
    });

    // 3. Create Coin Transactions for student1
    await CoinTransaction.create([
      {
        student: student1._id,
        amount: 10,
        type: 'WELCOME_BONUS',
        description: 'QuickBite Welcome Bonus: 10 Free Campus Coins!',
        balanceAfter: 10,
        referenceId: 'WELCOME',
      },
      {
        student: student1._id,
        amount: 5,
        type: 'EARNED_BOOKING',
        description: 'Collected SRM Special Dosa Platter at Cafeteria TP1',
        balanceAfter: 15,
        referenceId: 'QB-20260925-A1B2C',
      },
      {
        student: student1._id,
        amount: 5,
        type: 'EARNED_BOOKING',
        description: 'Collected Chicken Keema Paratha at Food joint UB building',
        balanceAfter: 20,
        referenceId: 'QB-20260926-D3E4F',
      },
      {
        student: student1._id,
        amount: 5,
        type: 'EARNED_BOOKING',
        description: 'Collected Idli Vada Combo at Cafeteria Main block',
        balanceAfter: 25,
        referenceId: 'QB-20260927-G5H6I',
      },
      {
        student: student1._id,
        amount: 5,
        type: 'EARNED_BOOKING',
        description: 'Collected Egg Bhurji Pav at Cafeteria TP1',
        balanceAfter: 30,
        referenceId: 'QB-20260928-J7K8L',
      },
      {
        student: student1._id,
        amount: 5,
        type: 'EARNED_BOOKING',
        description: 'Collected Masala Dosa Platter at Food joint UB building',
        balanceAfter: 35,
        referenceId: 'QB-20260928-M9N0O',
      },
    ]);

    // 4. Create Rewards Catalog
    await Reward.create([
      {
        name: 'Chilled Coca-Cola (300ml Can)',
        description: 'Ice-cold refreshing soda can straight from the beverage fridge.',
        coinCost: 25,
        category: 'Beverage',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'South Indian Filter Coffee',
        description: 'Aromatic, freshly brewed traditional brass-tumbler filter coffee with frothy milk.',
        coinCost: 20,
        category: 'Beverage',
        imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Crispy Salted French Fries Bowl',
        description: 'Golden crunchy potato fries tossed with Himalayan pink salt and oregano.',
        coinCost: 40,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Warm Choco Lava Cake',
        description: 'Decadent molten dark chocolate lava cake baked fresh.',
        coinCost: 50,
        category: 'Dessert',
        imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Crispy Veg Nuggets Platter',
        description: '6 pieces of golden crunch vegetable nuggets with mint mayo dip.',
        coinCost: 45,
        category: 'Snacks',
        imageUrl: 'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
      {
        name: 'Super SRM Deluxe Meal Upgrade',
        description: 'Complete lunch meal voucher: Main Course + Dessert + Cold Drink.',
        coinCost: 100,
        category: 'Meal Voucher',
        imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
        isActive: true,
      },
    ]);

    // 5. Create Today's Menu with ₹65 Veg and ₹85 Non-Veg
    const today = getTodayDateString();
    await DailyMenu.create({
      date: today,
      cutoffTime: '23:59', // Booking is currently open for testing
      veg: {
        name: 'SRM Special: Ghee Podi Masala Dosa Platter',
        description: 'Crispy golden crepe roasted in pure ghee with spiced potato masala, served with fresh coconut chutney, tomato dip, and steaming sambar.',
        price: 65, // User requested 65 for veg
        imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
        tags: ['SRM Special', 'Pure Veg', 'Freshly Made'],
        isAvailable: true,
      },
      nonVeg: {
        name: 'SRM Cafeteria Signature: Chicken Keema Paratha & Egg',
        description: 'Whole wheat flaky paratha stuffed with flavorful minced chicken keema, served with spiced boondi raita, pickle, and a fluffy boiled egg.',
        price: 85, // User requested 85 for non-veg
        imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
        tags: ['High Protein', 'Student Favorite', 'Chef Special'],
        isAvailable: true,
      },
      createdBy: admin._id,
    });

    // 6. Create sample booking for Priya with pickup point
    const sampleBookingId = `QB-${today.replace(/-/g, '')}-P77A1`;
    const qrPayload = JSON.stringify({
      type: 'BREAKFAST_BOOKING',
      bookingId: sampleBookingId,
      studentId: student2.studentId,
      studentName: student2.name,
      mealType: 'non_veg',
      quantity: 1,
      pickupPoint: 'Food joint UB building',
      date: today,
    });
    const qrCodeDataUrl = await generateQrCodeDataUrl(qrPayload);

    await Booking.create({
      bookingId: sampleBookingId,
      student: student2._id,
      date: today,
      mealType: 'non_veg',
      mealName: 'SRM Cafeteria Signature: Chicken Keema Paratha & Egg',
      unitPrice: 85,
      quantity: 1,
      totalPrice: 85,
      pickupPoint: 'Food joint UB building',
      status: 'Pending',
      qrCodeDataUrl,
    });

    console.log('✅ SRM College realistic seed data inserted successfully!');
    console.log('   Admin Login: admin@srmist.edu.in / admin123');
    console.log('   Student Login: bharath@srmist.edu.in / student123 (35 coins)');
  } catch (error) {
    console.error('❌ Error during database seeding:', error);
  }
};
