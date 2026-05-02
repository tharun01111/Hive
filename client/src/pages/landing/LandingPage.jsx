import { Link } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import ThemeToggle from "../../components/ui/ThemeToggle.jsx";
import { AvatarStack } from "../../components/ui/Avatar.jsx";

const demoUsers = [
  { id: "1", name: "Tharun" },
  { id: "2", name: "Aisha" },
  { id: "3", name: "Maya" },
];

const features = [
  ["Realtime Kanban", "Move cards, organize columns, and keep everyone aligned as work changes."],
  ["Project Chat", "Keep discussion beside the board instead of scattering context across tools."],
  ["Activity Feed", "See the heartbeat of your workspace through card, column, and member updates."],
  ["Team Workspaces", "Separate teams, projects, members, and permissions cleanly."],
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--hive-bg)] text-neutral-900 dark:text-neutral-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_4%,rgba(62,207,142,0.16),transparent_30%),radial-gradient(circle_at_88%_10%,rgba(90,167,255,0.11),transparent_28%)]" />
      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-premium bg-[linear-gradient(135deg,var(--hive-accent),#2b7cff)] text-sm font-semibold text-white shadow-[0_0_24px_rgba(62,207,142,0.26)]">
            H
          </div>
          <span className="text-sm font-semibold">Hive</span>
        </Link>
        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/login" className="btn-ghost">
            Log in
          </Link>
          <Link to="/register" className="btn-primary">
            Start workspace
          </Link>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-20 pt-10">
        <section className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
          <Motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24 }}
          >
            <div className="mb-5 inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--hive-accent)_28%,var(--hive-border))] bg-[var(--hive-accent-soft)] px-3 py-1 text-xs text-[var(--hive-accent-strong)] shadow-sm">
              Realtime workspace for focused teams
            </div>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-6xl">
              Plan projects, move work, and keep your team in sync.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-600 dark:text-neutral-400">
              Hive combines Kanban boards, project chat, members, activity, and notifications in one clean collaborative workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/register" className="btn-primary px-5 py-2.5">
                Start building your workspace
              </Link>
              <Link to="/login" className="btn-secondary px-5 py-2.5">
                View your workspace
              </Link>
            </div>
          </Motion.div>

          <ProductPreview />
        </section>

        <section className="mt-20 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(([title, description]) => (
            <div key={title} className="card group p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_srgb,var(--hive-accent)_36%,var(--hive-border))] hover:shadow-premium-md">
              <div className="mb-4 h-1 w-10 rounded-full bg-[var(--hive-accent)] shadow-[0_0_16px_rgba(62,207,142,0.38)] transition-all duration-200 group-hover:w-14" />
              <h2 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
                {description}
              </p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function ProductPreview() {
  const columns = [
    ["Backlog", ["Design empty states", "Draft onboarding flow"]],
    ["In Progress", ["Polish card metadata", "Add presence events"]],
    ["Done", ["Ship activity feed", "Harden auth checks"]],
  ];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, delay: 0.08 }}
      className="relative"
    >
      <div className="card overflow-hidden shadow-premium-lg">
        <div className="flex items-center justify-between border-b border-[var(--hive-border)] px-5 py-4">
          <div>
            <p className="text-lg font-semibold">API Redesign</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              4 members · 3 online · active now
            </p>
          </div>
          <AvatarStack members={demoUsers} size="sm" />
        </div>
        <div className="grid gap-3 bg-[color-mix(in_srgb,var(--hive-bg)_72%,var(--hive-surface))] p-4 sm:grid-cols-3">
          {columns.map(([name, cards], index) => (
            <div
              key={name}
              className="rounded-premium border border-[var(--hive-border)] border-t-2 border-t-[color-mix(in_srgb,var(--hive-accent)_42%,var(--hive-border))] bg-[color-mix(in_srgb,var(--hive-surface-raised)_92%,transparent)] p-3"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-medium">{name}</span>
                <span className="rounded-full border border-[var(--hive-border)] bg-[var(--hive-accent-soft)] px-2 py-0.5 text-xs text-[var(--hive-accent-strong)]">
                  {cards.length}
                </span>
              </div>
              <div className="space-y-2">
                {cards.map((card, cardIndex) => (
                  <div key={card} className="card p-3 text-left">
                    <div className="mb-2 h-1 w-8 rounded-full bg-[color-mix(in_srgb,var(--hive-accent)_70%,transparent)]" />
                    <p className="text-xs font-medium">{card}</p>
                    <p className="mt-1 text-[11px] text-neutral-400">
                      {index === 2 ? "Completed" : cardIndex === 0 ? "Due soon" : "Assigned"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="grid border-t border-[var(--hive-border)] sm:grid-cols-[1fr_220px]">
          <div className="p-4 text-sm text-neutral-500 dark:text-neutral-400">
            Aisha moved "Add presence events" to In Progress.
          </div>
          <div className="border-t border-[var(--hive-border)] p-4 text-sm sm:border-l sm:border-t-0">
            <p className="mb-2 text-xs font-medium text-neutral-400">Project chat</p>
            <div className="rounded-premium border border-[var(--hive-border)] bg-[color-mix(in_srgb,var(--hive-surface-raised)_86%,transparent)] px-3 py-2 text-xs">
              Let us keep the board focused today.
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
}
