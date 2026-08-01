const Project = require('../models/Project');
const ProjectSettings = require('../models/ProjectSettings');
const Plot = require('../models/Plot');

exports.getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = await Project.create(req.body);
    await ProjectSettings.create({ projectId: project._id });
    
    // Automatically generate sample plots for new project if totalPlots provided
    const totalPlots = req.body.totalPlots || 20;
    const basePrice = req.body.basePricePerSqft || 4000;
    const plotsToInsert = [];

    for (let i = 1; i <= totalPlots; i++) {
      const block = i <= Math.ceil(totalPlots / 2) ? 'A' : 'B';
      const sizeSqft = 1200 + (i % 4) * 250;
      const price = sizeSqft * basePrice;
      const col = (i - 1) % 5;
      const row = Math.floor((i - 1) / 5);
      const x = 50 + col * 150;
      const y = 50 + row * 110;

      plotsToInsert.push({
        projectId: project._id,
        block,
        plotNo: `${block}-${100 + i}`,
        sizeSqft,
        price,
        status: 'AVAILABLE',
        coordinates: { x, y, width: 130, height: 90 },
        polygon: {
          points: [
            { x, y },
            { x: x + 130, y },
            { x: x + 130, y: y + 90 },
            { x, y: y + 90 }
          ]
        }
      });
    }

    await Plot.insertMany(plotsToInsert);

    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const project = await Project.findByIdAndUpdate(id, req.body, { new: true });
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    await Plot.deleteMany({ projectId: id });
    await ProjectSettings.deleteMany({ projectId: id });
    res.json({ message: 'Project and associated plots deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    
    const settings = await ProjectSettings.findOne({ projectId: project._id });
    const plotCounts = await Plot.aggregate([
      { $match: { projectId: project._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    res.json({
      project,
      settings,
      plotStats: plotCounts.reduce((acc, c) => {
        acc[c._id] = c.count;
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
};

exports.updateProjectSettings = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const settings = await ProjectSettings.findOneAndUpdate(
      { projectId },
      req.body,
      { new: true, upsert: true }
    );
    res.json(settings);
  } catch (error) {
    next(error);
  }
};
