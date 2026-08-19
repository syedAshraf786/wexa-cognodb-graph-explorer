import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Developers from './pages/Developers';
import DeveloperDetail from './pages/DeveloperDetail';
import Projects from './pages/Projects';
import ProjectDetail from './pages/ProjectDetail';
import Technologies from './pages/Technologies';
import TechnologyDetail from './pages/TechnologyDetail';
import GraphExplorer from './pages/GraphExplorer';
import CollaborationExplorer from './pages/CollaborationExplorer';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="developers" element={<Developers />} />
        <Route path="developers/:id" element={<DeveloperDetail />} />
        <Route path="projects" element={<Projects />} />
        <Route path="projects/:id" element={<ProjectDetail />} />
        <Route path="technologies" element={<Technologies />} />
        <Route path="technologies/:id" element={<TechnologyDetail />} />
        <Route path="graph" element={<GraphExplorer />} />
        <Route path="collaboration" element={<CollaborationExplorer />} />
      </Route>
    </Routes>
  );
}
