import * as graphService from '../services/graphService.js';

export async function healthCheck(req, res) {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}

export async function getStats(req, res) {
  const stats = await graphService.getStats();
  res.json(stats);
}

export async function listDevelopers(req, res) {
  const { q } = req.query;
  if (q) {
    const results = await graphService.globalSearch(q);
    return res.json(results.developers);
  }
  const developers = await graphService.listDevelopers();
  res.json(developers);
}

export async function getDeveloper(req, res) {
  const developer = await graphService.getDeveloperById(req.params.id);
  if (!developer) {
    const err = new Error('Developer not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  res.json(developer);
}

export async function getDeveloperNetwork(req, res) {
  const developer = await graphService.getDeveloperById(req.params.id);
  if (!developer) {
    const err = new Error('Developer not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  const network = await graphService.getDeveloperNetwork(req.params.id);
  res.json(network);
}

export async function listTechnologies(req, res) {
  const technologies = await graphService.listTechnologies();
  res.json(technologies);
}

export async function getTechnology(req, res) {
  const technology = await graphService.getTechnologyById(req.params.id);
  if (!technology) {
    const err = new Error('Technology not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  res.json(technology);
}

export async function listProjects(req, res) {
  const projects = await graphService.listProjects();
  res.json(projects);
}

export async function getProject(req, res) {
  const project = await graphService.getProjectById(req.params.id);
  if (!project) {
    const err = new Error('Project not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  res.json(project);
}

export async function getProjectTechnologies(req, res) {
  const technologies = await graphService.getProjectTechnologies(req.params.id);
  res.json(technologies);
}

export async function search(req, res) {
  const { q } = req.query;
  if (!q || q.trim().length === 0) {
    const err = new Error('Search query is required');
    err.code = 'BAD_REQUEST';
    throw err;
  }
  const results = await graphService.globalSearch(q);
  res.json(results);
}

export async function getCollaborators(req, res) {
  const developer = await graphService.getDeveloperById(req.params.developerId);
  if (!developer) {
    const err = new Error('Developer not found');
    err.code = 'NOT_FOUND';
    throw err;
  }
  const collaborators = await graphService.getCollaborators(req.params.developerId);
  res.json(collaborators);
}

export async function getGraph(req, res) {
  const { id } = req.params;
  const { label, expand } = req.query;

  if (expand === 'true') {
    const data = await graphService.expandGraphNode(id);
    return res.json(data);
  }

  const data = await graphService.getGraphNeighborhood(id, label);
  res.json(data);
}

export async function getDashboard(req, res) {
  const [stats, mostConnected, recentProjects, popularTechnologies] = await Promise.all([
    graphService.getStats(),
    graphService.getMostConnectedTechnologies(5),
    graphService.getRecentProjects(5),
    graphService.getPopularTechnologies(5),
  ]);

  res.json({
    stats,
    mostConnectedTechnologies: mostConnected,
    recentProjects,
    popularTechnologies,
  });
}

export async function getCollaborationPath(req, res) {
  const { from, to } = req.query;
  if (!from || !to) {
    const err = new Error('Both from and to developer IDs are required');
    err.code = 'BAD_REQUEST';
    throw err;
  }
  const path = await graphService.getShortestCollaborationPath(from, to);
  res.json(path || { nodes: [], relationships: [], hops: null, message: 'No collaboration path found' });
}

export async function getDevelopersByTechnology(req, res) {
  const developers = await graphService.getDevelopersByTechnology(req.params.id);
  res.json(developers);
}

export async function getTopProjects(req, res) {
  const projects = await graphService.getProjectsWithMostTechnologies(10);
  res.json(projects);
}
