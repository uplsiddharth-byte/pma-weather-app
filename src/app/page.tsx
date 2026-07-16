import Dashboard from "@/components/Dashboard";
import SearchManager from "@/components/SearchManager";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-10 px-4 py-10 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold">Weather App</h1>
        <p className="text-sm text-zinc-500">Built by Siddharth Uppala — PM Accelerator Technical Assessment</p>
      </header>

      <Dashboard />

      <hr className="border-zinc-200 dark:border-zinc-800" />

      <SearchManager />

      <footer className="mt-6 rounded-xl border border-zinc-200 p-4 text-sm text-zinc-500 dark:border-zinc-800">
        <p className="font-semibold text-zinc-600 dark:text-zinc-400">About PM Accelerator</p>
        <p className="mt-1">
          The Product Manager Accelerator Program is designed to support PM professionals through every stage of
          their career — from students looking for entry-level jobs to Directors looking to become VPs. It provides
          personalized 1:1 coaching, mock interviews, and real-world project experience to help members break into
          product management or level up in their careers.{" "}
          <a
            href="https://www.linkedin.com/school/pmaccelerator/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            Learn more on LinkedIn
          </a>
          .
        </p>
      </footer>
    </div>
  );
}
