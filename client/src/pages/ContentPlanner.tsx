import { useState, useEffect, useRef, useCallback, type PointerEvent as ReactPointerEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Reorder, useDragControls } from "framer-motion";
import { GripVertical } from "lucide-react";
import { COLORS } from "@/lib/colors";
import {
  MODULE_TYPES,
  type DailyContent,
  type ModuleType,
  type ModuleReference,
  type AboveGroundContent,
  type FactleContent,
  type ThoughtExperimentContent,
  type GamesContent,
  type TriviaContent,
  type RiddleContent,
  type MicroHistoryContent,
  type OnThisDayContent,
  type WordOfTheDayContent,
  type WikiSummaryContent,
} from "@shared/schema";
import * as XLSX from "xlsx";
import JSZip from "jszip";

// ── Planner Module Registry ──

type PlannerModule = {
  key: string;
  label: string;
  bgColor: string;
  labelColor: string;
  editable: boolean;
  schemaKey?: ModuleType;
};

const PLANNER_MODULES: PlannerModule[] = [
  { key: "aboveGround", label: "ABOVE GROUND", bgColor: COLORS.ABOVE_GROUND.BACKGROUND, labelColor: COLORS.ABOVE_GROUND.LABEL, editable: true, schemaKey: "aboveGround" },
  { key: "factle", label: "FACTLE", bgColor: COLORS.FACTLE.BACKGROUND, labelColor: COLORS.FACTLE.LABEL, editable: true, schemaKey: "factle" },
  { key: "thoughtExperiment", label: "THINKERS", bgColor: COLORS.THOUGHT_EXPERIMENT.BACKGROUND, labelColor: COLORS.THOUGHT_EXPERIMENT.LABEL, editable: true, schemaKey: "thoughtExperiment" },
  { key: "games", label: "GAMES", bgColor: COLORS.GAMES.BACKGROUND, labelColor: COLORS.GAMES.LABEL, editable: true, schemaKey: "games" },
  { key: "trivia", label: "TRIVIA", bgColor: COLORS.TRIVIA.BACKGROUND, labelColor: COLORS.TRIVIA.LABEL, editable: true, schemaKey: "trivia" },
  { key: "riddle", label: "RIDDLE", bgColor: COLORS.RIDDLE.BACKGROUND, labelColor: COLORS.RIDDLE.LABEL, editable: true, schemaKey: "riddle" },
  { key: "microHistory", label: "MICRO HISTORY", bgColor: COLORS.MICRO_HISTORY.BACKGROUND, labelColor: COLORS.MICRO_HISTORY.LABEL, editable: true, schemaKey: "microHistory" },
  { key: "onThisDay", label: "ON THIS DAY", bgColor: COLORS.ON_THIS_DAY.BACKGROUND, labelColor: COLORS.ON_THIS_DAY.LABEL, editable: true, schemaKey: "onThisDay" },
  { key: "wordOfTheDay", label: "WORD OF THE DAY", bgColor: COLORS.WORD_OF_THE_DAY.BACKGROUND, labelColor: "#c8bee6", editable: true, schemaKey: "wordOfTheDay" },
  { key: "wikiSummary", label: "WIKI SUMMARY", bgColor: COLORS.WIKI_SUMMARY.BACKGROUND, labelColor: COLORS.WIKI_SUMMARY.LABEL, editable: true, schemaKey: "wikiSummary" },
];

function getModule(key: string): PlannerModule {
  return PLANNER_MODULES.find((m) => m.key === key)!;
}

// ── Helpers ──

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function isModuleCommitted(modules: DailyContent["modules"], key: ModuleType): boolean {
  const content = modules[key];
  if (!content) return false;
  return Object.values(content).some((v) => {
    if (v === undefined || v === null || v === "") return false;
    if (typeof v === "number") return true;
    if (Array.isArray(v))
      return (
        v.length > 0 &&
        v.some((item) => {
          if (typeof item === "string") return item !== "";
          if (typeof item === "object" && item !== null)
            return Object.values(item).some((iv) => iv !== "" && iv !== undefined);
          return true;
        })
      );
    return true;
  });
}

function getContentPreview(key: ModuleType, content: any): string | null {
  if (!content) return null;
  switch (key) {
    case "aboveGround": return content.items?.[0]?.headline || null;
    case "factle": return content.fact || null;
    case "thoughtExperiment": return content.text ? content.text.slice(0, 60) + "..." : null;
    case "games": return content.games?.map((g: any) => g.name).filter(Boolean).join(", ") || null;
    case "trivia": return content.question ? content.question.slice(0, 50) + "..." : null;
    case "riddle": return content.riddle ? content.riddle.slice(0, 50) + "..." : null;
    case "microHistory": return content.title || null;
    case "onThisDay": return content.event ? `${content.year}: ${content.event.slice(0, 40)}...` : null;
    case "wordOfTheDay": return content.word || null;
    case "wikiSummary": return content.articleTitle || null;
    default: return null;
  }
}

// ── Module Editors ──

type DraggableItem = { _id: string; headline: string; description: string; source: string };

function DraggableNewsItem({ item, index, total, onUpdate, onRemove }: {
  item: DraggableItem; index: number; total: number;
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={item} dragListener={false} dragControls={controls} className="list-none">
      <Card className="p-4 bg-[#232326] border-[#3a3a3c]">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <GripVertical
              className="w-4 h-4 text-[#636366] cursor-grab active:cursor-grabbing flex-shrink-0"
              onPointerDown={(e: ReactPointerEvent) => controls.start(e)}
            />
            <span className="text-sm text-[#8b8b8e]">Item {index + 1}</span>
          </div>
          {total > 1 && <Button variant="ghost" size="sm" onClick={() => onRemove(item._id)} className="text-red-400 hover:text-red-300">Remove</Button>}
        </div>
        <div className="space-y-3">
          <Input placeholder="Headline" value={item.headline} onChange={(e) => onUpdate(item._id, "headline", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
          <Textarea placeholder="Description" value={item.description} onChange={(e) => onUpdate(item._id, "description", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[80px]" />
          <Input placeholder="Source (e.g., OpenAI / X)" value={item.source} onChange={(e) => onUpdate(item._id, "source", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
        </div>
      </Card>
    </Reorder.Item>
  );
}

function AboveGroundEditor({ content, onChange }: { content: AboveGroundContent | undefined; onChange: (c: AboveGroundContent) => void }) {
  const nextId = useRef(0);
  const [draggableItems, setDraggableItems] = useState<DraggableItem[]>(() =>
    (content?.items || [{ headline: "", description: "", source: "" }]).map(item => ({ ...item, _id: String(nextId.current++) }))
  );

  // Sync when content changes externally (e.g. suggestion loaded)
  useEffect(() => {
    const incoming = content?.items || [{ headline: "", description: "", source: "" }];
    setDraggableItems(incoming.map((item, i) => ({ ...item, _id: String(nextId.current++) })));
  }, [content]);

  const strip = (items: DraggableItem[]) => items.map(({ _id, ...rest }) => rest);

  const handleReorder = (newOrder: DraggableItem[]) => {
    setDraggableItems(newOrder);
    onChange({ items: strip(newOrder) });
  };

  const updateItem = (id: string, field: string, value: string) => {
    const updated = draggableItems.map(item => item._id === id ? { ...item, [field]: value } : item);
    setDraggableItems(updated);
    onChange({ items: strip(updated) });
  };

  const removeItem = (id: string) => {
    if (draggableItems.length <= 1) return;
    const updated = draggableItems.filter(item => item._id !== id);
    setDraggableItems(updated);
    onChange({ items: strip(updated) });
  };

  const addItem = () => {
    const newItem: DraggableItem = { _id: String(nextId.current++), headline: "", description: "", source: "" };
    const updated = [...draggableItems, newItem];
    setDraggableItems(updated);
    onChange({ items: strip(updated) });
  };

  return (
    <div>
      <Reorder.Group axis="y" values={draggableItems} onReorder={handleReorder} className="flex flex-col gap-4">
        {draggableItems.map((item, i) => (
          <DraggableNewsItem key={item._id} item={item} index={i} total={draggableItems.length} onUpdate={updateItem} onRemove={removeItem} />
        ))}
      </Reorder.Group>
      <div className="mt-4">
        <Button onClick={addItem} variant="outline" className="w-full border-dashed">+ Add News Item</Button>
      </div>
    </div>
  );
}

function FactleEditor({ content, onChange }: { content: FactleContent | undefined; onChange: (c: FactleContent) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#8b8b8e]">Fun Fact</label>
      <Textarea placeholder="Enter an interesting fact..." value={content?.fact || ""} onChange={(e) => onChange({ fact: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[100px]" />
    </div>
  );
}

function ThoughtExperimentEditor({ content, onChange }: { content: ThoughtExperimentContent | undefined; onChange: (c: ThoughtExperimentContent) => void }) {
  return (
    <div className="space-y-2">
      <label className="text-sm text-[#8b8b8e]">Thinkers</label>
      <Textarea placeholder="Enter a thought-provoking scenario..." value={content?.text || ""} onChange={(e) => onChange({ text: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[150px]" />
    </div>
  );
}

function GamesEditor({ content, onChange }: { content: GamesContent | undefined; onChange: (c: GamesContent) => void }) {
  const games = content?.games || [{ name: "", description: "" }];
  const updateGame = (i: number, field: string, value: string) => { const n = [...games]; n[i] = { ...n[i], [field]: value }; onChange({ games: n }); };
  const addGame = () => onChange({ games: [...games, { name: "", description: "" }] });
  const removeGame = (i: number) => { if (games.length > 1) onChange({ games: games.filter((_, idx) => idx !== i) }); };

  return (
    <div className="space-y-4">
      {games.map((game, i) => (
        <Card key={i} className="p-4 bg-[#232326] border-[#3a3a3c]">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-[#8b8b8e]">Game {i + 1}</span>
            {games.length > 1 && <Button variant="ghost" size="sm" onClick={() => removeGame(i)} className="text-red-400 hover:text-red-300">Remove</Button>}
          </div>
          <div className="space-y-3">
            <Input placeholder="Game name" value={game.name} onChange={(e) => updateGame(i, "name", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
            <Textarea placeholder="Description (optional)" value={game.description || ""} onChange={(e) => updateGame(i, "description", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
          </div>
        </Card>
      ))}
      <Button onClick={addGame} variant="outline" className="w-full border-dashed">+ Add Game</Button>
    </div>
  );
}

function TriviaEditor({ content, onChange }: { content: TriviaContent | undefined; onChange: (c: TriviaContent) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Question</label>
        <Textarea placeholder="What is the only planet that spins clockwise?" value={content?.question || ""} onChange={(e) => onChange({ question: e.target.value, answer: content?.answer || "" })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[80px]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Answer</label>
        <Input placeholder="Venus" value={content?.answer || ""} onChange={(e) => onChange({ question: content?.question || "", answer: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
    </div>
  );
}

function RiddleEditor({ content, onChange }: { content: RiddleContent | undefined; onChange: (c: RiddleContent) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Riddle</label>
        <Textarea placeholder="I have cities, but no houses..." value={content?.riddle || ""} onChange={(e) => onChange({ riddle: e.target.value, answer: content?.answer || "" })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[100px]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Answer</label>
        <Input placeholder="A map" value={content?.answer || ""} onChange={(e) => onChange({ riddle: content?.riddle || "", answer: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
    </div>
  );
}

function MicroHistoryEditor({ content, onChange }: { content: MicroHistoryContent | undefined; onChange: (c: MicroHistoryContent) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Title</label>
        <Input placeholder="Why notebooks are usually lined" value={content?.title || ""} onChange={(e) => onChange({ title: e.target.value, content: content?.content || "" })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Content</label>
        <Textarea placeholder="The historical explanation..." value={content?.content || ""} onChange={(e) => onChange({ title: content?.title || "", content: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[100px]" />
      </div>
    </div>
  );
}

function OnThisDayEditor({ content, onChange }: { content: OnThisDayContent | undefined; onChange: (c: OnThisDayContent) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Year</label>
        <Input type="number" placeholder="2007" value={content?.year || ""} onChange={(e) => onChange({ year: parseInt(e.target.value) || 0, event: content?.event || "" })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Event</label>
        <Textarea placeholder="Apple announced the original iPhone." value={content?.event || ""} onChange={(e) => onChange({ year: content?.year || 0, event: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
    </div>
  );
}

function WordOfTheDayEditor({ content, onChange }: { content: WordOfTheDayContent | undefined; onChange: (c: WordOfTheDayContent) => void }) {
  const update = (field: keyof WordOfTheDayContent, value: string) => {
    onChange({ word: content?.word || "", pronunciation: content?.pronunciation || "", partOfSpeech: content?.partOfSpeech || "", definition: content?.definition || "", [field]: value });
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm text-[#8b8b8e]">Word</label>
          <Input placeholder="Inure" value={content?.word || ""} onChange={(e) => update("word", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-[#8b8b8e]">Pronunciation</label>
          <Input placeholder="IN-YOOR" value={content?.pronunciation || ""} onChange={(e) => update("pronunciation", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Part of Speech</label>
        <Input placeholder="VERB" value={content?.partOfSpeech || ""} onChange={(e) => update("partOfSpeech", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Definition</label>
        <Textarea placeholder="to accustom to hardship, difficulty, or pain" value={content?.definition || ""} onChange={(e) => update("definition", e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
    </div>
  );
}

function WikiSummaryEditor({ content, onChange }: { content: WikiSummaryContent | undefined; onChange: (c: WikiSummaryContent) => void }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Article Title</label>
        <Input placeholder="The Overview Effect" value={content?.articleTitle || ""} onChange={(e) => onChange({ articleTitle: e.target.value, summary: content?.summary || "" })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366]" />
      </div>
      <div className="space-y-2">
        <label className="text-sm text-[#8b8b8e]">Summary</label>
        <Textarea placeholder="A brief, engaging summary of the Wikipedia article..." value={content?.summary || ""} onChange={(e) => onChange({ articleTitle: content?.articleTitle || "", summary: e.target.value })} className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] min-h-[150px]" />
      </div>
    </div>
  );
}

function ModuleEditor({ moduleType, content, onChange }: { moduleType: ModuleType; content: any; onChange: (c: any) => void }) {
  switch (moduleType) {
    case "aboveGround": return <AboveGroundEditor content={content} onChange={onChange} />;
    case "factle": return <FactleEditor content={content} onChange={onChange} />;
    case "thoughtExperiment": return <ThoughtExperimentEditor content={content} onChange={onChange} />;
    case "games": return <GamesEditor content={content} onChange={onChange} />;
    case "trivia": return <TriviaEditor content={content} onChange={onChange} />;
    case "riddle": return <RiddleEditor content={content} onChange={onChange} />;
    case "microHistory": return <MicroHistoryEditor content={content} onChange={onChange} />;
    case "onThisDay": return <OnThisDayEditor content={content} onChange={onChange} />;
    case "wordOfTheDay": return <WordOfTheDayEditor content={content} onChange={onChange} />;
    case "wikiSummary": return <WikiSummaryEditor content={content} onChange={onChange} />;
    default: return <div className="text-[#8b8b8e]">Unknown module type</div>;
  }
}

// ── PlannerCard ──

function PlannerCard({ module, committed, preview, onClick, height }: { module: PlannerModule; committed: boolean; preview: string | null; onClick: () => void; height?: number }) {
  const isActive = module.editable && committed;
  const isClickable = module.editable;

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={`relative rounded-xl transition-all duration-200 flex flex-col justify-between overflow-hidden ${isClickable ? "cursor-pointer hover:brightness-110" : ""}`}
      style={{ backgroundColor: module.bgColor, padding: "10px 14px", filter: isActive ? "none" : "saturate(0.3)", opacity: isActive ? 1 : 0.6, height: height || 56 }}
    >
      <div className="text-[10px] font-bold tracking-[0.08em] uppercase" style={{ color: module.labelColor }}>{module.label}</div>
      <div className="flex-1 flex flex-col justify-end">
        {isActive && preview ? (
          <div className="text-[12px] font-bold text-black/80 leading-tight line-clamp-2">{preview}</div>
        ) : !module.editable ? (
          <div className="text-[11px] font-medium text-white/50 italic">Coming Soon</div>
        ) : (
          <div className="text-[11px] font-medium text-black/50">Tap to add content</div>
        )}
      </div>
    </div>
  );
}

// ── PlannerDateHeader ──

function PlannerDateHeader({ date }: { date: Date }) {
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();
  return (
    <header className="w-full">
      <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.1, color: COLORS.UTILITY.DATE_TEXT, fontFamily: "Satoshi-Bold, sans-serif" }}>
        {month} {getOrdinal(day)}, {year}
      </div>
    </header>
  );
}

// ── MockupGrid ──

function MockupGrid({ selectedContent, localDrafts, onCardClick }: { selectedContent: DailyContent; localDrafts: Record<string, any>; onCardClick: (key: string) => void }) {
  const modules = selectedContent.modules;
  const gap = 6;
  const h = 52;

  const cardProps = (key: string) => {
    const mod = getModule(key);
    const sk = mod.schemaKey;
    const committed = sk ? isModuleCommitted(modules, sk) : false;
    const preview = sk ? getContentPreview(sk, committed ? modules[sk] : null) : null;
    return { module: mod, committed, preview, onClick: () => onCardClick(key) };
  };

  return (
    <div className="w-full flex flex-col" style={{ gap }}>
      <PlannerCard {...cardProps("aboveGround")} height={h} />
      <div className="grid grid-cols-2" style={{ gap }}>
        <PlannerCard {...cardProps("factle")} height={h} />
        <PlannerCard {...cardProps("thoughtExperiment")} height={h} />
      </div>
      <PlannerCard {...cardProps("games")} height={h} />
      <div className="grid grid-cols-2" style={{ gap }}>
        <PlannerCard {...cardProps("trivia")} height={h} />
        <PlannerCard {...cardProps("wordOfTheDay")} height={h} />
      </div>
      <PlannerCard {...cardProps("microHistory")} height={h} />
      <div className="grid grid-cols-2" style={{ gap }}>
        <PlannerCard {...cardProps("onThisDay")} height={h} />
        <PlannerCard {...cardProps("riddle")} height={h} />
      </div>
      <PlannerCard {...cardProps("wikiSummary")} height={h} />
    </div>
  );
}

// ── Export Helpers ──

type ExportFormat = "xlsx" | "csv-zip";

const MODULE_SHEET_NAMES: Record<ModuleType, string> = {
  aboveGround: "Above Ground",
  factle: "Factle",
  thoughtExperiment: "Thinkers",
  games: "Games",
  trivia: "Trivia",
  riddle: "Riddle",
  microHistory: "Micro History",
  onThisDay: "On This Day",
  wordOfTheDay: "Word of the Day",
  wikiSummary: "Wiki Summary",
};

function buildModuleSheetData(contentList: DailyContent[], moduleKey: ModuleType): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  for (const day of contentList) {
    const content = day.modules[moduleKey];
    if (!content) continue;
    switch (moduleKey) {
      case "aboveGround": { const c = content as AboveGroundContent; for (const item of c.items || []) rows.push({ Date: day.date, Headline: item.headline, Description: item.description, Source: item.source }); break; }
      case "factle": { const c = content as FactleContent; if (c.fact) rows.push({ Date: day.date, Fact: c.fact }); break; }
      case "thoughtExperiment": { const c = content as ThoughtExperimentContent; if (c.text) rows.push({ Date: day.date, Text: c.text }); break; }
      case "games": { const c = content as GamesContent; for (const game of c.games || []) rows.push({ Date: day.date, "Game Name": game.name, Description: game.description || "" }); break; }
      case "trivia": { const c = content as TriviaContent; if (c.question) rows.push({ Date: day.date, Question: c.question, Answer: c.answer }); break; }
      case "riddle": { const c = content as RiddleContent; if (c.riddle) rows.push({ Date: day.date, Riddle: c.riddle, Answer: c.answer }); break; }
      case "microHistory": { const c = content as MicroHistoryContent; if (c.title || c.content) rows.push({ Date: day.date, Title: c.title, Content: c.content }); break; }
      case "onThisDay": { const c = content as OnThisDayContent; if (c.event) rows.push({ Date: day.date, Year: String(c.year), Event: c.event }); break; }
      case "wordOfTheDay": { const c = content as WordOfTheDayContent; if (c.word) rows.push({ Date: day.date, Word: c.word, Pronunciation: c.pronunciation, "Part of Speech": c.partOfSpeech, Definition: c.definition }); break; }
      case "wikiSummary": { const c = content as WikiSummaryContent; if (c.articleTitle) rows.push({ Date: day.date, "Article Title": c.articleTitle, Summary: c.summary }); break; }
    }
  }
  return rows;
}

async function exportData(contentList: DailyContent[], format: ExportFormat) {
  if (format === "xlsx") {
    const wb = XLSX.utils.book_new();
    for (const mk of MODULE_TYPES) { const d = buildModuleSheetData(contentList, mk); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(d.length > 0 ? d : [{}]), MODULE_SHEET_NAMES[mk]); }
    XLSX.writeFile(wb, "underground-content.xlsx");
  } else {
    const zip = new JSZip();
    for (const mk of MODULE_TYPES) {
      const d = buildModuleSheetData(contentList, mk);
      if (d.length === 0) continue;
      const h = Object.keys(d[0]);
      zip.file(`${MODULE_SHEET_NAMES[mk]}.csv`, [h.join(","), ...d.map((r) => h.map((k) => `"${(r[k] || "").replace(/"/g, '""')}"`).join(","))].join("\n"));
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "underground-content.zip"; a.click();
    URL.revokeObjectURL(url);
  }
}

// ── Default Content Generation Guidelines ──

const DEFAULT_GUIDELINES: Record<string, string> = {
  aboveGround: `ABOVE GROUND — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: 5 news items per day, each with headline + two description paragraphs + source

TONE: Conversational but informed. Not formal news copy — more like how a sharp friend would explain something over coffee. Can be wry, observational, or slightly irreverent. Never clickbait.

HEADLINES: Short, declarative, lowercase-feeling even if capitalized. Should feel like a text message from someone who reads a lot. Max ~10 words.
  Good: "OpenAI's Sora video model finally dropped"
  Bad: "BREAKING: Revolutionary AI Video Technology Launches"

DESCRIPTIONS: Two paragraphs per item.
  - Paragraph 1: What happened and why it matters, in 2-3 sentences.
  - Paragraph 2: The cultural reaction, second-order effects, or a wry observation. Slightly more opinionated.

SOURCE: Publication or platform, separated by " / " (e.g., "The Verge / X")

TOPICS: Tech, culture, media, internet, science, design, music. Things the user would actually talk about. No sports scores, no stock tickers, no weather. Think: what would trend on a smarter version of Twitter.

AVOID: Sensationalism, culture war framing, death/tragedy as entertainment, corporate PR rewrites.`,

  factle: `FACTLE — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One fun fact, max 6 words

TONE: Surprising, delightful, makes you want to tell someone. The kind of fact that makes you pause mid-sip.

CONSTRAINTS:
  - Must fit on two lines inside a bottle cap graphic (~6 words max)
  - Should be verifiable and true
  - Should provoke a "wait, really?" reaction

GOOD EXAMPLES:
  "Sharks are older than trees"
  "Honey never expires"
  "Octopuses have three hearts"
  "Bananas are technically berries"

BAD EXAMPLES (too long or boring):
  "The average person walks about 100,000 miles in their lifetime"
  "Water freezes at 32 degrees Fahrenheit"

CATEGORIES TO DRAW FROM: Natural world, history, human body, space, food science, animal kingdom, language origins.`,

  thoughtExperiment: `THINKERS — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One scenario/question, 2-4 sentences

TONE: Quietly mind-bending. Not academic philosophy — more like a late-night conversation that makes you stare at the ceiling. Accessible, vivid, personal.

STRUCTURE: "Imagine..." or a scenario setup, followed by a question that has no clean answer. The question should linger.

GOOD EXAMPLE:
  "Imagine a world where every object slowly changes shape when no one is looking, but returns to normal the moment it's observed. Nothing ever breaks or malfunctions — it's simply different when unseen. Would the unseen version of the world feel less real, or more honest?"

THEMES: Perception, identity, time, memory, consciousness, the nature of reality, what it means to observe. Not trolley problems. Not "would you rather." Genuine wonder.

AVOID: Anything with a clear right answer. Anything that feels like a school exercise. Anything dark or dystopian — this should feel expansive, not anxious.`,

  games: `GAMES — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NOTE: Games are hardcoded interactive modules (Ski, Snake, Flappy Bird). Content generation is not applicable — the games themselves are the content.

If new games are added in the future, they should be:
  - Playable in under 60 seconds
  - Simple enough to understand without instructions
  - Pixel-art aesthetic consistent with current games
  - Touch/swipe-friendly for mobile`,

  trivia: `TRIVIA — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One question + one answer (short, factual)

TONE: The kind of question you'd ask at a bar trivia night. Fun, not pedantic. The answer should feel satisfying to learn.

QUESTION STYLE: Specific and answerable. Not vague. Should have one clear, correct answer.
  Good: "What year did the first iPhone launch?"
  Bad: "What is the most important invention?"

ANSWER: Short — ideally 1-3 words. The brevity is part of the reveal satisfaction.

DIFFICULTY: Medium. Not so easy it's boring, not so hard it's frustrating. The user should feel smart 60% of the time.

TOPICS: Tech, pop culture, history, science, geography, music, film. Lean toward things the user's generation cares about.`,

  riddle: `RIDDLE — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: One riddle + one answer

TONE: Classic riddle structure — poetic, metaphorical, "I am" or "I have" format. Should feel timeless, not gimmicky.

CONSTRAINTS:
  - The riddle should be solvable but not obvious
  - Answer should be a single word or short phrase
  - Must fit comfortably in a quarter card (~25 words max for the riddle)

GOOD EXAMPLE:
  Riddle: "I speak without a mouth and hear without ears. I have no body, but come alive with wind. What am I?"
  Answer: "An echo"

AVOID: Puns, jokes disguised as riddles, anything that requires specialized knowledge. The answer should make the reader go "oh, of course."`,

  microHistory: `MICRO HISTORY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Title (short, curious) + body text (2-3 paragraphs)

TONE: Conversational explainer. Like a museum placard written by someone who actually finds it interesting. Not dry, not dumbed down. Clear enough for a 15-year-old, interesting enough for a 40-year-old.

TITLE: Should be a "why" or "how" question, or a surprising declarative statement.
  Good: "Why notebooks are usually lined"
  Good: "How the handshake became a greeting"
  Bad: "The History of Lined Paper" (too textbook)

BODY: Start with the surprising core fact, then expand with context and origin story. End with something that connects it to the present day or to the reader's experience.

LENGTH: ~150-250 words expanded. The collapsed preview shows the title + first ~2 lines.

TOPICS: Everyday objects, common customs, design decisions, language origins, foods, gestures. Things the user encounters daily but never thought to question.`,

  onThisDay: `ON THIS DAY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Year (number) + event description (one sentence)

TONE: Factual but not dry. The event should feel notable and interesting.

CONSTRAINTS:
  - Must be a real historical event that occurred on today's calendar date
  - The year should be specific and accurate
  - Description should be one clear, complete sentence
  - Max ~15 words for the description (it's a quarter card)

GOOD EXAMPLES:
  2007: "Apple announced the original iPhone."
  1969: "Apollo 11 launched from Kennedy Space Center."

TOPICS: Tech milestones, cultural moments, scientific breakthroughs, notable firsts. Lean toward things that feel relevant or resonant to a modern audience. Skip wars and political elections unless truly iconic.`,

  wordOfTheDay: `WORD OF THE DAY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Word + pronunciation + part of speech + definition

TONE: The word should feel like a small gift — something the user didn't know they needed. Not obscure for the sake of obscurity. Should be usable in a real sentence.

WORD SELECTION:
  - Uncommon but not archaic. The user should be able to use it this week.
  - Should sound good when said aloud
  - Bonus if it describes a feeling or experience that's hard to articulate otherwise

GOOD EXAMPLES:
  "Inure" [IN-YOOR] VERB — to accustom to hardship, difficulty, or pain
  "Sonder" [SON-der] NOUN — the realization that each passerby has a life as vivid as your own
  "Petrichor" [PET-ri-kor] NOUN — the pleasant smell of earth after rain

PRONUNCIATION: Uppercase, syllable-separated with hyphens, in brackets.
PART OF SPEECH: Uppercase (VERB, NOUN, ADJECTIVE, ADVERB)
DEFINITION: Lowercase, concise, one line. No "used to describe" filler — just the meaning.`,

  wikiSummary: `WIKI SUMMARY — Content Generation Rules
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORMAT: Article title + summary paragraph (3-5 sentences)

TONE: Like a friend explaining something fascinating they just read on Wikipedia. Clear, engaging, slightly amazed. Not encyclopedic — distilled.

ARTICLE SELECTION:
  - Obscure but genuinely interesting Wikipedia articles
  - Topics the user probably hasn't thought to search for
  - Things that connect to everyday life in unexpected ways
  - Bonus for articles with great "did you know" potential

GOOD EXAMPLES:
  Title: "The Overview Effect"
  Summary: "Astronauts report a profound cognitive shift when they see Earth from space — a sudden, overwhelming sense that national borders are imaginary and all life is interconnected. The experience is so consistent across astronauts that it has its own name. Some describe it as the most transformative moment of their lives."

  Title: "Phantom Time Hypothesis"
  Summary: "A fringe theory claims that 297 years of history were fabricated — that the early Middle Ages (614-911 AD) never happened, and we're actually living in the 1700s. The evidence is thin, but the reasoning is entertainingly specific."

AVOID: Articles about wars, diseases, or anything depressing. Celebrity bios. Anything too niche or academic. The goal is delight and wonder, not homework.

LENGTH: Summary should be 3-5 sentences. Enough to satisfy curiosity, short enough to read in 15 seconds.`,
};

// ── References Panel ──

function ReferencesPanel() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [localRules, setLocalRules] = useState<string | null>(null);

  const { data: references = [] } = useQuery<ModuleReference[]>({
    queryKey: ["references"],
    queryFn: async () => {
      const res = await fetch("/api/references");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const upsertMutation = useMutation({
    mutationFn: async ({ moduleKey, urls, rules }: { moduleKey: string; urls?: ModuleReference["urls"]; rules?: string }) => {
      const res = await fetch(`/api/references/${moduleKey}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls, rules }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["references"] });
    },
  });

  // Reset local rules when switching modules
  const handleSelectModule = (key: string) => {
    setSelectedModule(key);
    setLocalRules(null);
    setNewUrl("");
    setNewLabel("");
  };

  const getRef = (key: string): ModuleReference | undefined =>
    references.find((r) => r.moduleKey === key);

  const handleAddUrl = (moduleKey: string) => {
    if (!newUrl.trim()) return;
    const existing = getRef(moduleKey);
    const urls = [...(existing?.urls || []), { url: newUrl.trim(), label: newLabel.trim() || undefined, addedAt: new Date().toISOString() }];
    upsertMutation.mutate({ moduleKey, urls }, {
      onSuccess: () => {
        setNewUrl("");
        setNewLabel("");
        toast({ title: "URL added", description: "Reference saved" });
      },
    });
  };

  const handleRemoveUrl = (moduleKey: string, index: number) => {
    const existing = getRef(moduleKey);
    if (!existing) return;
    const urls = existing.urls.filter((_, i) => i !== index);
    upsertMutation.mutate({ moduleKey, urls });
  };

  const handleSaveRules = (moduleKey: string, rules: string) => {
    upsertMutation.mutate({ moduleKey, rules }, {
      onSuccess: () => {
        toast({ title: "Guidelines saved", description: `${getModule(moduleKey).label} rules updated` });
      },
    });
  };

  const selectedMod = selectedModule ? getModule(selectedModule) : null;
  const selectedRef = selectedModule ? getRef(selectedModule) : undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Module list */}
      <div className="lg:col-span-1">
        <Card className="bg-[#1c1c1e] border-[#2c2c2e]">
          <CardContent className="p-5">
            <div className="mb-4">
              <span className="text-white font-semibold text-sm">Modules</span>
              <p className="text-[#636366] text-xs mt-1">Add URLs and rules for content generation</p>
            </div>
            <div className="space-y-1.5">
              {PLANNER_MODULES.map((mod) => {
                const ref = getRef(mod.key);
                const urlCount = ref?.urls?.length || 0;
                const hasRules = !!(ref?.rules || DEFAULT_GUIDELINES[mod.key]);
                const isSelected = selectedModule === mod.key;

                return (
                  <button
                    key={mod.key}
                    onClick={() => handleSelectModule(mod.key)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-[#2c2c2e] ring-1 ring-[#48484a]"
                        : "hover:bg-[#232326]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-3 h-3 rounded-sm flex-shrink-0"
                        style={{ backgroundColor: mod.bgColor }}
                      />
                      <span className="text-white text-sm font-medium">{mod.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {urlCount > 0 && (
                        <span className="text-[10px] text-[#8b8b8e] bg-[#2c2c2e] px-1.5 py-0.5 rounded">
                          {urlCount} URL{urlCount !== 1 ? "s" : ""}
                        </span>
                      )}
                      {hasRules && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="mt-4 pt-4 border-t border-[#2c2c2e]">
              <div className="flex items-center gap-2.5 text-xs text-[#8b8b8e]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#30d158]" />
                <span>Has generation rules</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reference editor */}
      <div className="lg:col-span-2">
        <Card className="bg-[#1c1c1e] border-[#2c2c2e]">
          <CardContent className="p-6">
            {selectedMod ? (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: selectedMod.bgColor }}
                  />
                  <h2 className="text-lg font-semibold" style={{ color: selectedMod.bgColor }}>
                    {selectedMod.label}
                  </h2>
                </div>

                {/* URLs section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Reference URLs</h3>
                    <span className="text-xs text-[#636366]">
                      Add links for content research and inspiration
                    </span>
                  </div>

                  {/* Existing URLs */}
                  {selectedRef?.urls && selectedRef.urls.length > 0 && (
                    <div className="space-y-2">
                      {selectedRef.urls.map((u, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-[#232326] rounded-lg px-3 py-2.5 group"
                        >
                          <div className="flex-1 min-w-0">
                            {u.label && (
                              <div className="text-xs text-[#a0a0a3] font-medium mb-0.5">{u.label}</div>
                            )}
                            <div className="text-sm text-[#6e9eff] truncate">{u.url}</div>
                          </div>
                          <button
                            onClick={() => handleRemoveUrl(selectedModule!, i)}
                            className="text-[#636366] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-lg leading-none"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add URL form */}
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="https://example.com/article"
                        value={newUrl}
                        onChange={(e) => setNewUrl(e.target.value)}
                        className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAddUrl(selectedModule!)}
                      />
                      <Input
                        placeholder="Label (optional)"
                        value={newLabel}
                        onChange={(e) => setNewLabel(e.target.value)}
                        className="bg-[#2c2c2e] border-[#3a3a3c] text-white placeholder:text-[#636366] text-sm"
                        onKeyDown={(e) => e.key === "Enter" && handleAddUrl(selectedModule!)}
                      />
                    </div>
                    <Button
                      onClick={() => handleAddUrl(selectedModule!)}
                      disabled={!newUrl.trim()}
                      size="sm"
                      className="self-start mt-0.5"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {/* Rules section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-white">Content Generation Rules</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-[#8b8b8e] hover:text-white h-7"
                      onClick={() => {
                        const defaults = DEFAULT_GUIDELINES[selectedModule!];
                        if (defaults) {
                          handleSaveRules(selectedModule!, defaults);
                        }
                      }}
                    >
                      Reset to defaults
                    </Button>
                  </div>
                  <Textarea
                    value={localRules ?? selectedRef?.rules ?? DEFAULT_GUIDELINES[selectedModule!] ?? ""}
                    onChange={(e) => setLocalRules(e.target.value)}
                    onBlur={(e) => handleSaveRules(selectedModule!, e.target.value)}
                    className="bg-[#232326] border-[#3a3a3c] text-[#c8c8cb] placeholder:text-[#636366] font-mono text-xs leading-relaxed min-h-[400px] resize-y"
                    placeholder="Write content generation guidelines for this module..."
                  />
                  <p className="text-[10px] text-[#636366]">
                    Rules auto-save when you click away. Edit freely — these guide how content suggestions are generated for this module.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-2xl mb-3 opacity-50">&#9776;</div>
                <h3 className="text-lg font-semibold text-white mb-2">Select a module</h3>
                <p className="text-[#8b8b8e] text-sm max-w-sm mx-auto">
                  Choose a module from the list to add reference URLs and edit content generation rules.
                  Each module has default guidelines you can customize.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Main ContentPlanner ──

export function ContentPlanner() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"content" | "references">("content");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [editingModule, setEditingModule] = useState<string | null>(null);
  const [localDrafts, setLocalDrafts] = useState<Record<string, any>>({});
  const [showExport, setShowExport] = useState(false);
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [exportFormat, setExportFormat] = useState<ExportFormat>("xlsx");
  const exportRef = useRef<HTMLDivElement>(null);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchSuggestion = useCallback(async (moduleKey: string, date: string, index: number) => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/suggest/${moduleKey}?date=${date}&index=${index}`);
      if (!res.ok) return;
      const { suggestion } = await res.json();
      setLocalDrafts((prev) => ({ ...prev, [moduleKey]: suggestion }));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  useEffect(() => {
    if (!showExport) return;
    const handler = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showExport]);

  useEffect(() => { setLocalDrafts({}); setEditingModule(null); }, [selectedDate]);

  const startDate = formatDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
  const endDate = formatDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 2, 0));

  const { data: contentList = [], isLoading } = useQuery<DailyContent[]>({
    queryKey: ["content", startDate, endDate],
    queryFn: async () => { const res = await fetch(`/api/content/range?start=${startDate}&end=${endDate}`); if (!res.ok) throw new Error("Failed"); return res.json(); },
  });

  const selectedDateStr = formatDate(selectedDate);
  const selectedContent = contentList.find((c) => c.date === selectedDateStr);

  const createMutation = useMutation({
    mutationFn: async (date: string) => { const res = await fetch("/api/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, status: "draft", modules: {} }) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); toast({ title: "Content created", description: "Draft created for this date" }); },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, modules }: { id: string; modules: DailyContent["modules"] }) => { const res = await fetch(`/api/content/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ modules }) }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); },
  });

  const publishMutation = useMutation({
    mutationFn: async (id: string) => { const res = await fetch(`/api/content/${id}/publish`, { method: "POST" }); if (!res.ok) throw new Error("Failed"); return res.json(); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["content"] }); toast({ title: "Published", description: "Content is now live!" }); },
  });

  const handleCardClick = (moduleKey: string) => {
    const mod = getModule(moduleKey);
    if (!mod.editable || !mod.schemaKey) return;

    const existingContent = selectedContent?.modules[mod.schemaKey!];
    const hasContent = existingContent && isModuleCommitted(selectedContent!.modules, mod.schemaKey!);

    if (hasContent) {
      // Module already has content — load it into drafts for editing
      setLocalDrafts((prev) => ({ ...prev, [mod.schemaKey!]: existingContent }));
    } else {
      // Module is empty — auto-fetch a suggestion
      setSuggestionIndex(0);
      fetchSuggestion(mod.schemaKey!, selectedDateStr, 0);
    }
    setEditingModule(moduleKey);
  };

  const handleCommitModule = (schemaKey: ModuleType) => {
    if (!selectedContent) return;
    const draft = localDrafts[schemaKey];
    if (!draft) return;
    updateMutation.mutate(
      { id: selectedContent.id, modules: { ...selectedContent.modules, [schemaKey]: draft } },
      {
        onSuccess: () => {
          setLocalDrafts((prev) => { const n = { ...prev }; delete n[schemaKey]; return n; });
          setEditingModule(null);
          toast({ title: "Committed", description: `${MODULE_SHEET_NAMES[schemaKey]} saved` });
        },
      }
    );
  };

  const closeEditor = () => {
    if (editingModule) {
      const mod = getModule(editingModule);
      if (mod.schemaKey) setLocalDrafts((prev) => { const n = { ...prev }; delete n[mod.schemaKey!]; return n; });
    }
    setEditingModule(null);
  };

  const editingMod = editingModule ? getModule(editingModule) : null;
  const datesWithContent = contentList.map((c) => new Date(c.date + "T00:00:00"));
  const publishedDates = contentList.filter((c) => c.status === "published").map((c) => new Date(c.date + "T00:00:00"));
  const committedCount = selectedContent ? MODULE_TYPES.filter((k) => isModuleCommitted(selectedContent.modules, k)).length : 0;

  const handleDiceRoll = () => {
    if (!editingModule || !editingMod?.schemaKey) return;
    const nextIndex = suggestionIndex + 1;
    setSuggestionIndex(nextIndex);
    fetchSuggestion(editingMod.schemaKey, selectedDateStr, nextIndex);
  };

  return (
    <div className="dark bg-[#111113] min-h-screen pt-20 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("content")}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === "content"
                  ? "text-white border-white"
                  : "text-[#636366] border-transparent hover:text-[#a0a0a3]"
              }`}
            >
              Content
            </button>
            <button
              onClick={() => setActiveTab("references")}
              className={`text-sm font-medium pb-1 border-b-2 transition-colors ${
                activeTab === "references"
                  ? "text-white border-white"
                  : "text-[#636366] border-transparent hover:text-[#a0a0a3]"
              }`}
            >
              References
            </button>
          </div>
          <div className="relative" ref={exportRef}>
            {activeTab === "content" && (
              <Button variant="outline" size="sm" onClick={() => setShowExport(!showExport)} className="border-[#333] text-[#a0a0a3] hover:text-white hover:border-[#555] text-xs">Export</Button>
            )}
            {showExport && (
              <div className="absolute right-0 top-full mt-2 z-50 w-72 bg-[#1c1c1e] border border-[#2c2c2e] rounded-xl p-4 shadow-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#8b8b8e] uppercase tracking-wide font-medium">Start</label>
                    <Input type="date" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white text-xs h-8" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] text-[#8b8b8e] uppercase tracking-wide font-medium">End</label>
                    <Input type="date" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} className="bg-[#2c2c2e] border-[#3a3a3c] text-white text-xs h-8" />
                  </div>
                </div>
                <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as ExportFormat)}>
                  <SelectTrigger className="bg-[#2c2c2e] border-[#3a3a3c] text-white text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-[#2c2c2e] border-[#3a3a3c]">
                    <SelectItem value="xlsx" className="text-white text-xs">Excel (.xlsx)</SelectItem>
                    <SelectItem value="csv-zip" className="text-white text-xs">CSV (.zip)</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setShowExport(false)} className="flex-1 text-xs h-7 text-[#8b8b8e] hover:text-white">Cancel</Button>
                  <Button size="sm" onClick={async () => { if (!exportStartDate || !exportEndDate) return; const res = await fetch(`/api/content/range?start=${exportStartDate}&end=${exportEndDate}`); if (res.ok) { await exportData(await res.json(), exportFormat); } setShowExport(false); }} disabled={!exportStartDate || !exportEndDate} className="flex-1 text-xs h-7">Download</Button>
                </div>
              </div>
            )}
          </div>
        </header>

        {activeTab === "references" ? (
          <ReferencesPanel />
        ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-[#1c1c1e] border-[#2c2c2e]">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-white font-semibold text-sm">Select Date</span>
                  <div className="flex gap-1">
                    <Button variant={viewMode === "calendar" ? "default" : "ghost"} size="sm" className="text-xs h-7" onClick={() => setViewMode("calendar")}>Calendar</Button>
                    <Button variant={viewMode === "list" ? "default" : "ghost"} size="sm" className="text-xs h-7" onClick={() => setViewMode("list")}>List</Button>
                  </div>
                </div>

                {viewMode === "calendar" ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    className="rounded-md border-0"
                    modifiers={{ hasContent: datesWithContent, published: publishedDates }}
                    modifiersStyles={{ hasContent: { backgroundColor: "#3a3a3c", borderRadius: "50%" }, published: { backgroundColor: "rgba(48, 209, 88, 0.25)", borderRadius: "50%" } }}
                  />
                ) : (
                  <div className="space-y-2 max-h-[400px] overflow-y-auto">
                    {contentList.map((content) => (
                      <button key={content.id} onClick={() => setSelectedDate(new Date(content.date + "T00:00:00"))} className={`w-full text-left p-3 rounded-lg transition-colors ${content.date === selectedDateStr ? "bg-[#2c2c2e] ring-1 ring-[#48484a]" : "bg-[#1c1c1e] hover:bg-[#2c2c2e]"}`}>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-medium text-sm">{formatDisplayDate(content.date)}</span>
                          <Badge variant={content.status === "published" ? "default" : "secondary"} className="text-[10px]">{content.status}</Badge>
                        </div>
                        <div className="flex gap-1 mt-2 flex-wrap">
                          {Object.keys(content.modules).map((mt) => <div key={mt} className="w-2 h-2 rounded-full" style={{ backgroundColor: getModule(mt)?.bgColor || "#666" }} />)}
                        </div>
                      </button>
                    ))}
                    {contentList.length === 0 && <p className="text-[#8b8b8e] text-center py-4 text-sm">No content yet. Select a date to create.</p>}
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-[#2c2c2e]">
                  <div className="flex items-center gap-2.5 text-xs text-[#8b8b8e] mb-2"><div className="w-2.5 h-2.5 rounded-full bg-[#48484a]" /><span>Has content</span></div>
                  <div className="flex items-center gap-2.5 text-xs text-[#8b8b8e]"><div className="w-2.5 h-2.5 rounded-full bg-[#30d158]" /><span>Published</span></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <Card className="bg-[#1c1c1e] border-[#2c2c2e]">
              <CardContent className="p-6">
                {isLoading ? (
                  <div className="text-center py-12 text-[#8b8b8e]">Loading...</div>
                ) : selectedContent ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant={selectedContent.status === "published" ? "default" : "secondary"}>{selectedContent.status === "published" ? "Published" : "Draft"}</Badge>
                        <span className="text-[#8b8b8e] text-sm">{committedCount}/{MODULE_TYPES.length} modules committed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`/preview/${selectedDateStr}`, "_blank")}
                          disabled={committedCount === 0}
                          className="border-[#3a3a3c] text-[#a0a0a3] hover:text-white hover:border-[#555]"
                        >
                          Preview
                        </Button>
                        <Button onClick={() => selectedContent && publishMutation.mutate(selectedContent.id)} disabled={selectedContent.status === "published" || publishMutation.isPending || committedCount === 0} size="sm">
                          {selectedContent.status === "published" ? "Published" : publishMutation.isPending ? "Publishing..." : "Publish Day"}
                        </Button>
                      </div>
                    </div>
                    <div className="rounded-xl p-4" style={{ backgroundColor: COLORS.UTILITY.BACKGROUND_DARK }}>
                      <PlannerDateHeader date={selectedDate} />
                      <div style={{ height: 8 }} />
                      <MockupGrid selectedContent={selectedContent} localDrafts={localDrafts} onCardClick={handleCardClick} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <h3 className="text-xl font-semibold text-white mb-2">{formatDisplayDate(selectedDateStr)}</h3>
                    <p className="text-[#8b8b8e] mb-6 text-sm">No content planned for this date yet.</p>
                    <Button onClick={() => createMutation.mutate(selectedDateStr)} disabled={createMutation.isPending}>{createMutation.isPending ? "Creating..." : "Create Content for This Date"}</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>

      {/* Custom modal overlay — plain fixed div, no Radix Dialog */}
      {editingModule && editingMod?.schemaKey && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={closeEditor} />
          <div className="relative z-10 bg-[#2a2a2c] border border-[#3a3a3c] rounded-2xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-lg font-semibold" style={{ color: editingMod.bgColor }}>{editingMod.label}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDiceRoll}
                  disabled={isGenerating}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[#a0a0a3] hover:text-white hover:bg-[#3a3a3c] transition-colors disabled:opacity-40"
                  title="Generate new suggestion"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isGenerating ? "animate-spin" : ""}>
                    <rect x="2" y="2" width="20" height="20" rx="3" />
                    <circle cx="8" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="8" r="1.5" fill="currentColor" />
                    <circle cx="8" cy="16" r="1.5" fill="currentColor" />
                    <circle cx="16" cy="16" r="1.5" fill="currentColor" />
                    <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                  </svg>
                  <span className="text-xs font-medium">{isGenerating ? "..." : "Reroll"}</span>
                </button>
                <button onClick={closeEditor} className="text-[#a0a0a3] hover:text-white text-2xl leading-none p-1">&times;</button>
              </div>
            </div>
            <div className="p-6">
              <ModuleEditor
                moduleType={editingMod.schemaKey}
                content={localDrafts[editingMod.schemaKey] ?? selectedContent?.modules[editingMod.schemaKey]}
                onChange={(content) => setLocalDrafts((prev) => ({ ...prev, [editingMod!.schemaKey!]: content }))}
              />
            </div>
            <div className="flex justify-end gap-3 p-6 pt-0">
              <Button variant="outline" onClick={closeEditor} className="border-[#3a3a3c] text-[#a0a0a3] hover:text-white">Cancel</Button>
              <Button onClick={() => handleCommitModule(editingMod.schemaKey!)} disabled={updateMutation.isPending} style={{ backgroundColor: editingMod.bgColor, color: "#000" }}>
                {updateMutation.isPending ? "Saving..." : "Commit Module"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
