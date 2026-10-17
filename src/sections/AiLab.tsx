import { getAiLab, getProfile } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import { useScrollReveal } from '../hooks/useScrollReveal';

/**
 * Renders content/ai-lab.json. Models show only "used" or "evaluated" —
 * never a rating. Workflows carry their maturity tag (e.g. "experiment" vs
 * "working workflow") exactly as authored.
 */
export default function AiLab() {
  const aiLab = getAiLab();
  const profile = getProfile();
  const revealRef = useScrollReveal<HTMLDivElement>();

  return (
    <section id="ai-lab" aria-labelledby="ai-lab-heading" className="border-b border-line px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <SectionHeading id="ai-lab-heading" eyebrow="AI Lab" title={aiLab.title} description={aiLab.intro} />

        <div className="space-y-3">
          <Disclaimer>{aiLab.disclaimer}</Disclaimer>
          <Disclaimer label="Models">{profile.disclaimers.ai}</Disclaimer>
        </div>

        <div ref={revealRef} className="mt-10 grid gap-10 lg:grid-cols-2">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Environments</h3>
            <ul className="mt-4 space-y-3">
              {aiLab.environments.map((env) => (
                <li key={env.name}>
                  <Panel className="p-4">
                    <p className="font-medium text-text-strong">{env.name}</p>
                    <p className="mt-1 text-sm text-text">{env.use}</p>
                  </Panel>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Models</h3>
            <p className="mt-1 text-sm text-text">{aiLab.models.note}</p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {aiLab.models.items.map((model) => (
                <li
                  key={model.name}
                  className="flex items-center gap-2 border border-line bg-panel px-3 py-1.5 text-sm text-text-strong"
                >
                  {model.name}
                  <span className="font-mono text-[10px] uppercase tracking-wider text-teal">
                    {model.relation}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Workflows</h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {aiLab.workflows.map((workflow) => (
              <li key={workflow.id}>
                <Panel className="h-full p-4">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-text-strong">{workflow.title}</p>
                    <span className="border border-line px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-text">
                      {workflow.maturity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text">{workflow.description}</p>
                  {workflow.guardrails && workflow.guardrails.length > 0 ? (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3">
                      {workflow.guardrails.map((rail) => (
                        <li key={rail} className="text-xs text-text">
                          {rail}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </Panel>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10">
          <h3 className="font-mono text-xs uppercase tracking-[0.3em] text-teal">Use cases</h3>
          <ul className="mt-4 flex flex-wrap gap-2">
            {aiLab.use_cases.map((useCase) => (
              <li key={useCase} className="border border-line px-3 py-1 text-sm text-text">
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
