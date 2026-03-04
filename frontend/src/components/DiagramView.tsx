import { useCallback, useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Toolbar,
  Typography,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import FitScreenIcon from "@mui/icons-material/FitScreen";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useTranslation } from "react-i18next";
import type { ThemeConfig } from "../config/themes";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { formatParseError } from "../utils/formatParseError";

const CONTAINER_ID = "mermaid-container";
const MIN_SCALE = 0.25;
const MAX_SCALE = 10;
const WHEEL_ZOOM_STEP = 0.1;
const BUTTON_ZOOM_STEP = 0.25;
const DIAGRAM_SCALE_KEY = "mmdGenerator.diagramScale";

function loadDiagramScale(): number {
  try {
    const v = localStorage.getItem(DIAGRAM_SCALE_KEY);
    if (v == null) return 1;
    const n = Number(v);
    if (!Number.isFinite(n)) return 1;
    return Math.min(MAX_SCALE, Math.max(MIN_SCALE, n));
  } catch {
    return 1;
  }
}

interface DiagramViewProps {
  mmdCode: string;
  themeConfig: ThemeConfig;
  darkMode: boolean;
  onParseError?: (message: string, line?: number) => void;
}

function parseLineFromError(message: string): number | undefined {
  const m = message.match(/(?:line|Line)\s+(\d+)/i) ?? message.match(/(\d+)\s*:/);
  return m ? parseInt(m[1], 10) : undefined;
}

export function DiagramView({ mmdCode, themeConfig, darkMode, onParseError }: DiagramViewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const runIdRef = useRef(0);
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [scale, setScale] = useState(loadDiagramScale);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [exporting, setExporting] = useState(false);

  const initMermaid = useCallback(() => {
    const theme = themeConfig.mermaidTheme;
    const themeVariables = themeConfig.themeVariables ?? {};
    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "loose",
      theme: theme as "default" | "dark" | "neutral" | "forest" | "base" | "null",
      themeVariables: Object.keys(themeVariables).length ? { ...themeVariables, darkMode } : undefined,
    });
  }, [themeConfig, darkMode]);

  useEffect(() => {
    initMermaid();
  }, [initMermaid]);

  useEffect(() => {
    try {
      localStorage.setItem(DIAGRAM_SCALE_KEY, String(scale));
    } catch {
      // localStorage may be unavailable
    }
  }, [scale]);

  useEffect(() => {
    if (!mmdCode.trim()) {
      setSvg(null);
      setError(null);
      onParseError?.("");
      return;
    }
    const runId = ++runIdRef.current;
    setError(null);
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    el.innerHTML = "";
    const id = `mermaid-${Date.now()}`;
    mermaid
      .render(id, mmdCode)
      .then(({ svg: svgStr }) => {
        if (runId !== runIdRef.current) return;
        setSvg(svgStr);
        setError(null);
        onParseError?.("");
        el.innerHTML = svgStr;
        const svgEl = el.querySelector("svg");
        if (svgEl) {
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }
      })
      .catch((err: Error) => {
        if (runId !== runIdRef.current) return;
        const rawMsg = err.message ?? "Parse error";
        setSvg(null);
        const line = parseLineFromError(rawMsg);
        const friendlyMessage = formatParseError(rawMsg, line);
        setError(friendlyMessage);
        onParseError?.(friendlyMessage, line);
      });
  }, [mmdCode, initMermaid, onParseError]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) =>
      Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + (e.deltaY > 0 ? -WHEEL_ZOOM_STEP : WHEEL_ZOOM_STEP)))
    );
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) {
      setIsPanning(true);
      setStartPan({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) setPan({ x: e.clientX - startPan.x, y: e.clientY - startPan.y });
  };
  const handleMouseUp = () => setIsPanning(false);
  const handleMouseLeave = () => setIsPanning(false);

  const handleFit = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  const handleDownloadPng = async () => {
    const containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl || !svg) return;
    setExporting(true);
    try {
      // Export from rendered DOM so browser fonts (and exact appearance) are used; server-side Cairo often misses text
      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png", 1)
      );
      if (!blob) throw new Error("PNG export failed");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("PNG export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    const containerEl = document.getElementById(CONTAINER_ID);
    if (!containerEl || !svg) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(containerEl, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const wMm = (canvas.width * 25.4) / 96;
      const hMm = (canvas.height * 25.4) / 96;
      const pdf = new jsPDF({
        unit: "mm",
        format: [wMm, hMm],
        hotfixes: ["px_scaling"],
      });
      pdf.addImage(imgData, "PNG", 0, 0, wMm, hMm);
      pdf.save("diagram.pdf");
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        bgcolor: "background.default",
        backgroundImage: "radial-gradient(circle, var(--mui-palette-divider) 1px, transparent 1px)",
        backgroundSize: "16px 16px",
      }}
    >
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: "divider", gap: 0.5 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPng}
          disabled={!svg || exporting}
        >
          {t("app.downloadPng")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={handleDownloadPdf}
          disabled={!svg || exporting}
        >
          {t("app.downloadPdf")}
        </Button>
        <IconButton size="small" onClick={() => setScale((s) => Math.min(MAX_SCALE, s + BUTTON_ZOOM_STEP))} title="Zoom in">
          <ZoomInIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setScale((s) => Math.max(MIN_SCALE, s - BUTTON_ZOOM_STEP))} title="Zoom out">
          <ZoomOutIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleFit} title="Fit">
          <FitScreenIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleFullscreen} title="Fullscreen">
          <FullscreenIcon fontSize="small" />
        </IconButton>
      </Toolbar>
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: isPanning ? "grabbing" : "grab",
        }}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        <Box
          sx={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
            transformOrigin: "center center",
          }}
        >
          <div id={CONTAINER_ID} style={{ display: "inline-block" }} />
        </Box>
      </Box>
      {error && (
        <Paper sx={{ m: 1, p: 1, bgcolor: "error.dark", color: "error.contrastText" }}>
          <Typography variant="caption">{error}</Typography>
        </Paper>
      )}
    </Box>
  );
}
