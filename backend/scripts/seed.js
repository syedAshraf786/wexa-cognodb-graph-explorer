import dotenv from 'dotenv';
import neo4j from 'neo4j-driver';
import { getDriver, closeDriver, runQuery } from '../src/config/database.js';

dotenv.config();

const APP_LABEL = 'WexaGraphApp';

async function clearDataset() {
  console.log('Clearing existing application dataset...');
  await runQuery(
    `MATCH (n:${APP_LABEL}) DETACH DELETE n`,
    {},
    neo4j.session.WRITE
  );
  console.log('Dataset cleared.');
}

async function seed() {
  console.log('Connecting to CognoDB...');
  const driver = getDriver();
  await driver.verifyConnectivity();
  console.log('Connected successfully.\n');

  await clearDataset();

  const session = driver.session({ defaultAccessMode: neo4j.session.WRITE });

  try {
    console.log('Creating nodes and relationships...');

    await session.run(`
      // Companies
      CREATE (wexa:Company:WexaGraphApp {id: 'comp-wexa', name: 'Wexa Labs', industry: 'Technology'})
      CREATE (cloudnine:Company:WexaGraphApp {id: 'comp-cloudnine', name: 'CloudNine Systems', industry: 'Cloud Infrastructure'})
      CREATE (dataflow:Company:WexaGraphApp {id: 'comp-dataflow', name: 'DataFlow Analytics', industry: 'Data & AI'})
      CREATE (nexgen:Company:WexaGraphApp {id: 'comp-nexgen', name: 'NexGen Fintech', industry: 'Financial Services'})
      CREATE (healthsync:Company:WexaGraphApp {id: 'comp-healthsync', name: 'HealthSync', industry: 'Healthcare'})

      // Teams
      CREATE (platform:Team:WexaGraphApp {id: 'team-platform', name: 'Platform Engineering'})
      CREATE (frontend:Team:WexaGraphApp {id: 'team-frontend', name: 'Frontend Guild'})
      CREATE (data:Team:WexaGraphApp {id: 'team-data', name: 'Data Platform'})
      CREATE (mobile:Team:WexaGraphApp {id: 'team-mobile', name: 'Mobile Squad'})
      CREATE (infra:Team:WexaGraphApp {id: 'team-infra', name: 'Infrastructure'})

      // Roles
      CREATE (se:Role:WexaGraphApp {id: 'role-se', title: 'Software Engineer'})
      CREATE (sse:Role:WexaGraphApp {id: 'role-sse', title: 'Senior Software Engineer'})
      CREATE (lead:Role:WexaGraphApp {id: 'role-lead', title: 'Tech Lead'})
      CREATE (arch:Role:WexaGraphApp {id: 'role-arch', title: 'Solutions Architect'})
      CREATE (devops:Role:WexaGraphApp {id: 'role-devops', title: 'DevOps Engineer'})
      CREATE (pm:Role:WexaGraphApp {id: 'role-pm', title: 'Engineering Manager'})

      // Skills
      CREATE (sysdesign:Skill:WexaGraphApp {id: 'skill-sysdesign', name: 'System Design', level: 'Advanced'})
      CREATE (agile:Skill:WexaGraphApp {id: 'skill-agile', name: 'Agile Methodology', level: 'Intermediate'})
      CREATE (codereview:Skill:WexaGraphApp {id: 'skill-codereview', name: 'Code Review', level: 'Advanced'})
      CREATE (mentoring:Skill:WexaGraphApp {id: 'skill-mentoring', name: 'Mentoring', level: 'Advanced'})
      CREATE (debugging:Skill:WexaGraphApp {id: 'skill-debugging', name: 'Debugging', level: 'Expert'})
      CREATE (apiDesign:Skill:WexaGraphApp {id: 'skill-apidesign', name: 'API Design', level: 'Advanced'})
      CREATE (testing:Skill:WexaGraphApp {id: 'skill-testing', name: 'Test Automation', level: 'Intermediate'})
      CREATE (security:Skill:WexaGraphApp {id: 'skill-security', name: 'Security Best Practices', level: 'Intermediate'})
      CREATE (perf:Skill:WexaGraphApp {id: 'skill-perf', name: 'Performance Optimization', level: 'Advanced'})
      CREATE (docs:Skill:WexaGraphApp {id: 'skill-docs', name: 'Technical Writing', level: 'Intermediate'})
      CREATE (leadership:Skill:WexaGraphApp {id: 'skill-leadership', name: 'Technical Leadership', level: 'Advanced'})
      CREATE (dataModel:Skill:WexaGraphApp {id: 'skill-datamodel', name: 'Data Modeling', level: 'Advanced'})

      // Technologies
      CREATE (react:Technology:WexaGraphApp {id: 'tech-react', name: 'React', category: 'Frontend'})
      CREATE (node:Technology:WexaGraphApp {id: 'tech-node', name: 'Node.js', category: 'Backend'})
      CREATE (graphql:Technology:WexaGraphApp {id: 'tech-graphql', name: 'GraphQL', category: 'API'})
      CREATE (typescript:Technology:WexaGraphApp {id: 'tech-typescript', name: 'TypeScript', category: 'Language'})
      CREATE (python:Technology:WexaGraphApp {id: 'tech-python', name: 'Python', category: 'Language'})
      CREATE (postgres:Technology:WexaGraphApp {id: 'tech-postgres', name: 'PostgreSQL', category: 'Database'})
      CREATE (neo4j:Technology:WexaGraphApp {id: 'tech-neo4j', name: 'Neo4j', category: 'Database'})
      CREATE (cognodb:Technology:WexaGraphApp {id: 'tech-cognodb', name: 'CognoDB', category: 'Database'})
      CREATE (docker:Technology:WexaGraphApp {id: 'tech-docker', name: 'Docker', category: 'DevOps'})
      CREATE (k8s:Technology:WexaGraphApp {id: 'tech-k8s', name: 'Kubernetes', category: 'DevOps'})
      CREATE (aws:Technology:WexaGraphApp {id: 'tech-aws', name: 'AWS', category: 'Cloud'})
      CREATE (redis:Technology:WexaGraphApp {id: 'tech-redis', name: 'Redis', category: 'Database'})
      CREATE (vite:Technology:WexaGraphApp {id: 'tech-vite', name: 'Vite', category: 'Frontend'})
      CREATE (tailwind:Technology:WexaGraphApp {id: 'tech-tailwind', name: 'Tailwind CSS', category: 'Frontend'})
      CREATE (express:Technology:WexaGraphApp {id: 'tech-express', name: 'Express.js', category: 'Backend'})
      CREATE (fastapi:Technology:WexaGraphApp {id: 'tech-fastapi', name: 'FastAPI', category: 'Backend'})
      CREATE (kafka:Technology:WexaGraphApp {id: 'tech-kafka', name: 'Apache Kafka', category: 'Messaging'})
      CREATE (spark:Technology:WexaGraphApp {id: 'tech-spark', name: 'Apache Spark', category: 'Data'})

      // Technology relationships
      CREATE (react)-[:RELATED_TO]->(typescript)
      CREATE (typescript)-[:RELATED_TO]->(react)
      CREATE (react)-[:RELATED_TO]->(vite)
      CREATE (vite)-[:RELATED_TO]->(tailwind)
      CREATE (node)-[:RELATED_TO]->(express)
      CREATE (express)-[:RELATED_TO]->(graphql)
      CREATE (neo4j)-[:RELATED_TO]->(cognodb)
      CREATE (cognodb)-[:RELATED_TO]->(neo4j)
      CREATE (docker)-[:RELATED_TO]->(k8s)
      CREATE (k8s)-[:RELATED_TO]->(aws)
      CREATE (python)-[:RELATED_TO]->(fastapi)
      CREATE (kafka)-[:RELATED_TO]->(spark)
      CREATE (redis)-[:RELATED_TO]->(postgres)

      // Projects
      CREATE (dkp:Project:WexaGraphApp {id: 'proj-dkp', name: 'Developer Knowledge Platform', description: 'Internal developer portal with knowledge graph exploration', status: 'Active'})
      CREATE (portal:Project:WexaGraphApp {id: 'proj-portal', name: 'Customer Portal', description: 'Self-service customer management portal', status: 'Active'})
      CREATE (analytics:Project:WexaGraphApp {id: 'proj-analytics', name: 'Real-time Analytics Engine', description: 'Streaming analytics pipeline for business metrics', status: 'Active'})
      CREATE (mobileApp:Project:WexaGraphApp {id: 'proj-mobile', name: 'HealthSync Mobile App', description: 'Patient-facing mobile application', status: 'Active'})
      CREATE (payment:Project:WexaGraphApp {id: 'proj-payment', name: 'Payment Gateway', description: 'Secure payment processing microservice', status: 'Maintenance'})
      CREATE (ml:Project:WexaGraphApp {id: 'proj-ml', name: 'ML Recommendation Service', description: 'Machine learning recommendation engine', status: 'Active'})
      CREATE (infraMon:Project:WexaGraphApp {id: 'proj-infra', name: 'Infrastructure Monitor', description: 'Cloud infrastructure monitoring dashboard', status: 'Active'})
      CREATE (apiGateway:Project:WexaGraphApp {id: 'proj-api', name: 'API Gateway', description: 'Centralized API gateway and rate limiting', status: 'Active'})
      CREATE (dataLake:Project:WexaGraphApp {id: 'proj-datalake', name: 'Data Lake Pipeline', description: 'ETL pipeline for enterprise data lake', status: 'Planning'})

      // Project ownership and tech
      CREATE (dkp)-[:OWNED_BY]->(wexa)
      CREATE (portal)-[:OWNED_BY]->(cloudnine)
      CREATE (analytics)-[:OWNED_BY]->(dataflow)
      CREATE (mobileApp)-[:OWNED_BY]->(healthsync)
      CREATE (payment)-[:OWNED_BY]->(nexgen)
      CREATE (ml)-[:OWNED_BY]->(dataflow)
      CREATE (infraMon)-[:OWNED_BY]->(cloudnine)
      CREATE (apiGateway)-[:OWNED_BY]->(wexa)
      CREATE (dataLake)-[:OWNED_BY]->(dataflow)

      CREATE (dkp)-[:USES]->(react)
      CREATE (dkp)-[:USES]->(node)
      CREATE (dkp)-[:USES]->(cognodb)
      CREATE (dkp)-[:USES]->(graphql)
      CREATE (dkp)-[:USES]->(vite)
      CREATE (portal)-[:USES]->(react)
      CREATE (portal)-[:USES]->(typescript)
      CREATE (portal)-[:USES]->(express)
      CREATE (portal)-[:USES]->(postgres)
      CREATE (analytics)-[:USES]->(python)
      CREATE (analytics)-[:USES]->(kafka)
      CREATE (analytics)-[:USES]->(spark)
      CREATE (analytics)-[:USES]->(redis)
      CREATE (mobileApp)-[:USES]->(react)
      CREATE (mobileApp)-[:USES]->(typescript)
      CREATE (mobileApp)-[:USES]->(graphql)
      CREATE (payment)-[:USES]->(node)
      CREATE (payment)-[:USES]->(express)
      CREATE (payment)-[:USES]->(postgres)
      CREATE (payment)-[:USES]->(redis)
      CREATE (ml)-[:USES]->(python)
      CREATE (ml)-[:USES]->(fastapi)
      CREATE (ml)-[:USES]->(kafka)
      CREATE (infraMon)-[:USES]->(docker)
      CREATE (infraMon)-[:USES]->(k8s)
      CREATE (infraMon)-[:USES]->(aws)
      CREATE (apiGateway)-[:USES]->(node)
      CREATE (apiGateway)-[:USES]->(express)
      CREATE (apiGateway)-[:USES]->(redis)
      CREATE (dataLake)-[:USES]->(python)
      CREATE (dataLake)-[:USES]->(spark)
      CREATE (dataLake)-[:USES]->(kafka)
      CREATE (dataLake)-[:USES]->(aws)

      // Developers
      CREATE (aisha:Developer:WexaGraphApp {id: 'dev-aisha', name: 'Aisha Khan', email: 'aisha.khan@wexalabs.com', experience: 5, location: 'San Francisco, CA'})
      CREATE (john:Developer:WexaGraphApp {id: 'dev-john', name: 'John Smith', email: 'john.smith@wexalabs.com', experience: 7, location: 'New York, NY'})
      CREATE (maria:Developer:WexaGraphApp {id: 'dev-maria', name: 'Maria Garcia', email: 'maria.garcia@cloudnine.io', experience: 4, location: 'Austin, TX'})
      CREATE (david:Developer:WexaGraphApp {id: 'dev-david', name: 'David Chen', email: 'david.chen@dataflow.ai', experience: 8, location: 'Seattle, WA'})
      CREATE (priya:Developer:WexaGraphApp {id: 'dev-priya', name: 'Priya Patel', email: 'priya.patel@healthsync.com', experience: 3, location: 'Boston, MA'})
      CREATE (james:Developer:WexaGraphApp {id: 'dev-james', name: 'James Wilson', email: 'james.wilson@nexgen.com', experience: 6, location: 'Chicago, IL'})
      CREATE (sarah:Developer:WexaGraphApp {id: 'dev-sarah', name: 'Sarah Johnson', email: 'sarah.j@wexalabs.com', experience: 9, location: 'San Francisco, CA'})
      CREATE (michael:Developer:WexaGraphApp {id: 'dev-michael', name: 'Michael Brown', email: 'm.brown@cloudnine.io', experience: 5, location: 'Denver, CO'})
      CREATE (emma:Developer:WexaGraphApp {id: 'dev-emma', name: 'Emma Davis', email: 'emma.d@dataflow.ai', experience: 4, location: 'Portland, OR'})
      CREATE (alex:Developer:WexaGraphApp {id: 'dev-alex', name: 'Alex Rivera', email: 'alex.r@wexalabs.com', experience: 2, location: 'Miami, FL'})
      CREATE (lisa:Developer:WexaGraphApp {id: 'dev-lisa', name: 'Lisa Wang', email: 'lisa.w@nexgen.com', experience: 6, location: 'Los Angeles, CA'})
      CREATE (ryan:Developer:WexaGraphApp {id: 'dev-ryan', name: "Ryan O'Connor", email: 'ryan.o@cloudnine.io', experience: 7, location: 'Dublin, Ireland'})

      // Developer work relationships
      CREATE (aisha)-[:WORKS_AT]->(wexa)
      CREATE (john)-[:WORKS_AT]->(wexa)
      CREATE (maria)-[:WORKS_AT]->(cloudnine)
      CREATE (david)-[:WORKS_AT]->(dataflow)
      CREATE (priya)-[:WORKS_AT]->(healthsync)
      CREATE (james)-[:WORKS_AT]->(nexgen)
      CREATE (sarah)-[:WORKS_AT]->(wexa)
      CREATE (michael)-[:WORKS_AT]->(cloudnine)
      CREATE (emma)-[:WORKS_AT]->(dataflow)
      CREATE (alex)-[:WORKS_AT]->(wexa)
      CREATE (lisa)-[:WORKS_AT]->(nexgen)
      CREATE (ryan)-[:WORKS_AT]->(cloudnine)

      CREATE (aisha)-[:MEMBER_OF]->(platform)
      CREATE (john)-[:MEMBER_OF]->(platform)
      CREATE (alex)-[:MEMBER_OF]->(platform)
      CREATE (maria)-[:MEMBER_OF]->(frontend)
      CREATE (michael)-[:MEMBER_OF]->(frontend)
      CREATE (david)-[:MEMBER_OF]->(data)
      CREATE (emma)-[:MEMBER_OF]->(data)
      CREATE (priya)-[:MEMBER_OF]->(mobile)
      CREATE (james)-[:MEMBER_OF]->(infra)
      CREATE (lisa)-[:MEMBER_OF]->(infra)
      CREATE (sarah)-[:MEMBER_OF]->(platform)
      CREATE (ryan)-[:MEMBER_OF]->(infra)

      CREATE (aisha)-[:HAS_ROLE]->(se)
      CREATE (john)-[:HAS_ROLE]->(sse)
      CREATE (maria)-[:HAS_ROLE]->(se)
      CREATE (david)-[:HAS_ROLE]->(lead)
      CREATE (priya)-[:HAS_ROLE]->(se)
      CREATE (james)-[:HAS_ROLE]->(devops)
      CREATE (sarah)-[:HAS_ROLE]->(arch)
      CREATE (michael)-[:HAS_ROLE]->(sse)
      CREATE (emma)-[:HAS_ROLE]->(se)
      CREATE (alex)-[:HAS_ROLE]->(se)
      CREATE (lisa)-[:HAS_ROLE]->(sse)
      CREATE (ryan)-[:HAS_ROLE]->(devops)

      CREATE (aisha)-[:WORKS_ON {since: '2023-01', contribution: 'Lead frontend'}]->(dkp)
      CREATE (john)-[:WORKS_ON {since: '2022-06', contribution: 'Backend architecture'}]->(dkp)
      CREATE (alex)-[:WORKS_ON {since: '2024-03', contribution: 'Graph visualization'}]->(dkp)
      CREATE (sarah)-[:WORKS_ON {since: '2021-01', contribution: 'System design'}]->(apiGateway)
      CREATE (john)-[:WORKS_ON {since: '2023-08', contribution: 'API layer'}]->(apiGateway)
      CREATE (maria)-[:WORKS_ON {since: '2023-04', contribution: 'UI components'}]->(portal)
      CREATE (michael)-[:WORKS_ON {since: '2022-11', contribution: 'Portal backend'}]->(portal)
      CREATE (david)-[:WORKS_ON {since: '2021-06', contribution: 'Pipeline design'}]->(analytics)
      CREATE (emma)-[:WORKS_ON {since: '2023-09', contribution: 'Stream processing'}]->(analytics)
      CREATE (david)-[:WORKS_ON {since: '2024-01', contribution: 'Data architecture'}]->(dataLake)
      CREATE (priya)-[:WORKS_ON {since: '2023-02', contribution: 'Mobile UI'}]->(mobileApp)
      CREATE (james)-[:WORKS_ON {since: '2022-03', contribution: 'Payment security'}]->(payment)
      CREATE (lisa)-[:WORKS_ON {since: '2023-06', contribution: 'Transaction processing'}]->(payment)
      CREATE (ryan)-[:WORKS_ON {since: '2022-08', contribution: 'K8s deployment'}]->(infraMon)
      CREATE (james)-[:WORKS_ON {since: '2023-11', contribution: 'Monitoring stack'}]->(infraMon)
      CREATE (emma)-[:WORKS_ON {since: '2024-02', contribution: 'ML models'}]->(ml)

      // Developer technology knowledge
      CREATE (aisha)-[:KNOWS {years: 4}]->(react)
      CREATE (aisha)-[:KNOWS {years: 3}]->(node)
      CREATE (aisha)-[:KNOWS {years: 2}]->(graphql)
      CREATE (aisha)-[:KNOWS {years: 3}]->(typescript)
      CREATE (aisha)-[:KNOWS {years: 1}]->(cognodb)
      CREATE (aisha)-[:KNOWS {years: 2}]->(vite)
      CREATE (john)-[:KNOWS {years: 6}]->(node)
      CREATE (john)-[:KNOWS {years: 5}]->(express)
      CREATE (john)-[:KNOWS {years: 4}]->(graphql)
      CREATE (john)-[:KNOWS {years: 3}]->(postgres)
      CREATE (john)-[:KNOWS {years: 2}]->(redis)
      CREATE (maria)-[:KNOWS {years: 3}]->(react)
      CREATE (maria)-[:KNOWS {years: 2}]->(typescript)
      CREATE (maria)-[:KNOWS {years: 2}]->(tailwind)
      CREATE (maria)-[:KNOWS {years: 1}]->(vite)
      CREATE (david)-[:KNOWS {years: 6}]->(python)
      CREATE (david)-[:KNOWS {years: 5}]->(kafka)
      CREATE (david)-[:KNOWS {years: 4}]->(spark)
      CREATE (david)-[:KNOWS {years: 3}]->(aws)
      CREATE (priya)-[:KNOWS {years: 2}]->(react)
      CREATE (priya)-[:KNOWS {years: 2}]->(typescript)
      CREATE (priya)-[:KNOWS {years: 1}]->(graphql)
      CREATE (james)-[:KNOWS {years: 5}]->(docker)
      CREATE (james)-[:KNOWS {years: 4}]->(k8s)
      CREATE (james)-[:KNOWS {years: 3}]->(aws)
      CREATE (james)-[:KNOWS {years: 4}]->(node)
      CREATE (sarah)-[:KNOWS {years: 7}]->(node)
      CREATE (sarah)-[:KNOWS {years: 6}]->(express)
      CREATE (sarah)-[:KNOWS {years: 5}]->(aws)
      CREATE (sarah)-[:KNOWS {years: 4}]->(docker)
      CREATE (sarah)-[:KNOWS {years: 3}]->(k8s)
      CREATE (michael)-[:KNOWS {years: 4}]->(node)
      CREATE (michael)-[:KNOWS {years: 3}]->(express)
      CREATE (michael)-[:KNOWS {years: 3}]->(postgres)
      CREATE (michael)-[:KNOWS {years: 2}]->(redis)
      CREATE (emma)-[:KNOWS {years: 3}]->(python)
      CREATE (emma)-[:KNOWS {years: 2}]->(kafka)
      CREATE (emma)-[:KNOWS {years: 2}]->(spark)
      CREATE (emma)-[:KNOWS {years: 1}]->(fastapi)
      CREATE (alex)-[:KNOWS {years: 1}]->(react)
      CREATE (alex)-[:KNOWS {years: 1}]->(cognodb)
      CREATE (alex)-[:KNOWS {years: 1}]->(vite)
      CREATE (lisa)-[:KNOWS {years: 5}]->(node)
      CREATE (lisa)-[:KNOWS {years: 4}]->(postgres)
      CREATE (lisa)-[:KNOWS {years: 3}]->(redis)
      CREATE (ryan)-[:KNOWS {years: 5}]->(docker)
      CREATE (ryan)-[:KNOWS {years: 4}]->(k8s)
      CREATE (ryan)-[:KNOWS {years: 4}]->(aws)

      // Developer skills
      CREATE (aisha)-[:HAS_SKILL {level: 'Advanced'}]->(sysdesign)
      CREATE (aisha)-[:HAS_SKILL {level: 'Advanced'}]->(codereview)
      CREATE (aisha)-[:HAS_SKILL {level: 'Intermediate'}]->(apiDesign)
      CREATE (john)-[:HAS_SKILL {level: 'Expert'}]->(sysdesign)
      CREATE (john)-[:HAS_SKILL {level: 'Advanced'}]->(debugging)
      CREATE (john)-[:HAS_SKILL {level: 'Advanced'}]->(apiDesign)
      CREATE (maria)-[:HAS_SKILL {level: 'Intermediate'}]->(testing)
      CREATE (maria)-[:HAS_SKILL {level: 'Intermediate'}]->(agile)
      CREATE (david)-[:HAS_SKILL {level: 'Expert'}]->(dataModel)
      CREATE (david)-[:HAS_SKILL {level: 'Advanced'}]->(leadership)
      CREATE (david)-[:HAS_SKILL {level: 'Advanced'}]->(sysdesign)
      CREATE (priya)-[:HAS_SKILL {level: 'Intermediate'}]->(testing)
      CREATE (james)-[:HAS_SKILL {level: 'Advanced'}]->(security)
      CREATE (james)-[:HAS_SKILL {level: 'Advanced'}]->(perf)
      CREATE (sarah)-[:HAS_SKILL {level: 'Expert'}]->(leadership)
      CREATE (sarah)-[:HAS_SKILL {level: 'Expert'}]->(sysdesign)
      CREATE (sarah)-[:HAS_SKILL {level: 'Advanced'}]->(mentoring)
      CREATE (michael)-[:HAS_SKILL {level: 'Advanced'}]->(debugging)
      CREATE (emma)-[:HAS_SKILL {level: 'Intermediate'}]->(dataModel)
      CREATE (alex)-[:HAS_SKILL {level: 'Beginner'}]->(docs)
      CREATE (lisa)-[:HAS_SKILL {level: 'Advanced'}]->(security)
      CREATE (ryan)-[:HAS_SKILL {level: 'Expert'}]->(perf)

      // Collaboration relationships
      CREATE (aisha)-[:COLLABORATES_WITH]->(john)
      CREATE (john)-[:COLLABORATES_WITH]->(aisha)
      CREATE (aisha)-[:COLLABORATES_WITH]->(alex)
      CREATE (alex)-[:COLLABORATES_WITH]->(aisha)
      CREATE (john)-[:COLLABORATES_WITH]->(sarah)
      CREATE (sarah)-[:COLLABORATES_WITH]->(john)
      CREATE (maria)-[:COLLABORATES_WITH]->(michael)
      CREATE (michael)-[:COLLABORATES_WITH]->(maria)
      CREATE (david)-[:COLLABORATES_WITH]->(emma)
      CREATE (emma)-[:COLLABORATES_WITH]->(david)
      CREATE (james)-[:COLLABORATES_WITH]->(ryan)
      CREATE (ryan)-[:COLLABORATES_WITH]->(james)
      CREATE (james)-[:COLLABORATES_WITH]->(lisa)
      CREATE (lisa)-[:COLLABORATES_WITH]->(james)
      CREATE (aisha)-[:COLLABORATES_WITH]->(maria)
      CREATE (maria)-[:COLLABORATES_WITH]->(aisha)
    `);

    console.log('Seed data created successfully!\n');

    const counts = await session.run(`
      MATCH (d:Developer) WITH count(d) AS developers
      MATCH (p:Project) WITH developers, count(p) AS projects
      MATCH (t:Technology) WITH developers, projects, count(t) AS technologies
      MATCH (s:Skill) WITH developers, projects, technologies, count(s) AS skills
      MATCH (c:Company) WITH developers, projects, technologies, skills, count(c) AS companies
      MATCH (tm:Team) WITH developers, projects, technologies, skills, companies, count(tm) AS teams
      MATCH (r:Role) WITH developers, projects, technologies, skills, companies, teams, count(r) AS roles
      RETURN developers, projects, technologies, skills, companies, teams, roles
    `);

    const record = counts.records[0];
    console.log('Dataset summary:');
    console.log(`  Developers:   ${record.get('developers').toNumber()}`);
    console.log(`  Projects:     ${record.get('projects').toNumber()}`);
    console.log(`  Technologies: ${record.get('technologies').toNumber()}`);
    console.log(`  Skills:       ${record.get('skills').toNumber()}`);
    console.log(`  Companies:    ${record.get('companies').toNumber()}`);
    console.log(`  Teams:        ${record.get('teams').toNumber()}`);
    console.log(`  Roles:        ${record.get('roles').toNumber()}`);
  } finally {
    await session.close();
  }

  await closeDriver();
  console.log('\nConnection closed. Seed complete.');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
