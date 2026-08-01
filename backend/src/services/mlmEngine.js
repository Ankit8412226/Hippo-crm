const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const EmployeeHierarchy = require('../models/EmployeeHierarchy');

// Rank Criteria Matrix based on Hippo Business Plan
const RANK_RULES = [
  {
    rank: 'Director Sales',
    commissionPercent: 20,
    minSelfSales: 0,
    minTeamSales: 100,
    minLegs: 3,
    timeLimitDays: null
  },
  {
    rank: 'Associate Sales Director',
    commissionPercent: 18,
    minSelfSales: 0,
    minTeamSales: 50,
    minLegs: 3,
    timeLimitDays: 60
  },
  {
    rank: 'Business Development Manager',
    commissionPercent: 15,
    minSelfSales: 1,
    minTeamSales: 20,
    minLegs: 3,
    timeLimitDays: null
  },
  {
    rank: 'Sr Team Leader',
    commissionPercent: 12,
    minSelfSales: 1,
    minTeamSales: 12,
    minLegs: 3,
    timeLimitDays: null
  },
  {
    rank: 'Team Leader',
    commissionPercent: 10,
    minSelfSales: 2,
    minTeamSales: 8,
    minLegs: 2,
    timeLimitDays: null
  },
  {
    rank: 'Sr Business Executive',
    commissionPercent: 8,
    minSelfSales: 2,
    minTeamSales: 5,
    minLegs: 2,
    timeLimitDays: null
  },
  {
    rank: 'Business Executive',
    commissionPercent: 5,
    minSelfSales: 2,
    minTeamSales: 0,
    minLegs: 0,
    timeLimitDays: null
  }
];

/**
 * Get all downline employee IDs recursively for a given employee
 */
async function getDownlineEmployeeIds(employeeId) {
  const children = await Employee.find({ parentId: employeeId }).select('_id');
  let allDownlineIds = children.map(c => c._id);

  for (const child of children) {
    const subDownline = await getDownlineEmployeeIds(child._id);
    allDownlineIds = allDownlineIds.concat(subDownline);
  }
  return allDownlineIds;
}

/**
 * Calculate team sales & active legs for an employee
 */
async function calculateEmployeeSalesMetrics(employeeId) {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const directLegs = await Employee.find({ parentId: employeeId });
  let activeLegsCount = 0;
  let totalTeamSalesCount = 0;

  for (const leg of directLegs) {
    const legDownlines = await getDownlineEmployeeIds(leg._id);
    const legAllEmployeeIds = [leg._id, ...legDownlines];

    const legEmployees = await Employee.find({ _id: { $in: legAllEmployeeIds } });
    const legTotalSales = legEmployees.reduce((sum, emp) => sum + emp.selfSalesCount, 0);

    totalTeamSalesCount += legTotalSales;

    if (legTotalSales > 0 || leg.selfSalesCount > 0) {
      activeLegsCount++;
    }
  }

  employee.teamSalesCount = totalTeamSalesCount;
  employee.activeLegsCount = activeLegsCount;
  await employee.save();

  return {
    selfSalesCount: employee.selfSalesCount,
    teamSalesCount: totalTeamSalesCount,
    activeLegsCount: activeLegsCount,
    joiningDate: employee.joiningDate
  };
}

/**
 * Evaluate and promote employee rank based on criteria
 */
async function evaluateAndUpgradeRank(employeeId) {
  const employee = await Employee.findById(employeeId);
  if (!employee) throw new Error('Employee not found');

  const metrics = await calculateEmployeeSalesMetrics(employeeId);

  const daysSinceJoining = Math.floor(
    (Date.now() - new Date(metrics.joiningDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  let newRank = 'Business Executive';
  let commissionRate = 5;

  for (const rule of RANK_RULES) {
    if (metrics.selfSalesCount < rule.minSelfSales) continue;
    if (metrics.teamSalesCount < rule.minTeamSales) continue;
    if (metrics.activeLegsCount < rule.minLegs) continue;

    if (rule.timeLimitDays !== null && daysSinceJoining > rule.timeLimitDays) {
      continue;
    }

    newRank = rule.rank;
    commissionRate = rule.commissionPercent;
    break; // Top matching rank found
  }

  if (employee.currentRank !== newRank) {
    employee.currentRank = newRank;
    await employee.save();
  }

  return {
    employeeId: employee._id,
    currentRank: employee.currentRank,
    commissionRate,
    metrics
  };
}

/**
 * Build recursive downline tree for visual rendering.
 * Safely handles rootEmployeeId (ObjectId or fallback).
 */
async function getMLMTree(rootEmployeeId = null) {
  let root = null;

  if (rootEmployeeId && mongoose.Types.ObjectId.isValid(rootEmployeeId)) {
    root = await Employee.findById(rootEmployeeId).populate('userId', 'fullName email phone avatar');
  }

  // If no valid root found by ID, try finding by employeeCode or top level CEO (parentId: null)
  if (!root) {
    root = await Employee.findOne({ parentId: null }).populate('userId', 'fullName email phone avatar');
  }

  // Final fallback to any employee
  if (!root) {
    root = await Employee.findOne().populate('userId', 'fullName email phone avatar');
  }

  if (!root) return null;

  async function buildNode(emp) {
    const children = await Employee.find({ parentId: emp._id }).populate('userId', 'fullName email phone avatar');
    const childNodes = [];

    for (const child of children) {
      const childTree = await buildNode(child);
      childNodes.push(childTree);
    }

    const rule = RANK_RULES.find(r => r.rank === emp.currentRank) || RANK_RULES[RANK_RULES.length - 1];

    return {
      id: emp._id.toString(),
      employeeCode: emp.employeeCode,
      name: emp.userId ? emp.userId.fullName : 'Employee',
      email: emp.userId ? emp.userId.email : '',
      phone: emp.userId ? emp.userId.phone : '',
      avatar: emp.userId ? emp.userId.avatar : '',
      currentRank: emp.currentRank,
      commissionPercent: rule.commissionPercent,
      selfSalesCount: emp.selfSalesCount,
      teamSalesCount: emp.teamSalesCount,
      activeLegsCount: emp.activeLegsCount,
      parentId: emp.parentId ? emp.parentId.toString() : null,
      children: childNodes
    };
  }

  return await buildNode(root);
}

module.exports = {
  RANK_RULES,
  calculateEmployeeSalesMetrics,
  evaluateAndUpgradeRank,
  getDownlineEmployeeIds,
  getMLMTree
};
