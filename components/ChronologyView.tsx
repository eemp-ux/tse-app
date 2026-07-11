"use client";

import { useMemo, useState } from "react";
import { formatDateTime } from "@/lib/format";
import type { ChronologyItem } from "@/lib/chronology";

const KIND_STYLES: Record<string, string> = {
  event: "border-neutral-200",
  document: "border-blue-200 bg-blue-50/40",
  change: "border-amber-200 bg-amber-50/40",
};

export function ChronologyView({ items }: { items: ChronologyItem[] }) {
  const [partyRole, setPartyRole] = useState("all");
  const [type, setType] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (partyRole !== "all" && item.partyRole !== partyRole) return false;
      if (type !== "all") {
        if (type === "document" && item.kind !== "document") return false;
        if (type === "change" && item.kind !== "change") return false;
        if (!["document", "change"].includes(type) && item.eventType !== type) return false;
      }
      const itemDate = new Date(item.date);
      if (startDate && itemDate < new Date(startDate)) return false;
      if (endDate && itemDate > new Date(endDate + "T23:59:59")) return false;
      return true;
    });
  }, [items, partyRole, type, startDate, endDate]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2 rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
        <select
          value={partyRole}
          onChange={(e) => setPartyRole(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All parties</option>
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="internal">Internal</option>
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All types</option>
          <option value="email">Email</option>
          <option value="meeting">Meeting</option>
          <option value="message">Message</option>
          <option value="note">Note</option>
          <option value="document">Bid Document</option>
          <option value="change">Requirement Change</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        <span className="self-center text-sm text-neutral-400">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm transition focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        />
        {(partyRole !== "all" || type !== "all" || startDate || endDate) && (
          <button
            onClick={() => {
              setPartyRole("all");
              setType("all");
              setStartDate("");
              setEndDate("");
            }}
            className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
          >
            Clear filters
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-neutral-500">No items match these filters.</p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className={`rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md ${KIND_STYLES[item.kind] ?? ""}`}
            >
              <div className="flex items-center justify-between gap-3 text-xs text-neutral-500">
                <span className="font-medium text-neutral-700">{item.title}</span>
                <span>{formatDateTime(item.date)}</span>
              </div>
              {item.detail && <p className="mt-1 text-sm text-neutral-800">{item.detail}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
