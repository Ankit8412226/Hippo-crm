const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Employee = require('../models/Employee');
const { JWT_SECRET, JWT_EXPIRE } = require('../config/jwt');

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

exports.register = async (req, res, next) => {
  try {
    const { email, password, fullName, phone, parentEmployeeId } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // SECURITY: self-registration is ALWAYS an AGENT. Privileged roles
    // (ADMIN/DIRECTOR/etc.) can only be granted by an admin via employee
    // management — never from the public register body.
    user = await User.create({
      email,
      password: hashedPassword,
      fullName,
      phone,
      role: 'AGENT'
    });

    // Create corresponding Employee record
    const empCount = await Employee.countDocuments();
    const employeeCode = `EMP-${1000 + empCount + 1}`;

    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      joiningDate: new Date(),
      currentRank: 'Business Executive',
      parentId: parentEmployeeId || null
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      employee: {
        id: employee._id,
        employeeCode: employee.employeeCode,
        currentRank: employee.currentRank
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const employee = await Employee.findOne({ userId: user._id });

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role
      },
      employee: employee ? {
        id: employee._id,
        employeeCode: employee.employeeCode,
        currentRank: employee.currentRank,
        selfSalesCount: employee.selfSalesCount,
        teamSalesCount: employee.teamSalesCount,
        activeLegsCount: employee.activeLegsCount
      } : null
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    const employee = await Employee.findOne({ userId: user._id }).populate('parentId');

    res.json({
      user,
      employee
    });
  } catch (error) {
    next(error);
  }
};
