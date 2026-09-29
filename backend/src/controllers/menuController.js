import { DailyMenu } from '../models/DailyMenu.js';
import { getTodayDateString, isPastCutoff } from '../utils/dateHelper.js';

// Default starter menu if today's menu hasn't been configured by admin
const getDefaultStarterMenu = (date) => ({
  date,
  cutoffTime: '10:30', // generous default so bookings are open for demo
  veg: {
    name: 'SRM Special: Ghee Podi Masala Dosa Platter',
    description: 'Crispy golden crepe roasted in pure ghee with spiced potato masala, served with fresh coconut chutney, tomato dip, and steaming sambar.',
    price: 65,
    imageUrl: 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
    tags: ['SRM Special', 'Pure Veg', 'Freshly Made'],
    isAvailable: true,
  },
  nonVeg: {
    name: 'SRM Cafeteria Signature: Chicken Keema Paratha & Egg',
    description: 'Whole wheat flaky paratha stuffed with flavorful minced chicken keema, served with spiced boondi raita, pickle, and a fluffy boiled egg.',
    price: 85,
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    tags: ['High Protein', 'Student Favorite', 'Chef Special'],
    isAvailable: true,
  },
});

// @desc    Get today's breakfast menu (exactly 1 Veg and 1 Non-Veg)
// @route   GET /api/menu/today
// @access  Public
export const getTodayMenu = async (req, res) => {
  try {
    const today = getTodayDateString();
    let menu = await DailyMenu.findOne({ date: today });

    if (!menu) {
      // Auto-initialize today's menu with delicious realistic breakfast
      const starter = getDefaultStarterMenu(today);
      menu = await DailyMenu.create(starter);
    }

    const isClosed = isPastCutoff(menu.cutoffTime, menu.date);

    return res.json({
      ...menu.toObject(),
      isBookingClosed: isClosed,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    console.error('getTodayMenu error:', error);
    return res.status(500).json({ message: error.message || 'Error fetching today menu' });
  }
};

// @desc    Get menu by specified date
// @route   GET /api/menu/:date
// @access  Public
export const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.params;
    let menu = await DailyMenu.findOne({ date });

    if (!menu) {
      return res.status(404).json({ message: `No breakfast menu found for date ${date}` });
    }

    const isClosed = isPastCutoff(menu.cutoffTime, menu.date);
    return res.json({
      ...menu.toObject(),
      isBookingClosed: isClosed,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Admin: Create or update daily breakfast menu
// @route   POST /api/menu
// @access  Private (Admin only)
export const upsertMenu = async (req, res) => {
  try {
    const { date, cutoffTime, veg, nonVeg } = req.body;

    const targetDate = date || getTodayDateString();

    if (!veg || !veg.name || !veg.price || !nonVeg || !nonVeg.name || !nonVeg.price) {
      return res.status(400).json({
        message: 'Both Veg and Non-Veg menu options (with name & price) must be provided.',
      });
    }

    // Upsert ensures strictly only ONE menu document per date
    const updatedMenu = await DailyMenu.findOneAndUpdate(
      { date: targetDate },
      {
        date: targetDate,
        cutoffTime: cutoffTime || '09:00',
        veg: {
          name: veg.name.trim(),
          description: veg.description || '',
          price: Number(veg.price),
          imageUrl: veg.imageUrl || 'https://images.unsplash.com/photo-1668236543090-82eba5ee5976?auto=format&fit=crop&w=600&q=80',
          tags: Array.isArray(veg.tags) ? veg.tags : (veg.tags ? veg.tags.split(',').map(t => t.trim()) : ['Veg']),
          isAvailable: veg.isAvailable !== false,
        },
        nonVeg: {
          name: nonVeg.name.trim(),
          description: nonVeg.description || '',
          price: Number(nonVeg.price),
          imageUrl: nonVeg.imageUrl || 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
          tags: Array.isArray(nonVeg.tags) ? nonVeg.tags : (nonVeg.tags ? nonVeg.tags.split(',').map(t => t.trim()) : ['Non-Veg']),
          isAvailable: nonVeg.isAvailable !== false,
        },
        createdBy: req.user._id,
      },
      { new: true, upsert: true, runValidators: true }
    );

    return res.status(200).json({
      message: `Breakfast menu for ${targetDate} updated successfully!`,
      menu: updatedMenu,
    });
  } catch (error) {
    console.error('upsertMenu error:', error);
    return res.status(500).json({ message: error.message || 'Error updating menu' });
  }
};
