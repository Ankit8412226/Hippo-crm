const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const ProjectSettings = require('../models/ProjectSettings');
const Plot = require('../models/Plot');
const PlotMap = require('../models/PlotMap');
const CommissionPlan = require('../models/CommissionPlan');
const Transaction = require('../models/Transaction');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');

dotenv.config();

const cleanSeedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hippocrm';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('MongoDB Connected!');

    // 1. Clear dummy Collections (Transactions, Commissions, Payouts, Notifications, Users, Employees)
    await User.deleteMany({});
    await Employee.deleteMany({});
    await Transaction.deleteMany({});
    await Commission.deleteMany({});
    await Payout.deleteMany({});
    await Notification.deleteMany({});
    await Role.deleteMany({});
    await Project.deleteMany({});
    await ProjectSettings.deleteMany({});
    await Plot.deleteMany({});
    await PlotMap.deleteMany({});
    await CommissionPlan.deleteMany({});

    console.log('Cleared dummy agents, transactions, payouts, notifications, projects, and plots.');

    // 2. Roles
    await Role.insertMany([
      { name: 'ADMIN', permissions: ['all'] },
      { name: 'DIRECTOR', permissions: ['approve_payouts', 'view_reports'] },
      { name: 'MANAGER', permissions: ['manage_plots', 'view_tree'] },
      { name: 'AGENT', permissions: ['view_own_sales', 'create_booking'] }
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    // 3. Single Master Admin User & Employee (No dummy agents!)
    const adminUser = await User.create({
      fullName: 'Ankit Kumar (CEO)',
      email: 'ankit@hippo.com',
      password: defaultPassword,
      phone: '+91 9876543210',
      role: 'ADMIN'
    });

    const adminEmp = await Employee.create({
      userId: adminUser._id,
      employeeCode: 'EMP-1001',
      joiningDate: new Date('2023-01-01'),
      currentRank: 'Director Sales',
      selfSalesCount: 0,
      teamSalesCount: 0,
      activeLegsCount: 0,
      parentId: null
    });

    console.log('Created Master Admin User & Employee: Ankit Kumar (ankit@hippo.com / Password123!)');

    // 4. Commission Plans Matrix
    await CommissionPlan.insertMany([
      { rankName: 'Business Executive', minSelfSales: 2, minTeamSales: 0, minLegs: 0, timeLimitDays: 0, commissionPercent: 5 },
      { rankName: 'Sr Business Executive', minSelfSales: 2, minTeamSales: 5, minLegs: 2, timeLimitDays: 0, commissionPercent: 8 },
      { rankName: 'Team Leader', minSelfSales: 2, minTeamSales: 8, minLegs: 2, timeLimitDays: 0, commissionPercent: 10 },
      { rankName: 'Sr Team Leader', minSelfSales: 1, minTeamSales: 12, minLegs: 3, timeLimitDays: 0, commissionPercent: 12 },
      { rankName: 'Business Development Manager', minSelfSales: 1, minTeamSales: 20, minLegs: 3, timeLimitDays: 0, commissionPercent: 15 },
      { rankName: 'Associate Sales Director', minSelfSales: 0, minTeamSales: 50, minLegs: 3, timeLimitDays: 60, commissionPercent: 18 },
      { rankName: 'Director Sales', minSelfSales: 0, minTeamSales: 100, minLegs: 3, timeLimitDays: 0, commissionPercent: 20 }
    ]);

    // 5. Seed 5 Real Estate Projects with Plots & Naksa Maps (All Plots AVAILABLE for testing)
    const projectsData = [
      { name: 'Green Valley Enclave Phase 1', code: 'GVE-01', location: 'Sector 82, Gurgaon', totalAreaSqft: 400000, totalPlots: 30, basePricePerSqft: 4500 },
      { name: 'Horizon Heights Township', code: 'HHT-02', location: 'Noida Expressway, Sector 144', totalAreaSqft: 600000, totalPlots: 25, basePricePerSqft: 5200 },
      { name: 'Royal Palms Smart City', code: 'RPC-03', location: 'Golf Course Extension Road, Gurgaon', totalAreaSqft: 800000, totalPlots: 35, basePricePerSqft: 6800 },
      { name: 'Palm Meadows Luxury Villas', code: 'PML-04', location: 'Dwarka Expressway, Sector 109', totalAreaSqft: 500000, totalPlots: 25, basePricePerSqft: 5500 },
      { name: 'Emerald Hills Tech Township', code: 'EHT-05', location: 'Electronic City, Bangalore', totalAreaSqft: 750000, totalPlots: 40, basePricePerSqft: 4200 }
    ];

    const insertedProjects = [];
    const blocks = ['A', 'B', 'C', 'D'];

    for (const pData of projectsData) {
      const proj = await Project.create({
        ...pData,
        status: 'ACTIVE',
        launchDate: new Date('2024-01-10'),
        createdBy: adminUser._id
      });
      await ProjectSettings.create({ projectId: proj._id });
      insertedProjects.push(proj);

      const vectorOverlayData = [];

      for (let i = 1; i <= 20; i++) {
        const block = blocks[i % 4];
        const sizeSqft = 1200 + (i % 5) * 300;
        const price = sizeSqft * proj.basePricePerSqft;

        const col = (i - 1) % 5;
        const row = Math.floor((i - 1) / 5);
        const x = 50 + col * 140;
        const y = 50 + row * 110;

        const points = [
          { x, y },
          { x: x + 125, y },
          { x: x + 125, y: y + 90 },
          { x, y: y + 90 }
        ];

        const plotNo = `${block}-${100 + i}`;

        await Plot.create({
          projectId: proj._id,
          block,
          plotNo,
          sizeSqft,
          price,
          status: 'AVAILABLE',
          coordinates: { x, y, width: 125, height: 90 },
          polygon: { points },
          ownerName: '',
          ownerPhone: '',
          ownerId: null
        });

        vectorOverlayData.push({
          plotNo,
          status: 'AVAILABLE',
          sizeSqft,
          totalCost: price,
          polygonPoints: points,
          confidence: 0.98
        });
      }

      // Seed PlotMap (Naksa) for the project
      await PlotMap.create({
        projectId: proj._id,
        mapName: `${proj.name} Master Naksa Layout`,
        imageUrl: '/placeholder-map.png',
        vectorOverlayData,
        confidenceScore: 0.95,
        status: 'APPROVED'
      });
    }

    console.log(`Seeded ${insertedProjects.length} Projects with clean AVAILABLE Plots & Naksa Map Overlays.`);
    console.log('---------------------------------------------------------');
    console.log('SUCCESS! Database completely cleaned and ready for testing.');
    console.log('Master Admin Login Credentials:');
    console.log('Email: ankit@hippo.com');
    console.log('Password: Password123!');
    console.log('---------------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('Error cleaning & seeding DB:', error);
    process.exit(1);
  }
};

cleanSeedDB();
