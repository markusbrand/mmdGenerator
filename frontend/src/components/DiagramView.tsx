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
import { exportPng, exportPdf } from "../api/diagrams";

const CONTAINER_ID = "mermaid-container";

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
  const [error, setError] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
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
    if (!mmdCode.trim()) {
      setSvg(null);
      setError(null);
      return;
    }
    setError(null);
    const el = document.getElementById(CONTAINER_ID);
    if (!el) return;
    el.innerHTML = "";
    const id = `mermaid-${Date.now()}`;
    mermaid
      .render(id, mmdCode)
      .then(({ svg: svgStr }) => {
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
        const msg = err.message ?? "Parse error";
        setError(msg);
        setSvg(null);
        const line = parseLineFromError(msg);
        onParseError?.(msg, line);
      });
  }, [mmdCode, initMermaid, onParseError]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.min(4, Math.max(0.25, s + (e.deltaY > 0 ? -0.1 : 0.1))));
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
    if (!svg) return;
    setExporting(true);
    try {
      const blob = await exportPng(svg, 2);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.png";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!svg) return;
    setExporting(true);
    try {
      const blob = await exportPdf(svg);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "diagram.pdf";
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
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
        <IconButton size="small" onClick={() => setScale((s) => Math.min(4, s + 0.25))} title="Zoom in">
          <ZoomInIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => setScale((s) => Math.max(0.25, s - 0.25))} title="Zoom out">
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
