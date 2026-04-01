import * as React from "react";

type AccordionProps = {
  children: React.ReactNode;
};

export function Accordion({ children }: AccordionProps) {
  return <div className="space-y-2">{children}</div>;
}

export function AccordionItem({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-2xl overflow-hidden">
      {children}
    </div>
  );
}

export function AccordionTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-4 py-3 text-left font-medium hover:bg-muted/50"
      >
        {children}
        <span>{open ? "-" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-3 text-sm text-muted-foreground">{children}</div>}
    </>
  );
}

export function AccordionContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="px-4 pb-3 text-sm text-muted-foreground">{children}</div>;
}