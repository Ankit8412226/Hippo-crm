const Plot = require('../models/Plot');
const PlotDocument = require('../models/PlotDocument');
const Transaction = require('../models/Transaction');
const Employee = require('../models/Employee');
const { processDifferentialCommission } = require('../services/commissionEngine');

exports.getPlots = async (req, res, next) => {
  try {
    const { projectId, block, status, search } = req.query;
    const filter = {};

    if (projectId) filter.projectId = projectId;
    if (block) filter.block = block;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { plotNo: { $regex: search, $options: 'i' } },
        { block: { $regex: search, $options: 'i' } }
      ];
    }

    const plots = await Plot.find(filter).populate('ownerId', 'fullName email phone');
    res.json(plots);
  } catch (error) {
    next(error);
  }
};

exports.getPlotById = async (req, res, next) => {
  try {
    const plot = await Plot.findById(req.params.id)
      .populate('projectId')
      .populate('ownerId', 'fullName email phone');

    if (!plot) return res.status(404).json({ message: 'Plot not found' });

    const documents = await PlotDocument.find({ plotId: plot._id });
    const transactions = await Transaction.find({ plotId: plot._id }).populate('sellerEmployeeId');

    res.json({
      plot,
      documents,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.updatePlotStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      status, 
      ownerName, 
      ownerPhone, 
      ownerEmail, 
      sellerEmployeeId, 
      paymentMode,
      paidAmount,
      registryDate,
      registryStatus,
      paymentMilestones
    } = req.body;

    const plot = await Plot.findById(id);
    if (!plot) return res.status(404).json({ message: 'Plot not found' });

    const prevStatus = plot.status;
    plot.status = status;

    if (ownerName !== undefined) plot.ownerName = ownerName;
    if (ownerPhone !== undefined) plot.ownerPhone = ownerPhone;
    if (ownerEmail !== undefined) plot.ownerEmail = ownerEmail;
    if (paidAmount !== undefined) plot.paidAmount = Number(paidAmount) || 0;
    if (registryDate !== undefined) plot.registryDate = registryDate ? new Date(registryDate) : null;
    if (registryStatus !== undefined) plot.registryStatus = registryStatus;
    if (Array.isArray(paymentMilestones)) plot.paymentMilestones = paymentMilestones;

    // Live calculation of remaining due balance
    const totalPlotPrice = plot.totalCost || plot.price || 0;
    plot.dueBalance = Math.max(0, totalPlotPrice - (plot.paidAmount || 0));

    if (status === 'BOOKED' || status === 'SOLD') {
      if (!plot.bookingDate) plot.bookingDate = new Date();
    } else if (status === 'AVAILABLE') {
      plot.ownerName = '';
      plot.ownerPhone = '';
      plot.ownerEmail = '';
      plot.bookingDate = null;
      plot.paidAmount = 0;
      plot.dueBalance = 0;
      plot.registryDate = null;
      plot.registryStatus = 'NOT_REGISTERED';
      plot.paymentMilestones = [];
    }

    await plot.save();

    // If status updated to SOLD, resolve seller employee
    if (status === 'SOLD' && prevStatus !== 'SOLD') {
      let resolvedSellerId = sellerEmployeeId;

      // Auto-resolve seller employee from logged-in token user if not explicitly passed!
      if (!resolvedSellerId && req.user) {
        const loggedInEmp = await Employee.findOne({ userId: req.user._id });
        if (loggedInEmp) {
          resolvedSellerId = loggedInEmp._id;
        }
      }

      // If still no seller employee, fallback to top level CEO / first employee
      if (!resolvedSellerId) {
        const topEmp = await Employee.findOne({ parentId: null });
        if (topEmp) resolvedSellerId = topEmp._id;
      }

      if (resolvedSellerId) {
        const transaction = await Transaction.create({
          plotId: plot._id,
          buyerName: plot.ownerName || ownerName || 'Customer',
          buyerPhone: plot.ownerPhone || ownerPhone || '',
          buyerEmail: plot.ownerEmail || ownerEmail || '',
          sellerEmployeeId: resolvedSellerId,
          amount: plot.price,
          paymentMode: paymentMode || 'NET_BANKING',
          status: 'COMPLETED',
          transactionDate: new Date()
        });

        // Trigger automatic differential commission computation & sponsor tree rank updates
        await processDifferentialCommission(transaction._id);
      }
    }

    res.json(plot);
  } catch (error) {
    next(error);
  }
};

exports.uploadPlotDocument = async (req, res, next) => {
  try {
    const { plotId } = req.params;
    const { documentType, title, fileUrl } = req.body;

    const doc = await PlotDocument.create({
      plotId,
      documentType,
      title,
      fileUrl: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      uploadedBy: req.user ? req.user._id : null
    });

    res.status(201).json(doc);
  } catch (error) {
    next(error);
  }
};

exports.exportPlotsCSV = async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const filter = projectId ? { projectId } : {};
    const plots = await Plot.find(filter).sort({ plotNo: 1 });

    const headers = [
      'S.No', 'Plot No', 'Sellable Sq Yrd', 'Carpet Sq Yrd',
      '12mtr', '9Mtr', 'Corner', 'Park Facing',
      'Total PLC', 'Discounted PLC', 'OTMC',
      'GST on other cahrges', 'Total Cost', 'Status', 'Owner'
    ];

    const rows = plots.map((p, idx) => [
      idx + 1,
      `"${p.plotNo || ''}"`,
      p.sellableSqYrd || 0,
      p.carpetSqYrd || 0,
      p.plc12mtr || '-',
      p.plc9mtr || '-',
      p.plcCorner || '-',
      p.plcParkFacing || '-',
      p.totalPlc || 0,
      p.discountedPlc || 0,
      p.otmc || 0,
      p.gstOnOtherCharges || 0,
      p.totalCost || p.price || 0,
      `"${p.status || 'AVAILABLE'}"`,
      `"${p.ownerName || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=plot_ledger_report.csv');
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
};

exports.importPlotsCSV = async (req, res, next) => {
  try {
    const { projectId, plotsData } = req.body;
    if (!projectId || !Array.isArray(plotsData)) {
      return res.status(400).json({ message: 'projectId and plotsData array are required' });
    }

    const importedPlots = [];
    for (const item of plotsData) {
      const plotNo = item['Plot No'] || item.plotNo;
      if (!plotNo) continue;

      const block = plotNo.split('-')[0] || 'E5';
      const sellableSqYrd = parseFloat(item['Sellable Sq Yrd'] || item.sellableSqYrd || 0);
      const carpetSqYrd = parseFloat(item['Carpet Sq Yrd'] || item.carpetSqYrd || 0);
      const plc12mtr = parseFloat(item['12mtr'] || item.plc12mtr || 0) || 0;
      const plc9mtr = parseFloat(item['9Mtr'] || item.plc9mtr || 0) || 0;
      const plcCorner = parseFloat(item['Corner'] || item.plcCorner || 0) || 0;
      const plcParkFacing = parseFloat(item['Park Facing'] || item.plcParkFacing || 0) || 0;
      const totalPlc = parseFloat(item['Total PLC'] || item.totalPlc || 0);
      const discountedPlc = parseFloat(item['Discounted PLC'] || item.discountedPlc || 0);
      const otmc = parseFloat(item['OTMC'] || item.otmc || 0);
      const gstOnOtherCharges = parseFloat(item['GST on other cahrges'] || item.gstOnOtherCharges || 0);
      const totalCost = parseFloat(item['Total Cost'] || item.totalCost || item.price || 0);
      const status = (item['Status'] || item.status || 'AVAILABLE').toUpperCase();
      const ownerName = item['Owner'] || item.ownerName || '';

      const updatedPlot = await Plot.findOneAndUpdate(
        { projectId, plotNo },
        {
          projectId,
          block,
          plotNo,
          sellableSqYrd,
          carpetSqYrd,
          plc12mtr,
          plc9mtr,
          plcCorner,
          plcParkFacing,
          totalPlc,
          discountedPlc,
          otmc,
          gstOnOtherCharges,
          totalCost,
          price: totalCost || (sellableSqYrd * 9 * 3500) || 1500000,
          sizeSqft: sellableSqYrd ? sellableSqYrd * 9 : 1800,
          status: ['AVAILABLE', 'BOOKED', 'PENDING', 'SOLD'].includes(status) ? status : 'AVAILABLE',
          ownerName
        },
        { upsert: true, new: true }
      );
      importedPlots.push(updatedPlot);
    }

    res.json({
      message: `Successfully imported ${importedPlots.length} plot records!`,
      importedCount: importedPlots.length,
      plots: importedPlots
    });
  } catch (error) {
    next(error);
  }
};
