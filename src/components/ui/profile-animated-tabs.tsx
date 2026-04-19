import React, { useMemo, useState } from "react";

type TabItem = {
  value: string;
  label: string;
};

type ProfileAnimatedTabsProps = {
  tabs: TabItem[];
  activeTab: string;
  onChange: (value: string) => void;
};

export default function ProfileAnimatedTabs({
  tabs,
  activeTab,
  onChange,
}: ProfileAnimatedTabsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const activeIndex = useMemo(() => {
    const index = tabs.findIndex((tab) => tab.value === activeTab);
    return index === -1 ? 0 : index;
  }, [tabs, activeTab]);

  const previewIndex = hoveredIndex ?? activeIndex;

  return (
    <div className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none]">
      <div
        className="relative flex w-full items-center rounded-[12px] border border-zinc-200 bg-white px-[8px] py-[6px] shadow-sm dark:border-white/10 dark:bg-[#0b0b0d] [&::-webkit-scrollbar]:hidden"
        style={
          {
            ["--round" as string]: "12px",
            ["--p-x" as string]: "8px",
            ["--p-y" as string]: "6px",
            ["--tab-count" as string]: tabs.length,
          } as React.CSSProperties
        }
      >
        {/* Active top/bottom lines */}
        <div
          className="pointer-events-none absolute left-[8px] top-0 z-0 h-full origin-left transition-transform duration-500 ease-[cubic-bezier(0.33,0.83,0.99,0.98)]"
          style={{
            width: `calc((100% - 16px) / ${tabs.length})`,
            transform: `translateX(${activeIndex * 100}%)`,
          }}
          aria-hidden="true"
        >
          <div className="absolute left-0 top-0 h-[2px] w-full rounded-b-[9999px] bg-black dark:bg-white" />
          <div className="absolute bottom-0 left-0 h-[2px] w-full rounded-t-[9999px] bg-black dark:bg-white" />
        </div>

        {/* Sliding background */}
        <div
          className="pointer-events-none absolute left-[8px] top-[10px] z-0 origin-left rounded-[calc(var(--round)-var(--p-y))] border border-zinc-200 bg-zinc-100 shadow-none transition-transform duration-500 ease-[cubic-bezier(0.33,0.83,0.99,0.98)] dark:border-white/10 dark:bg-white/[0.06]"
          style={{
            width: `calc((100% - 16px) / ${tabs.length})`,
            height: "calc(100% - 20px)",
            transform: `translateX(${previewIndex * 100}%)`,
          }}
          aria-hidden="true"
        />

        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => onChange(tab.value)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              onFocus={() => setHoveredIndex(index)}
              onBlur={() => setHoveredIndex(null)}
              className={`relative z-[2] flex flex-1 select-none items-center justify-center bg-transparent px-4 py-4 text-sm font-medium outline-none transition-colors duration-200 ${
                isActive
                  ? "text-black dark:text-white"
                  : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}