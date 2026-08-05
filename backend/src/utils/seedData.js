const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Role = require('../models/Role');
const Employee = require('../models/Employee');
const Project = require('../models/Project');
const ProjectSettings = require('../models/ProjectSettings');
const Plot = require('../models/Plot');
const CommissionPlan = require('../models/CommissionPlan');
const Transaction = require('../models/Transaction');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const Notification = require('../models/Notification');
const { tableToRankOverrides } = require('../config/commissionPlans');

dotenv.config();

const firstNames = [
  'Ankit', 'Rahul', 'Mohit', 'Vivek', 'Amit', 'Priya', 'Rohan', 'Sneha', 'Vikram', 'Neha',
  'Siddharth', 'Pooja', 'Karan', 'Ritu', 'Manish', 'Kavita', 'Deepak', 'Swati', 'Rajesh', 'Ananya',
  'Gaurav', 'Divya', 'Sanjay', 'Megha', 'Arjun', 'Bhavna', 'Nikhil', 'Shweta', 'Varun', 'Preeti'
];

const lastNames = [
  'Kumar', 'Sharma', 'Verma', 'Singh', 'Patel', 'Gupta', 'Joshi', 'Mehta', 'Chawla', 'Bhasin',
  'Malhotra', 'Kapoor', 'Saxena', 'Bhatia', 'Aggarwal', 'Rao', 'Reddy', 'Nair'
];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const seedDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hippocrm';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000
    });
    console.log('MongoDB Connected!');

    // Clear existing collections
    await User.deleteMany({});
    await Role.deleteMany({});
    await Employee.deleteMany({});
    await Project.deleteMany({});
    await ProjectSettings.deleteMany({});
    await Plot.deleteMany({});
    await CommissionPlan.deleteMany({});
    await Transaction.deleteMany({});
    await Commission.deleteMany({});
    await Payout.deleteMany({});
    await Notification.deleteMany({});

    console.log('Cleared existing collections.');

    // 1. Roles
    await Role.insertMany([
      { name: 'ADMIN', permissions: ['all'] },
      { name: 'DIRECTOR', permissions: ['approve_payouts', 'view_reports'] },
      { name: 'MANAGER', permissions: ['manage_plots', 'view_tree'] },
      { name: 'AGENT', permissions: ['view_own_sales', 'create_booking'] }
    ]);

    const salt = await bcrypt.genSalt(10);
    const defaultPassword = await bcrypt.hash('Password123!', salt);

    // 2. CEO User & Employee
    const userCeo = await User.create({
      fullName: 'Ankit Kumar (CEO)',
      email: 'ankit@hippo.com',
      password: defaultPassword,
      phone: '+91 9876543210',
      role: 'ADMIN'
    });

    const empCeo = await Employee.create({
      userId: userCeo._id,
      employeeCode: 'EMP-1001',
      joiningDate: new Date('2023-01-01'),
      currentRank: 'Director Sales',
      selfSalesCount: 15,
      teamSalesCount: 120,
      activeLegsCount: 5,
      parentId: null
    });

    console.log('Created CEO: ANKIT KUMAR (Director Sales)');

    // 3. Create 50+ Downline Employees in hierarchical tree
    const createdEmployees = [empCeo];
    const totalEmps = 60;

    for (let i = 2; i <= totalEmps; i++) {
      const fName = getRandomItem(firstNames);
      const lName = getRandomItem(lastNames);
      const fullName = `${fName} ${lName} #${i}`;
      const email = `agent${i}@hippo.com`;

      const user = await User.create({
        fullName,
        email,
        password: defaultPassword,
        phone: `+91 ${9800000000 + i}`,
        role: i <= 4 ? 'DIRECTOR' : i <= 15 ? 'MANAGER' : 'AGENT'
      });

      let parentIndex = 0;
      if (i > 4 && i <= 15) {
        parentIndex = Math.floor(Math.random() * 4);
      } else if (i > 15 && i <= 35) {
        parentIndex = 4 + Math.floor(Math.random() * 11);
      } else if (i > 35) {
        parentIndex = 15 + Math.floor(Math.random() * 20);
      }

      const parentEmp = createdEmployees[parentIndex];

      const rankList = [
        'Business Executive',
        'Sr Business Executive',
        'Team Leader',
        'Sr Team Leader',
        'Business Development Manager',
        'Associate Sales Director'
      ];
      const rank = rankList[Math.floor(Math.random() * rankList.length)];

      const emp = await Employee.create({
        userId: user._id,
        employeeCode: `EMP-${1000 + i}`,
        joiningDate: new Date(Date.now() - Math.floor(Math.random() * 180) * 86400000),
        currentRank: rank,
        selfSalesCount: Math.floor(Math.random() * 6),
        teamSalesCount: Math.floor(Math.random() * 30),
        activeLegsCount: Math.floor(Math.random() * 4),
        parentId: parentEmp._id
      });

      createdEmployees.push(emp);
    }

    console.log(`Created ${createdEmployees.length} Employees in multi-tier MLM network.`);

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

    // 5. 5 Projects
    const projectsData = [
      { name: 'Green Valley Enclave Phase 1', code: 'GVE-01', location: 'Sector 82, Gurgaon', totalAreaSqft: 400000, totalPlots: 30, basePricePerSqft: 4500 },
      { name: 'Horizon Heights Township', code: 'HHT-02', location: 'Noida Expressway, Sector 144', totalAreaSqft: 600000, totalPlots: 25, basePricePerSqft: 5200 },
      { name: 'Royal Palms Smart City', code: 'RPC-03', location: 'Golf Course Extension Road, Gurgaon', totalAreaSqft: 800000, totalPlots: 35, basePricePerSqft: 6800 },
      { name: 'Palm Meadows Luxury Villas', code: 'PML-04', location: 'Dwarka Expressway, Sector 109', totalAreaSqft: 500000, totalPlots: 25, basePricePerSqft: 5500 },
      { name: 'Emerald Hills Tech Township', code: 'EHT-05', location: 'Electronic City, Bangalore', totalAreaSqft: 750000, totalPlots: 40, basePricePerSqft: 4200 }
    ];

    // Assign each project one of the three business-plan commission tables so
    // rates are genuinely per-project (and editable later via ProjectSettings).
    const planKeys = ['HIPPO_INFRA', 'RAMLOK', 'HIPPO_ENCLAVE'];

    const insertedProjects = [];
    for (let pi = 0; pi < projectsData.length; pi++) {
      const pData = projectsData[pi];
      const planKey = planKeys[pi % planKeys.length];
      const proj = await Project.create({
        ...pData,
        status: 'ACTIVE',
        launchDate: new Date('2024-01-10'),
        createdBy: userCeo._id
      });
      await ProjectSettings.create({
        projectId: proj._id,
        rankOverrides: tableToRankOverrides(planKey)
      });
      insertedProjects.push(proj);
    }

    console.log(`Created ${insertedProjects.length} Real Estate Projects.`);

    // 6. Plots & Transactions
    const statuses = ['AVAILABLE', 'BOOKED', 'PENDING', 'SOLD'];
    const blocks = ['A', 'B', 'C', 'D'];

    for (const proj of insertedProjects) {
      for (let i = 1; i <= 20; i++) {
        const status = statuses[(i + proj.totalPlots) % 4];
        const block = blocks[i % 4];
        const sizeSqft = 1200 + (i % 5) * 300;
        const price = sizeSqft * proj.basePricePerSqft;

        const col = (i - 1) % 5;
        const row = Math.floor((i - 1) / 5);
        const x = 50 + col * 140;
        const y = 50 + row * 110;

        const plot = await Plot.create({
          projectId: proj._id,
          block,
          plotNo: `${block}-${100 + i}`,
          sizeSqft,
          price,
          status,
          coordinates: { x, y, width: 125, height: 90 },
          polygon: {
            points: [
              { x, y },
              { x: x + 125, y },
              { x: x + 125, y: y + 90 },
              { x, y: y + 90 }
            ]
          },
          ownerName: status === 'SOLD' ? `${getRandomItem(firstNames)} ${getRandomItem(lastNames)}` : '',
          ownerPhone: status === 'SOLD' ? `+91 99${10000000 + i}` : ''
        });

        if (status === 'SOLD') {
          const sellerEmp = getRandomItem(createdEmployees);
          const tx = await Transaction.create({
            plotId: plot._id,
            buyerName: plot.ownerName,
            sellerEmployeeId: sellerEmp._id,
            amount: plot.price,
            paymentMode: 'NET_BANKING',
            status: 'COMPLETED',
            transactionDate: new Date()
          });

          const seedRate = 5; // entry Business Executive rate; internally consistent
          await Commission.create({
            transactionId: tx._id,
            plotId: plot._id,
            employeeId: sellerEmp._id,
            rankAtSale: sellerEmp.currentRank,
            saleAmount: plot.price,
            commissionRate: seedRate,
            differentialRate: seedRate,
            commissionAmount: Math.round((plot.price * seedRate) / 100 * 100) / 100,
            levelDepth: 0,
            status: 'CALCULATED',
            calculatedAt: new Date()
          });
        }
      }
    }

    console.log('Seeded Plots, Transactions & Differential Commissions.');
    console.log('Database Seeding COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding DB:', error);
    process.exit(1);
  }
};

seedDB();
