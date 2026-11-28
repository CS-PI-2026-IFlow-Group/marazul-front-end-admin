export default function PageHeader({ title, action }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <h1 className="min-w-0 text-3xl font-bold text-foreground md:text-4xl">
        {title}
      </h1>
      {action}
    </div>
  );
}
