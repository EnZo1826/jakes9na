import { getAiLab, getProfile } from '../content/loader';
import SectionHeading from '../components/SectionHeading';
import Panel from '../components/Panel';
import Disclaimer from '../components/Disclaimer';
import LiveRegion from '../components/LiveRegion';
import ProjectIllustration from '../illustrations/ProjectIllustrations';
import { reveal } from '../hooks/useScrollReveal';

/**
 * Renders content/ai-lab.json. Models show only "used" or "evaluated" —
 * never a rating. Workflows carry their maturity tag (e.g. "experiment" vs
 * "working workflow") exactly as authored.
 */
export default function AiLab() {
  const aiLab = getAiLab();
  const profile = getProfile();

  return (
    <section id="ai-lab" aria-labelledby="ai-lab-heading" className="relative border-b border-line px-6 py-24 lg:py-32">
      <div className="mx-auto max-w-6xl">
        <SectionHeading id="ai-lab-heading" title={aiLab.title} description={aiLab.intro} />

        <div className="grid gap-3 md:grid-cols-2" data-reveal>
          <Disclaimer>{aiLab.disclaimer}</Disclaimer>
          <Disclaimer label="Models">{profile.disclaimers.ai}</Disclaimer>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h3 className="label text-teal" data-reveal>
              Workflows
            </h3>
            <ul className="mt-5 grid gap-4">
              {aiLab.workflows.map((workflow, index) => (
                <li key={workflow.id} {...reveal(index)}>
                  <Panel interactive className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-lg font-semibold tracking-tight text-text-strong">{workflow.title}</p>
                      <span
                        className={`chip shrink-0 ${/working/i.test(workflow.maturity) ? 'border-teal/40 text-teal' : ''}`}
                      >
                        {workflow.maturity}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-text">{workflow.description}</p>
                    {workflow.guardrails && workflow.guardrails.length > 0 ? (
                      <ul className="mt-4 grid gap-1.5 border-t border-line pt-4 sm:grid-cols-2">
                        {workflow.guardrails.map((rail) => (
                          <li key={rail} className="flex gap-2 text-xs leading-relaxed text-text">
                            <svg viewBox="0 0 12 12" aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0 text-teal">
                              <path d="M2.5 6.2l2.2 2.2 4.8-5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
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

          <div className="space-y-6 lg:col-span-5">
            <Panel ticks className="overflow-hidden">
              <div data-reveal>
                <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                  <span className="label">Agent workflow</span>
                  <span className="font-mono text-[10px] uppercase tracking-wider text-text">schematic</span>
                </div>
                <LiveRegion>
                  <ProjectIllustration projectId={aiLab.project_id} />
                </LiveRegion>
              </div>
            </Panel>

            <Panel className="p-5">
              <div data-reveal>
                <h3 className="label text-teal">Models</h3>
                <p className="mt-2 text-sm text-text">{aiLab.models.note}</p>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {aiLab.models.items.map((model) => (
                    <li
                      key={model.name}
                      className="flex items-center gap-2 rounded-md border border-line bg-bg/60 px-3 py-1.5 text-sm text-text-strong"
                    >
                      {model.name}
                      <span className={`font-mono text-[10px] uppercase tracking-wider ${model.relation === 'used' ? 'text-teal' : 'text-text'}`}>
                        {model.relation}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </Panel>
          </div>
        </div>

        <div className="mt-14">
          <h3 className="label text-teal" data-reveal>
            Environments
          </h3>
          <ul className="mt-5 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
            {aiLab.environments.map((env, index) => (
              <li key={env.name} {...reveal(index % 3)} className="bg-panel p-5 transition-colors hover:bg-[#141b23] sm:last:odd:col-span-2 lg:last:odd:col-span-1">
                <p className="font-medium text-text-strong">{env.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-text">{env.use}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-14" data-reveal>
          <h3 className="label text-teal">Use cases</h3>
          <ul className="mt-5 flex flex-wrap gap-2">
            {aiLab.use_cases.map((useCase) => (
              <li key={useCase} className="rounded-full border border-line bg-panel px-4 py-1.5 text-sm text-text-strong">
                {useCase}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
