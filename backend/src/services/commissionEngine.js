const Employee = require('../models/Employee');
const ProjectSettings = require('../models/ProjectSettings');
const Commission = require('../models/Commission');
const Transaction = require('../models/Transaction');
const Plot = require('../models/Plot');
const { RANK_RULES, evaluateAndUpgradeRank } = require('./mlmEngine');

/**
 * Get base commission rate for a rank, considering project-level overrides if present
 */
async function getRankCommissionRate(rankName, projectId = null) {
  let baseRate = 5;
  const standardRule = RANK_RULES.find(r => r.rank === rankName);
  if (standardRule) {
    baseRate = standardRule.commissionPercent;
  }

  if (projectId) {
    const projSettings = await ProjectSettings.findOne({ projectId });
    if (projSettings && projSettings.rankOverrides && projSettings.rankOverrides.length > 0) {
      const override = projSettings.rankOverrides.find(o => o.rank === rankName);
      if (override && override.commissionPercent !== undefined) {
        return override.commissionPercent;
      }
    }
  }

  return baseRate;
}

/**
 * Process differential commissions for a newly completed plot transaction
 */
async function processDifferentialCommission(transactionId) {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) throw new Error('Transaction not found');

  const plot = await Plot.findById(transaction.plotId);
  if (!plot) throw new Error('Plot not found');

  const sellerEmployee = await Employee.findById(transaction.sellerEmployeeId);
  if (!sellerEmployee) throw new Error('Selling employee not found');

  // Increment seller's self sales count
  sellerEmployee.selfSalesCount += 1;
  await sellerEmployee.save();

  // Evaluate rank for seller
  await evaluateAndUpgradeRank(sellerEmployee._id);

  const createdCommissions = [];
  let previousMaxRate = 0;
  let currentEmp = await Employee.findById(sellerEmployee._id);
  let depth = 0;

  // Ascend upline tree to distribute differential commissions
  while (currentEmp) {
    const empRankRate = await getRankCommissionRate(currentEmp.currentRank, plot.projectId);
    
    // Differential rate = max(0, currentEmp_rate - previousMaxRate)
    const differentialRate = Math.max(0, empRankRate - previousMaxRate);

    if (differentialRate > 0) {
      const commissionAmount = (transaction.amount * differentialRate) / 100;

      const commRecord = await Commission.create({
        transactionId: transaction._id,
        plotId: plot._id,
        employeeId: currentEmp._id,
        rankAtSale: currentEmp.currentRank,
        saleAmount: transaction.amount,
        commissionRate: empRankRate,
        differentialRate: differentialRate,
        commissionAmount: commissionAmount,
        levelDepth: depth,
        status: 'CALCULATED',
        calculatedAt: new Date()
      });

      createdCommissions.push(commRecord);
      previousMaxRate = Math.max(previousMaxRate, empRankRate);
    }

    // Move to parent sponsor
    if (currentEmp.parentId) {
      currentEmp = await Employee.findById(currentEmp.parentId);
      depth++;
      if (currentEmp) {
        // Re-evaluate rank for parent upline as team sales updated
        await evaluateAndUpgradeRank(currentEmp._id);
      }
    } else {
      break;
    }
  }

  return createdCommissions;
}

module.exports = {
  getRankCommissionRate,
  processDifferentialCommission
};
