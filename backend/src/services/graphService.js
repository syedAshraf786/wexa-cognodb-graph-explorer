import neo4j from 'neo4j-driver';
import { runQuery } from '../config/database.js';

function nodeToObject(node) {
  if (!node) return null;
  return { ...node.properties, _labels: node.labels };
}

function relToObject(rel) {
  if (!rel) return null;
  return {
    type: rel.type,
    ...rel.properties,
    startNodeId: rel.startNodeElementId,
    endNodeId: rel.endNodeElementId,
  };
}

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  if (neo4j.isInt(value)) return value.toNumber();
  return Number(value);
}

export async function getStats() {
  const result = await runQuery(`
    MATCH (d:Developer) WITH count(d) AS developers
    MATCH (p:Project) WITH developers, count(p) AS projects
    MATCH (t:Technology) WITH developers, projects, count(t) AS technologies
    MATCH (c:Company) WITH developers, projects, technologies, count(c) AS companies
    RETURN developers, projects, technologies, companies
  `);
  const record = result.records[0];
  return {
    developers: toNumber(record.get('developers')),
    projects: toNumber(record.get('projects')),
    technologies: toNumber(record.get('technologies')),
    companies: toNumber(record.get('companies')),
  };
}

export async function listDevelopers() {
  const result = await runQuery(`
    MATCH (d:Developer)
    OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
    OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
    OPTIONAL MATCH (d)-[:KNOWS]->(t:Technology)
    WITH d, c, r, collect(DISTINCT t.name)[0..3] AS topTechnologies
    RETURN d.id AS id, d.name AS name, d.email AS email, d.location AS location,
           d.experience AS experience, c.name AS company, r.title AS role,
           topTechnologies
    ORDER BY d.name
  `);

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    email: r.get('email'),
    location: r.get('location'),
    experience: r.get('experience'),
    company: r.get('company'),
    role: r.get('role'),
    topTechnologies: r.get('topTechnologies'),
  }));
}

export async function getDeveloperById(id) {
  const result = await runQuery(
    `
    MATCH (d:Developer {id: $id})
    OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
    OPTIONAL MATCH (d)-[:KNOWS]->(t:Technology)
    OPTIONAL MATCH (d)-[:WORKS_ON]->(p:Project)
    OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
    OPTIONAL MATCH (d)-[:MEMBER_OF]->(tm:Team)
    OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
    RETURN d,
           collect(DISTINCT { id: s.id, name: s.name, level: s.level }) AS skills,
           collect(DISTINCT { id: t.id, name: t.name, category: t.category }) AS technologies,
           collect(DISTINCT { id: p.id, name: p.name, status: p.status, description: p.description }) AS projects,
           c, tm, r
    `,
    { id }
  );

  if (result.records.length === 0) return null;

  const r = result.records[0];
  const dev = nodeToObject(r.get('d'));
  const company = nodeToObject(r.get('c'));
  const team = nodeToObject(r.get('tm'));
  const role = nodeToObject(r.get('r'));

  return {
    ...dev,
    skills: r.get('skills').filter((s) => s.id),
    technologies: r.get('technologies').filter((t) => t.id),
    projects: r.get('projects').filter((p) => p.id),
    company: company ? { id: company.id, name: company.name, industry: company.industry } : null,
    team: team ? { id: team.id, name: team.name } : null,
    role: role ? { id: role.id, title: role.title } : null,
  };
}

export async function getDeveloperNetwork(id) {
  const multiHop = await runQuery(
    `
    MATCH (d:Developer {id: $id})-[:MEMBER_OF]->(team:Team)<-[:MEMBER_OF]-(teammate:Developer)
    WHERE teammate.id <> d.id
    MATCH (teammate)-[:WORKS_ON]->(p:Project)-[:USES]->(t:Technology)
    WHERE NOT (d)-[:KNOWS]->(t)
    RETURN DISTINCT t.id AS id, t.name AS name, t.category AS category,
           teammate.name AS viaTeammate, p.name AS viaProject, team.name AS viaTeam
    ORDER BY t.name
    `,
    { id }
  );

  return {
    teammateTechnologies: multiHop.records.map((r) => ({
      id: r.get('id'),
      name: r.get('name'),
      category: r.get('category'),
      viaTeammate: r.get('viaTeammate'),
      viaProject: r.get('viaProject'),
      viaTeam: r.get('viaTeam'),
    })),
  };
}

export async function getCollaborators(developerId) {
  const result = await runQuery(
    `
    MATCH (selected:Developer {id: $id})
    MATCH (candidate:Developer)
    WHERE candidate.id <> selected.id
    OPTIONAL MATCH (selected)-[:KNOWS]->(sharedTech:Technology)<-[:KNOWS]-(candidate)
    OPTIONAL MATCH (selected)-[:WORKS_ON]->(sharedProj:Project)<-[:WORKS_ON]-(candidate)
    OPTIONAL MATCH (selected)-[:MEMBER_OF]->(sharedTeam:Team)<-[:MEMBER_OF]-(candidate)
    WITH candidate,
         [x IN collect(DISTINCT sharedTech.name) WHERE x IS NOT NULL] AS sharedTechnologies,
         [x IN collect(DISTINCT sharedProj.name) WHERE x IS NOT NULL] AS sharedProjects,
         [x IN collect(DISTINCT sharedTeam.name) WHERE x IS NOT NULL] AS sharedTeams
    WHERE size(sharedTechnologies) + size(sharedProjects) + size(sharedTeams) > 0
    RETURN candidate.id AS id, candidate.name AS name, candidate.location AS location,
           candidate.experience AS experience,
           sharedTechnologies, sharedProjects, sharedTeams,
           size(sharedTechnologies) * 3 + size(sharedProjects) * 5 + size(sharedTeams) * 4 AS strength
    ORDER BY strength DESC
    LIMIT 20
    `,
    { id: developerId }
  );

  return result.records.map((r) => {
    const sharedTechnologies = r.get('sharedTechnologies');
    const sharedProjects = r.get('sharedProjects');
    const sharedTeams = r.get('sharedTeams');
    const reasons = [];

    if (sharedTechnologies.length > 0) {
      reasons.push(`Shares ${sharedTechnologies.length} technology(ies): ${sharedTechnologies.slice(0, 3).join(', ')}`);
    }
    if (sharedProjects.length > 0) {
      reasons.push(`Worked on ${sharedProjects.length} shared project(s): ${sharedProjects.slice(0, 2).join(', ')}`);
    }
    if (sharedTeams.length > 0) {
      reasons.push(`Same team: ${sharedTeams.join(', ')}`);
    }

    return {
      id: r.get('id'),
      name: r.get('name'),
      location: r.get('location'),
      experience: r.get('experience'),
      sharedTechnologies,
      sharedProjects,
      sharedTeams,
      strength: toNumber(r.get('strength')),
      reason: reasons.join('. '),
    };
  });
}

export async function listTechnologies() {
  const result = await runQuery(`
    MATCH (t:Technology)
    OPTIONAL MATCH (d:Developer)-[:KNOWS]->(t)
    WITH t, count(DISTINCT d) AS developerCount
    RETURN t.id AS id, t.name AS name, t.category AS category, developerCount
    ORDER BY t.name
  `);

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    category: r.get('category'),
    developerCount: toNumber(r.get('developerCount')),
  }));
}

export async function getTechnologyById(id) {
  const result = await runQuery(
    `
    MATCH (t:Technology {id: $id})
    OPTIONAL MATCH (d:Developer)-[:KNOWS]->(t)
    OPTIONAL MATCH (p:Project)-[:USES]->(t)
    OPTIONAL MATCH (t)-[:RELATED_TO]-(related:Technology)
    RETURN t,
           collect(DISTINCT { id: d.id, name: d.name }) AS developers,
           collect(DISTINCT { id: p.id, name: p.name, status: p.status }) AS projects,
           collect(DISTINCT { id: related.id, name: related.name, category: related.category }) AS related
    `,
    { id }
  );

  if (result.records.length === 0) return null;

  const r = result.records[0];
  const tech = nodeToObject(r.get('t'));

  return {
    ...tech,
    developers: r.get('developers').filter((d) => d.id),
    projects: r.get('projects').filter((p) => p.id),
    relatedTechnologies: r.get('related').filter((t) => t.id),
  };
}

export async function listProjects() {
  const result = await runQuery(`
    MATCH (p:Project)
    OPTIONAL MATCH (p)-[:OWNED_BY]->(c:Company)
    OPTIONAL MATCH (p)-[:USES]->(t:Technology)
    WITH p, c, count(DISTINCT t) AS techCount
    RETURN p.id AS id, p.name AS name, p.description AS description, p.status AS status,
           c.name AS company, techCount
    ORDER BY p.name
  `);

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    description: r.get('description'),
    status: r.get('status'),
    company: r.get('company'),
    techCount: toNumber(r.get('techCount')),
  }));
}

export async function getProjectById(id) {
  const result = await runQuery(
    `
    MATCH (p:Project {id: $id})
    OPTIONAL MATCH (p)-[:OWNED_BY]->(c:Company)
    OPTIONAL MATCH (p)-[:USES]->(t:Technology)
    OPTIONAL MATCH (d:Developer)-[:WORKS_ON]->(p)
    RETURN p, c,
           collect(DISTINCT { id: t.id, name: t.name, category: t.category }) AS technologies,
           collect(DISTINCT { id: d.id, name: d.name, experience: d.experience }) AS developers
    `,
    { id }
  );

  if (result.records.length === 0) return null;

  const r = result.records[0];
  const project = nodeToObject(r.get('p'));
  const company = nodeToObject(r.get('c'));

  return {
    ...project,
    company: company ? { id: company.id, name: company.name, industry: company.industry } : null,
    technologies: r.get('technologies').filter((t) => t.id),
    developers: r.get('developers').filter((d) => d.id),
  };
}

export async function getProjectTechnologies(id) {
  const result = await runQuery(
    `
    MATCH (p:Project {id: $id})-[:USES]->(t:Technology)
    RETURN t.id AS id, t.name AS name, t.category AS category
    ORDER BY t.name
    `,
    { id }
  );

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    category: r.get('category'),
  }));
}

export async function globalSearch(q) {
  if (!q || q.trim().length === 0) {
    return { developers: [], projects: [], technologies: [], companies: [] };
  }

  const [devs, projs, techs, comps] = await Promise.all([
    runQuery(
      `MATCH (d:Developer) WHERE toLower(d.name) CONTAINS toLower($q)
       RETURN d.id AS id, d.name AS name, d.location AS location ORDER BY d.name LIMIT 10`,
      { q }
    ),
    runQuery(
      `MATCH (p:Project) WHERE toLower(p.name) CONTAINS toLower($q)
       RETURN p.id AS id, p.name AS name, p.status AS status ORDER BY p.name LIMIT 10`,
      { q }
    ),
    runQuery(
      `MATCH (t:Technology) WHERE toLower(t.name) CONTAINS toLower($q)
       RETURN t.id AS id, t.name AS name, t.category AS category ORDER BY t.name LIMIT 10`,
      { q }
    ),
    runQuery(
      `MATCH (c:Company) WHERE toLower(c.name) CONTAINS toLower($q)
       RETURN c.id AS id, c.name AS name, c.industry AS industry ORDER BY c.name LIMIT 10`,
      { q }
    ),
  ]);

  return {
    developers: devs.records.map((r) => ({ id: r.get('id'), name: r.get('name'), location: r.get('location') })),
    projects: projs.records.map((r) => ({ id: r.get('id'), name: r.get('name'), status: r.get('status') })),
    technologies: techs.records.map((r) => ({ id: r.get('id'), name: r.get('name'), category: r.get('category') })),
    companies: comps.records.map((r) => ({ id: r.get('id'), name: r.get('name'), industry: r.get('industry') })),
  };
}

export async function getMostConnectedTechnologies(limit = 5) {
  const result = await runQuery(
    `
    MATCH (t:Technology)
    OPTIONAL MATCH (d:Developer)-[:KNOWS]->(t)
    OPTIONAL MATCH (p:Project)-[:USES]->(t)
    WITH t, count(DISTINCT d) + count(DISTINCT p) AS connections
    RETURN t.id AS id, t.name AS name, t.category AS category, connections
    ORDER BY connections DESC LIMIT $limit
    `,
    { limit: neo4j.int(limit) }
  );

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    category: r.get('category'),
    connections: toNumber(r.get('connections')),
  }));
}

export async function getProjectsWithMostTechnologies(limit = 5) {
  const result = await runQuery(
    `
    MATCH (p:Project)-[:USES]->(t:Technology)
    WITH p, count(t) AS techCount
    RETURN p.id AS id, p.name AS name, p.status AS status, techCount
    ORDER BY techCount DESC LIMIT $limit
    `,
    { limit: neo4j.int(limit) }
  );

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    status: r.get('status'),
    techCount: toNumber(r.get('techCount')),
  }));
}

export async function getDevelopersByTechnology(id) {
  const result = await runQuery(
    `
    MATCH (t:Technology {id: $id})<-[:USES]-(p:Project)<-[:WORKS_ON]-(d:Developer)
    RETURN DISTINCT d.id AS id, d.name AS name, d.location AS location, d.experience AS experience
    ORDER BY d.name
    `,
    { id }
  );

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    location: r.get('location'),
    experience: r.get('experience'),
  }));
}

export async function getShortestCollaborationPath(fromId, toId) {
  const result = await runQuery(
    `
    MATCH (d1:Developer {id: $fromId}), (d2:Developer {id: $toId})
    MATCH path = shortestPath((d1)-[:COLLABORATES_WITH*..6]-(d2))
    RETURN [n IN nodes(path) | { id: n.id, name: n.name, labels: labels(n) }] AS nodes,
           [r IN relationships(path) | type(r)] AS relationships,
           length(path) AS hops
    `,
    { fromId, toId }
  );

  if (result.records.length === 0) return null;

  const r = result.records[0];
  return {
    nodes: r.get('nodes'),
    relationships: r.get('relationships'),
    hops: toNumber(r.get('hops')),
  };
}

export async function getGraphNeighborhood(id, label) {
  const result = await runQuery(
    `
    MATCH (center {id: $id})
    WHERE $label IN labels(center) OR $label = 'Any'
    OPTIONAL MATCH (center)-[r1]-(n1)
    RETURN center,
           collect(DISTINCT n1) AS neighbors,
           collect(DISTINCT r1) AS relationships
    `,
    { id, label: label || 'Any' }
  );

  if (result.records.length === 0) return { nodes: [], links: [] };

  const r = result.records[0];
  const center = nodeToObject(r.get('center'));
  const neighbors = r.get('neighbors').filter(Boolean).map(nodeToObject);
  const rels = r.get('relationships').filter(Boolean);

  const nodeMap = new Map();
  const addNode = (n) => {
    if (!n || !n.id) return;
    const primaryLabel = (n._labels && n._labels[0]) || 'Unknown';
    nodeMap.set(n.id, {
      id: n.id,
      name: n.name || n.title || n.id,
      label: primaryLabel,
      properties: n,
    });
  };

  addNode(center);
  neighbors.forEach(addNode);

  const links = rels.map((rel) => {
    const startProps = rel.startNodeElementId;
    const endProps = rel.endNodeElementId;
    return {
      source: rel.start,
      target: rel.end,
      type: rel.type,
      startNodeId: startProps,
      endNodeId: endProps,
    };
  });

  // Re-query with explicit node IDs for links
  const linkResult = await runQuery(
    `
    MATCH (center {id: $id})-[r]-(neighbor)
    RETURN center.id AS centerId, neighbor.id AS neighborId, type(r) AS type
    `,
    { id }
  );

  const graphLinks = linkResult.records.map((rec) => ({
    source: rec.get('centerId'),
    target: rec.get('neighborId'),
    type: rec.get('type'),
  }));

  return {
    nodes: Array.from(nodeMap.values()),
    links: graphLinks,
  };
}

export async function expandGraphNode(id) {
  const result = await runQuery(
    `
    MATCH (n {id: $id})-[r]-(m)
    RETURN n.id AS sourceId, m.id AS targetId, m.name AS targetName,
           labels(m)[0] AS targetLabel, type(r) AS type,
           m
    `,
    { id }
  );

  const nodeMap = new Map();
  const links = [];

  result.records.forEach((rec) => {
    const target = nodeToObject(rec.get('m'));
    if (target?.id) {
      nodeMap.set(target.id, {
        id: target.id,
        name: target.name || target.title || target.id,
        label: rec.get('targetLabel') || 'Unknown',
        properties: target,
      });
    }
    links.push({
      source: rec.get('sourceId'),
      target: rec.get('targetId'),
      type: rec.get('type'),
    });
  });

  return {
    nodes: Array.from(nodeMap.values()),
    links,
  };
}

export async function getRecentProjects(limit = 5) {
  const result = await runQuery(
    `
    MATCH (p:Project)
    OPTIONAL MATCH (p)-[:OWNED_BY]->(c:Company)
    RETURN p.id AS id, p.name AS name, p.status AS status, c.name AS company
    ORDER BY p.name LIMIT $limit
    `,
    { limit: neo4j.int(limit) }
  );

  return result.records.map((r) => ({
    id: r.get('id'),
    name: r.get('name'),
    status: r.get('status'),
    company: r.get('company'),
  }));
}

export async function getPopularTechnologies(limit = 5) {
  return getMostConnectedTechnologies(limit);
}
