import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { CoinTransaction } from '../models/CoinTransaction.js';

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'quickbite_srm_fallback_jwt_secret_key_2026';
};

const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), { expiresIn: '30d' });
};

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { name, email, studentId, phone, password } = req.body;

    if (!name || !email || !password || !studentId) {
      return res.status(400).json({ message: 'Name, email, student ID, and password are required' });
    }

    // Business rule: SRM College email verification
    if (!email.toLowerCase().endsWith('@srmist.edu.in')) {
      return res.status(400).json({
        message: 'Registration requires an official SRM College email ending with @srmist.edu.in (e.g. your_name@srmist.edu.in)',
      });
    }

    const userExists = await User.findOne({ 
      $or: [{ email: email.toLowerCase() }, { studentId: studentId.toUpperCase() }] 
    });

    if (userExists) {
      if (userExists.email.toLowerCase() === email.toLowerCase()) {
        return res.status(400).json({ message: 'A student with this email already exists' });
      }
      return res.status(400).json({ message: 'A student with this Student ID already exists' });
    }

    // Give 10 Welcome Bonus Campus Coins to every new student
    const initialCoins = 10;

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      studentId: studentId.toUpperCase(),
      phone: phone || '',
      password,
      role: 'student',
      coins: initialCoins,
    });

    // Record welcome bonus transaction
    await CoinTransaction.create({
      student: user._id,
      amount: initialCoins,
      type: 'WELCOME_BONUS',
      description: 'QuickBite Welcome Bonus: 10 Free Campus Coins!',
      balanceAfter: initialCoins,
      referenceId: 'WELCOME',
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
      },
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Server error during registration' });
  }
};

// @desc    Authenticate student or admin & get token
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { identifier, password } = req.body; // identifier can be email or studentId

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please provide email/student ID and password' });
    }

    const normalizedIdentifier = identifier.trim();

    const user = await User.findOne({
      $or: [
        { email: normalizedIdentifier.toLowerCase() },
        { studentId: normalizedIdentifier.toUpperCase() },
      ],
    });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials. Please verify your details.' });
    }

    const token = generateToken(user._id);

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        role: user.role,
        coins: user.coins,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// @desc    Get student coin transactions
// @route   GET /api/auth/coins/transactions
// @access  Private
export const getMyCoinTransactions = async (req, res) => {
  try {
    const transactions = await CoinTransaction.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(transactions);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
