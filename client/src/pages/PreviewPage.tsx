import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { COLORS } from "@/lib/colors";
import type {
  DailyContent,
  AboveGroundContent,
  FactleContent,
  ThoughtExperimentContent,
  GamesContent,
  TriviaContent,
  RiddleContent,
  MicroHistoryContent,
  OnThisDayContent,
  WordOfTheDayContent,
  WikiSummaryContent,
} from "@shared/schema";

// ── Module config for preview cards ──

const MODULE_INFO: Record<string, { label: string; bgColor: string; labelColor: string }> = {
  aboveGround: { label: "ABOVE GROUND", bgColor: COLORS.ABOVE_GROUND.BACKGROUND, labelColor: COLORS.ABOVE_GROUND.LABEL },
  factle: { label: "FACTLE", bgColor: COLORS.FACTLE.BACKGROUND, labelColor: COLORS.FACTLE.LABEL },
  thoughtExperiment: { label: "THINKERS", bgColor: COLORS.THOUGHT_EXPERIMENT.BACKGROUND, labelColor: COLORS.THOUGHT_EXPERIMENT.LABEL },
  games: { label: "GAMES", bgColor: COLORS.GAMES.BACKGROUND, labelColor: COLORS.GAMES.LABEL },
  trivia: { label: "TRIVIA", bgColor: COLORS.TRIVIA.BACKGROUND, labelColor: COLORS.TRIVIA.LABEL },
  riddle: { label: "RIDDLE", bgColor: COLORS.RIDDLE.BACKGROUND, labelColor: COLORS.RIDDLE.LABEL },
  microHistory: { label: "MICRO HISTORY", bgColor: COLORS.MICRO_HISTORY.BACKGROUND, labelColor: COLORS.MICRO_HISTORY.LABEL },
  onThisDay: { label: "ON THIS DAY", bgColor: COLORS.ON_THIS_DAY.BACKGROUND, labelColor: COLORS.ON_THIS_DAY.LABEL },
  wordOfTheDay: { label: "WORD OF THE DAY", bgColor: COLORS.WORD_OF_THE_DAY.BACKGROUND, labelColor: "#c8bee6" },
  wikiSummary: { label: "WIKI SUMMARY", bgColor: COLORS.WIKI_SUMMARY.BACKGROUND, labelColor: COLORS.WIKI_SUMMARY.LABEL },
};

// ── Helpers ──

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ── Module-specific content renderers ──

function AboveGroundPreview({ content }: { content: AboveGroundContent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {content.items.map((item, i) => (
        <div key={i}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#000", lineHeight: 1.3 }}>{item.headline}</div>
          <div style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", marginTop: 3, lineHeight: 1.4 }}>
            {item.description.length > 120 ? item.description.slice(0, 120) + "..." : item.description}
          </div>
          <div style={{ fontSize: 10, color: "rgba(0,0,0,0.4)", marginTop: 2 }}>{item.source}</div>
        </div>
      ))}
    </div>
  );
}

function FactlePreview({ content }: { content: FactleContent }) {
  return <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", textAlign: "center", padding: "8px 0" }}>{content.fact}</div>;
}

function ThoughtExperimentPreview({ content }: { content: ThoughtExperimentContent }) {
  return <div style={{ fontSize: 12, color: "#000", lineHeight: 1.5 }}>{content.text.length > 200 ? content.text.slice(0, 200) + "..." : content.text}</div>;
}

function GamesPreview({ content }: { content: GamesContent }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {content.games.map((g, i) => (
        <span key={i} style={{ fontSize: 12, fontWeight: 600, color: "#000", background: "rgba(0,0,0,0.08)", borderRadius: 6, padding: "3px 8px" }}>{g.name}</span>
      ))}
    </div>
  );
}

function TriviaPreview({ content }: { content: TriviaContent }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#000", lineHeight: 1.4 }}>{content.question}</div>
      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", marginTop: 4 }}>A: {content.answer}</div>
    </div>
  );
}

function RiddlePreview({ content }: { content: RiddleContent }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#000", lineHeight: 1.4 }}>{content.riddle}</div>
      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.5)", marginTop: 4 }}>A: {content.answer}</div>
    </div>
  );
}

function MicroHistoryPreview({ content }: { content: MicroHistoryContent }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#000", lineHeight: 1.3 }}>{content.title}</div>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", marginTop: 4, lineHeight: 1.5 }}>
        {content.content.length > 180 ? content.content.slice(0, 180) + "..." : content.content}
      </div>
    </div>
  );
}

function OnThisDayPreview({ content }: { content: OnThisDayContent }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#000" }}>{content.year}</div>
      <div style={{ fontSize: 12, color: "rgba(0,0,0,0.7)", marginTop: 2, lineHeight: 1.4 }}>{content.event}</div>
    </div>
  );
}

function WordOfTheDayPreview({ content }: { content: WordOfTheDayContent }) {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 800, color: "#000" }}>{content.word}</div>
      <div style={{ fontSize: 10, color: "rgba(0,0,0,0.5)", marginTop: 1 }}>[{content.pronunciation}] {content.partOfSpeech}</div>
      <div style={{ fontSize: 11, color: "rgba(0,0,0,0.7)", marginTop: 4, lineHeight: 1.4 }}>{content.definition}</div>
    </div>
  );
}

function WikiSummaryPreview({ content }: { content: WikiSummaryContent }) {
  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.3 }}>{content.articleTitle}</div>
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4, lineHeight: 1.5 }}>
        {content.summary.length > 200 ? content.summary.slice(0, 200) + "..." : content.summary}
      </div>
    </div>
  );
}

// ── Preview Card ──

function PreviewCard({ moduleKey, content }: { moduleKey: string; content: any }) {
  const info = MODULE_INFO[moduleKey];
  if (!info) return null;

  const hasContent = content && Object.values(content).some((v: any) => {
    if (v === undefined || v === null || v === "") return false;
    if (Array.isArray(v)) return v.length > 0;
    return true;
  });

  return (
    <div style={{
      backgroundColor: info.bgColor,
      borderRadius: 16,
      padding: 14,
      minHeight: hasContent ? undefined : 60,
      opacity: hasContent ? 1 : 0.35,
    }}>
      <div style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
        color: info.labelColor,
        marginBottom: hasContent ? 8 : 0,
      }}>
        {info.label}
      </div>
      {hasContent && <ModulePreviewContent moduleKey={moduleKey} content={content} />}
      {!hasContent && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontStyle: "italic" }}>No content</div>}
    </div>
  );
}

function ModulePreviewContent({ moduleKey, content }: { moduleKey: string; content: any }) {
  switch (moduleKey) {
    case "aboveGround": return <AboveGroundPreview content={content} />;
    case "factle": return <FactlePreview content={content} />;
    case "thoughtExperiment": return <ThoughtExperimentPreview content={content} />;
    case "games": return <GamesPreview content={content} />;
    case "trivia": return <TriviaPreview content={content} />;
    case "riddle": return <RiddlePreview content={content} />;
    case "microHistory": return <MicroHistoryPreview content={content} />;
    case "onThisDay": return <OnThisDayPreview content={content} />;
    case "wordOfTheDay": return <WordOfTheDayPreview content={content} />;
    case "wikiSummary": return <WikiSummaryPreview content={content} />;
    default: return null;
  }
}

// ── Date Header ──

function PreviewDateHeader({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr + "T00:00:00");
  const month = date.toLocaleDateString("en-US", { month: "long" });
  const day = date.getDate();
  const year = date.getFullYear();

  return (
    <div style={{ padding: "0 14px", marginBottom: 8 }}>
      <div style={{
        fontSize: 48,
        fontWeight: 700,
        lineHeight: 1.1,
        color: COLORS.UTILITY.DATE_TEXT,
        fontFamily: "Satoshi-Bold, sans-serif",
      }}>
        {month} {getOrdinal(day)}, {year}
      </div>
    </div>
  );
}

// ── Preview Grid ──

function PreviewGrid({ content }: { content: DailyContent }) {
  const m = content.modules;
  const gap = 8;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap, padding: "0 14px" }}>
      <PreviewCard moduleKey="aboveGround" content={m.aboveGround} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
        <PreviewCard moduleKey="factle" content={m.factle} />
        <PreviewCard moduleKey="thoughtExperiment" content={m.thoughtExperiment} />
      </div>
      <PreviewCard moduleKey="games" content={m.games} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
        <PreviewCard moduleKey="trivia" content={m.trivia} />
        <PreviewCard moduleKey="riddle" content={m.riddle} />
      </div>
      <PreviewCard moduleKey="microHistory" content={m.microHistory} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
        <PreviewCard moduleKey="onThisDay" content={m.onThisDay} />
        <PreviewCard moduleKey="wordOfTheDay" content={m.wordOfTheDay} />
      </div>
      <PreviewCard moduleKey="wikiSummary" content={m.wikiSummary} />
    </div>
  );
}

// ── Main PreviewPage ──

export function PreviewPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;

  const { data: content, isLoading, error } = useQuery<DailyContent>({
    queryKey: ["preview", date],
    queryFn: async () => {
      const res = await fetch(`/api/content/date/${date}`);
      if (!res.ok) throw new Error("Not found");
      return res.json();
    },
    enabled: !!date,
  });

  if (!date) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.UTILITY.BACKGROUND_DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8b8b8e", fontSize: 14 }}>No date specified</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.UTILITY.BACKGROUND_DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#8b8b8e", fontSize: 14 }}>Loading preview...</div>
      </div>
    );
  }

  if (error || !content) {
    const dateObj = new Date(date + "T00:00:00");
    const displayDate = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    return (
      <div style={{ minHeight: "100vh", backgroundColor: COLORS.UTILITY.BACKGROUND_DARK, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 600, color: "#fff", marginBottom: 8 }}>No content for {displayDate}</div>
          <div style={{ fontSize: 13, color: "#8b8b8e" }}>Create and commit content in the planner first.</div>
        </div>
      </div>
    );
  }

  const dateObj = new Date(date + "T00:00:00");
  const displayDate = dateObj.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div style={{ minHeight: "100vh", backgroundColor: COLORS.UTILITY.BACKGROUND_DARK, display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
      {/* Status bar */}
      <div style={{ width: 428, maxWidth: "100%", marginBottom: 12, padding: "0 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 11, color: "#636366", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Preview: {displayDate}
        </div>
        <div style={{
          fontSize: 10,
          fontWeight: 600,
          padding: "3px 8px",
          borderRadius: 4,
          backgroundColor: content.status === "published" ? "rgba(48, 209, 88, 0.2)" : "rgba(255,255,255,0.1)",
          color: content.status === "published" ? "#30d158" : "#8b8b8e",
        }}>
          {content.status === "published" ? "Published" : "Draft"}
        </div>
      </div>

      {/* Phone frame */}
      <div style={{
        width: 428,
        maxWidth: "100%",
        backgroundColor: COLORS.UTILITY.BACKGROUND_DARK,
        borderRadius: 40,
        border: "2px solid #2c2c2e",
        paddingTop: 16,
        paddingBottom: 24,
        overflow: "hidden",
      }}>
        <PreviewDateHeader dateStr={date} />
        <div style={{ height: 8 }} />
        <PreviewGrid content={content} />
      </div>
    </div>
  );
}
