export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'AGENT' | 'DIRECTOR';
  avatar?: string;
}

export interface Employee {
  id: string;
  employeeCode: string;
  currentRank: string;
  selfSalesCount: number;
  teamSalesCount: number;
  activeLegsCount: number;
  joiningDate: string;
  parentId?: string | null;
  userId?: User;
}

export interface MLMTreeNode {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  currentRank: string;
  commissionPercent: number;
  selfSalesCount: number;
  teamSalesCount: number;
  activeLegsCount: number;
  parentId?: string | null;
  children: MLMTreeNode[];
}

export interface Project {
  _id: string;
  name: string;
  code: string;
  location: string;
  totalAreaSqft: number;
  totalPlots: number;
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED';
  basePricePerSqft: number;
}

export interface Plot {
  _id: string;
  projectId: string | Project;
  block: string;
  plotNo: string;
  sizeSqft: number;
  sellableSqYrd?: number;
  carpetSqYrd?: number;
  plc12mtr?: number;
  plc9mtr?: number;
  plcCorner?: number;
  plcParkFacing?: number;
  totalPlc?: number;
  discountedPlc?: number;
  otmc?: number;
  gstOnOtherCharges?: number;
  totalCost?: number;
  price: number;
  status: 'AVAILABLE' | 'BOOKED' | 'PENDING' | 'SOLD';
  coordinates?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  polygon?: {
    points: { x: number; y: number }[];
    svgPath?: string;
  };
  ownerName?: string;
  ownerPhone?: string;
  ownerEmail?: string;
  bookingDate?: string;
  paidAmount?: number;
  dueBalance?: number;
  registryDate?: string;
  registryStatus?: 'NOT_REGISTERED' | 'PENDING' | 'REGISTERED';
  paymentMilestones?: PaymentMilestone[];
}

export interface PaymentMilestone {
  _id?: string;
  title: string;
  amount: number;
  dueDate: string;
  status: 'PENDING' | 'RECEIVED' | 'OVERDUE';
  paymentMode?: string;
  receivedDate?: string;
  notes?: string;
}

export interface PlotDocument {
  _id: string;
  plotId: string;
  documentType: string;
  title: string;
  fileUrl: string;
  createdAt: string;
}

export interface Commission {
  _id: string;
  plotId: Plot;
  employeeId: Employee;
  rankAtSale: string;
  saleAmount: number;
  commissionRate: number;
  differentialRate: number;
  commissionAmount: number;
  levelDepth: number;
  status: 'CALCULATED' | 'APPROVED' | 'PAID' | 'CANCELLED';
  calculatedAt: string;
}

export interface Payout {
  _id: string;
  employeeId: Employee;
  amount: number;
  payoutDate: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  referenceNo: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  channel: 'IN_APP' | 'EMAIL' | 'WHATSAPP';
  status: 'UNREAD' | 'READ' | 'SENT' | 'FAILED';
  sentAt: string;
}

export interface DashboardStats {
  kpi: {
    totalRevenue: number;
    monthlyRevenue: number;
    totalEmployees: number;
    totalProjects: number;
    totalPlots: number;
    availablePlots: number;
    bookedPlots: number;
    pendingPlots: number;
    soldPlots: number;
    totalCommissions: number;
    totalPayouts: number;
  };
  charts: {
    revenueTrend: { month: string; revenue: number; sales: number }[];
    plotStatusDistribution: { name: string; value: number; color: string }[];
    topEmployees: { name: string; rank: string; sales: number; teamSales: number }[];
    projectRevenue: { name: string; plots: number; soldPlots: number; revenue: number }[];
  };
}
