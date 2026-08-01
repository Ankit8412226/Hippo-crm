const Employee = require('../models/Employee');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { calculateEmployeeSalesMetrics, evaluateAndUpgradeRank, getDownlineEmployeeIds } = require('../services/mlmEngine');

exports.getEmployees = async (req, res, next) => {
  try {
    let filter = {};

    if (req.user && !['ADMIN', 'DIRECTOR'].includes(req.user.role)) {
      const loggedInEmp = await Employee.findOne({ userId: req.user._id });
      if (!loggedInEmp) {
        return res.json([]);
      }
      const downlines = await getDownlineEmployeeIds(loggedInEmp._id);
      const allowedIds = [loggedInEmp._id, ...downlines];
      filter = { _id: { $in: allowedIds } };
    }

    const employees = await Employee.find(filter)
      .populate('userId', 'fullName email phone role avatar')
      .populate({
        path: 'parentId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .sort({ createdAt: -1 });

    res.json(employees);
  } catch (error) {
    next(error);
  }
};

exports.createEmployee = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, role, parentId, joiningDate } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'Password123!', salt);

    user = await User.create({
      fullName,
      email,
      phone,
      password: hashedPassword,
      role: role || 'AGENT'
    });

    // Auto-resolve parent sponsor from logged-in token user if not specified!
    let sponsorParentId = parentId;
    if (!sponsorParentId && req.user) {
      const loggedInEmployee = await Employee.findOne({ userId: req.user._id });
      if (loggedInEmployee) {
        sponsorParentId = loggedInEmployee._id;
      }
    }

    const empCount = await Employee.countDocuments();
    const employeeCode = `EMP-${1000 + empCount + 1}`;

    const employee = await Employee.create({
      userId: user._id,
      employeeCode,
      joiningDate: joiningDate || new Date(),
      currentRank: 'Business Executive',
      parentId: sponsorParentId || null
    });

    // If sponsor specified, automatically recalculate sales metrics & promote rank up the entire upline chain!
    if (sponsorParentId) {
      let currentId = sponsorParentId;
      while (currentId) {
        await calculateEmployeeSalesMetrics(currentId);
        await evaluateAndUpgradeRank(currentId);
        const parentEmp = await Employee.findById(currentId);
        currentId = parentEmp ? parentEmp.parentId : null;
      }
    }

    res.status(201).json({
      message: 'Agent created successfully and attached to sponsor tree with auto rank evaluation',
      employee,
      user
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { fullName, phone, currentRank, parentId } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    if (currentRank) employee.currentRank = currentRank;
    if (parentId !== undefined) employee.parentId = parentId || null;
    await employee.save();

    if (fullName || phone) {
      await User.findByIdAndUpdate(employee.userId, {
        ...(fullName && { fullName }),
        ...(phone && { phone })
      });
    }

    res.json({ message: 'Employee updated successfully', employee });
  } catch (error) {
    next(error);
  }
};

exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    await User.findByIdAndDelete(employee.userId);
    await Employee.findByIdAndDelete(id);

    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('userId', 'fullName email phone role avatar')
      .populate('parentId');

    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    if (req.user && !['ADMIN', 'DIRECTOR'].includes(req.user.role)) {
      const loggedInEmp = await Employee.findOne({ userId: req.user._id });
      if (!loggedInEmp) {
        return res.status(403).json({ message: 'Access denied: No employee profile found' });
      }
      const downlines = await getDownlineEmployeeIds(loggedInEmp._id);
      const allowedIds = [loggedInEmp._id.toString(), ...downlines.map(d => d.toString())];
      if (!allowedIds.includes(employee._id.toString())) {
        return res.status(403).json({ message: 'Access denied: You can only view details of yourself or employees under your hierarchy' });
      }
    }

    const metrics = await calculateEmployeeSalesMetrics(employee._id);

    res.json({
      employee,
      metrics
    });
  } catch (error) {
    next(error);
  }
};

exports.updateEmployeeRank = async (req, res, next) => {
  try {
    const result = await evaluateAndUpgradeRank(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
