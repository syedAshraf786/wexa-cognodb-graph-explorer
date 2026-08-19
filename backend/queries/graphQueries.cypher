// =============================================================================
// Developer Knowledge Graph Explorer — Documented Cypher Queries
// All queries use parameterized values ($param) — never string concatenation.
// =============================================================================

// -----------------------------------------------------------------------------
// Query 1 — List developers with company and role
// -----------------------------------------------------------------------------
// MATCH (d:Developer)
// OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
// OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
// RETURN d.id AS id, d.name AS name, d.location AS location,
//        d.experience AS experience, c.name AS company, r.title AS role
// ORDER BY d.name

// -----------------------------------------------------------------------------
// Query 2 — Developer details (skills, technologies, projects, company, team, role)
// -----------------------------------------------------------------------------
// MATCH (d:Developer {id: $id})
// OPTIONAL MATCH (d)-[:HAS_SKILL]->(s:Skill)
// OPTIONAL MATCH (d)-[:KNOWS]->(t:Technology)
// OPTIONAL MATCH (d)-[:WORKS_ON]->(p:Project)
// OPTIONAL MATCH (d)-[:WORKS_AT]->(c:Company)
// OPTIONAL MATCH (d)-[:MEMBER_OF]->(tm:Team)
// OPTIONAL MATCH (d)-[:HAS_ROLE]->(r:Role)
// RETURN d, collect(DISTINCT s) AS skills, collect(DISTINCT t) AS technologies,
//        collect(DISTINCT p) AS projects, c, tm, r

// -----------------------------------------------------------------------------
// Query 3 — Multi-hop traversal (MANDATORY)
// Given a developer, find technologies used by projects that teammates work on.
// Path: Developer → MEMBER_OF → Team ← MEMBER_OF ← Developer → WORKS_ON → Project → USES → Technology
// -----------------------------------------------------------------------------
// MATCH (d:Developer {id: $id})-[:MEMBER_OF]->(team:Team)<-[:MEMBER_OF]-(teammate:Developer)
// WHERE teammate.id <> d.id
// MATCH (teammate)-[:WORKS_ON]->(p:Project)-[:USES]->(t:Technology)
// WHERE NOT (d)-[:KNOWS]->(t)
// RETURN DISTINCT t.id AS id, t.name AS name, t.category AS category,
//        teammate.name AS viaTeammate, p.name AS viaProject, team.name AS viaTeam
// ORDER BY t.name

// -----------------------------------------------------------------------------
// Query 4 — Collaboration discovery (relationally awkward query)
// Find developers who could collaborate based on shared technologies, projects, teams
// -----------------------------------------------------------------------------
// MATCH (selected:Developer {id: $id})
// MATCH (candidate:Developer) WHERE candidate.id <> selected.id
// OPTIONAL MATCH (selected)-[:KNOWS]->(sharedTech:Technology)<-[:KNOWS]-(candidate)
// OPTIONAL MATCH (selected)-[:WORKS_ON]->(sharedProj:Project)<-[:WORKS_ON]-(candidate)
// OPTIONAL MATCH (selected)-[:MEMBER_OF]->(sharedTeam:Team)<-[:MEMBER_OF]-(candidate)
// WITH candidate, collect(DISTINCT sharedTech.name) AS sharedTechnologies, ...
// WHERE size(sharedTechnologies) + size(sharedProjects) + size(sharedTeams) > 0
// RETURN candidate, sharedTechnologies, sharedProjects, sharedTeams, strength
// ORDER BY strength DESC

// -----------------------------------------------------------------------------
// Query 5 — Search developers by name
// -----------------------------------------------------------------------------
// MATCH (d:Developer)
// WHERE toLower(d.name) CONTAINS toLower($q)
// RETURN d ORDER BY d.name LIMIT 20

// -----------------------------------------------------------------------------
// Query 6 — Search technologies
// -----------------------------------------------------------------------------
// MATCH (t:Technology)
// WHERE toLower(t.name) CONTAINS toLower($q)
// RETURN t ORDER BY t.name LIMIT 20

// -----------------------------------------------------------------------------
// Query 7 — Projects using a technology
// -----------------------------------------------------------------------------
// MATCH (p:Project)-[:USES]->(t:Technology {id: $id})
// RETURN p ORDER BY p.name

// -----------------------------------------------------------------------------
// Query 8 — Developers who know a technology
// -----------------------------------------------------------------------------
// MATCH (d:Developer)-[:KNOWS]->(t:Technology {id: $id})
// RETURN d ORDER BY d.name

// -----------------------------------------------------------------------------
// Query 9 — Related technologies
// -----------------------------------------------------------------------------
// MATCH (t:Technology {id: $id})-[:RELATED_TO]-(related:Technology)
// RETURN related ORDER BY related.name

// -----------------------------------------------------------------------------
// Query 10 — Shortest collaboration path between two developers
// -----------------------------------------------------------------------------
// MATCH (d1:Developer {id: $fromId}), (d2:Developer {id: $toId})
// MATCH path = shortestPath((d1)-[:COLLABORATES_WITH*..5]-(d2))
// RETURN path, length(path) AS hops

// -----------------------------------------------------------------------------
// Query 11 — Most connected technologies
// -----------------------------------------------------------------------------
// MATCH (t:Technology)
// OPTIONAL MATCH (d:Developer)-[:KNOWS]->(t)
// OPTIONAL MATCH (p:Project)-[:USES]->(t)
// WITH t, count(DISTINCT d) + count(DISTINCT p) AS connections
// RETURN t.id AS id, t.name AS name, t.category AS category, connections
// ORDER BY connections DESC LIMIT $limit

// -----------------------------------------------------------------------------
// Query 12 — Projects with most technologies
// -----------------------------------------------------------------------------
// MATCH (p:Project)-[:USES]->(t:Technology)
// WITH p, count(t) AS techCount
// RETURN p.id AS id, p.name AS name, p.status AS status, techCount
// ORDER BY techCount DESC LIMIT $limit

// -----------------------------------------------------------------------------
// Query 13 — Developers on projects involving a technology
// -----------------------------------------------------------------------------
// MATCH (t:Technology {id: $id})<-[:USES]-(p:Project)<-[:WORKS_ON]-(d:Developer)
// RETURN DISTINCT d ORDER BY d.name

// -----------------------------------------------------------------------------
// Query 14 — Graph neighborhood for visualization
// -----------------------------------------------------------------------------
// MATCH (center) WHERE center.id = $id
// OPTIONAL MATCH (center)-[r1]-(n1)
// OPTIONAL MATCH (n1)-[r2]-(n2)
// WHERE n2 <> center
// RETURN center, collect(DISTINCT n1) AS level1, collect(DISTINCT n2) AS level2,
//        collect(DISTINCT r1) AS rels1, collect(DISTINCT r2) AS rels2
