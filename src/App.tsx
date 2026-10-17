import SkipLink from './components/SkipLink';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';
import CommandCenter from './sections/CommandCenter';
import About from './sections/About';
import Domains from './sections/Domains';
import Ecosystem from './sections/Ecosystem';
import Projects from './sections/Projects';
import ArchitectureLab from './sections/ArchitectureLab';
import AiLab from './sections/AiLab';
import GithubActivity from './sections/GithubActivity';
import Contact from './sections/Contact';

export default function App() {
  return (
    <>
      <SkipLink />
      <SiteHeader />
      <main id="main-content">
        <CommandCenter />
        <About />
        <Domains />
        <Ecosystem />
        <Projects />
        <ArchitectureLab />
        <AiLab />
        <GithubActivity />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
