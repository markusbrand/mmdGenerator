import { useMemo, useState, useEffect } from "react";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Switch,
  Toolbar,
  Typography,
  FormControlLabel,
  Paper,
} from "@mui/material";
import CodeIcon from "@mui/icons-material/Code";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import SaveIcon from "@mui/icons-material/Save";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useTranslation } from "react-i18next";
import CodeMirror from "@uiw/react-codemirror";
import { LanguageSupport } from "@codemirror/language";
import { mermaidLanguage } from "../codemirror/mermaidLang";
import { errorLineExtension } from "../codemirror/errorLineHighlight";

export interface ParseError {
  message: string;
  line?: number;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  onUpload: (file: File) => void;
  onSave: () => void;
  onDownloadMmd: () => void;
  autoUpdate: boolean;
  onAutoUpdateChange: (v: boolean) => void;
  parseError?: ParseError | null;
  onDocs?: () => void;
  readOnly?: boolean;
  darkMode?: boolean;
}

export function CodeEditor({
  value,
  onChange,
  onUpload,
  onSave,
  onDownloadMmd,
  autoUpdate,
  onAutoUpdateChange,
  parseError,
  onDocs,
  readOnly = false,
  darkMode = false,
}: CodeEditorProps) {
  const { t } = useTranslation();
  const [errorPanelOpen, setErrorPanelOpen] = useState(true);

  useEffect(() => {
    if (parseError?.message) setErrorPanelOpen(true);
  }, [parseError?.message]);

  const extensions = useMemo(
    () => [
      new LanguageSupport(mermaidLanguage),
      ...errorLineExtension(parseError?.line ?? null),
    ],
    [parseError?.line]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      onUpload(f);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
      <Toolbar variant="dense" sx={{ borderBottom: 1, borderColor: "divider", gap: 1, flexWrap: "wrap" }}>
        <CodeIcon sx={{ mr: 0.5 }} />
        <Typography variant="subtitle2" sx={{ mr: 1 }}>
          {t("app.code")}
        </Typography>
        <FormControlLabel
          control={
            <Switch
              size="small"
              checked={autoUpdate}
              onChange={(_, c) => onAutoUpdateChange(c)}
              color="primary"
            />
          }
          label={<Typography variant="caption">{t("app.autoUpdate")}</Typography>}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          component="label"
          sx={{ textTransform: "none" }}
        >
          {t("app.uploadMmd")}
          <input type="file" accept=".mmd,text/plain" hidden onChange={handleFileChange} />
        </Button>
        <Button size="small" variant="outlined" startIcon={<SaveIcon />} onClick={onSave} sx={{ textTransform: "none" }}>
          {t("app.save")}
        </Button>
        <Button
          size="small"
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={onDownloadMmd}
          sx={{ textTransform: "none" }}
        >
          {t("app.downloadMmd")}
        </Button>
        {onDocs && (
          <Button size="small" href="https://mermaid.js.org/intro/" target="_blank" rel="noopener noreferrer">
            {t("app.docs")}
          </Button>
        )}
      </Toolbar>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          "& .cm-editor": { height: "100%", fontSize: 14 },
          "& .cm-scroller": { overflow: "auto" },
          "& .cm-error-line": { backgroundColor: "rgba(211, 47, 47, 0.25)" },
        }}
      >
        <CodeMirror
          value={value}
          height="100%"
          theme={darkMode ? "dark" : "light"}
          extensions={extensions}
          onChange={(v) => onChange(v)}
          readOnly={readOnly}
          basicSetup={{ lineNumbers: true }}
          placeholder="flowchart LR&#10;  A --> B"
        />
      </Box>
      <Collapse in={!!parseError?.message && errorPanelOpen}>
        <Paper
          variant="outlined"
          sx={{
            m: 1,
            display: "flex",
            alignItems: "flex-start",
            gap: 0.5,
            bgcolor: "error.dark",
            color: "error.contrastText",
            p: 0.5,
          }}
        >
          <ErrorOutlineIcon sx={{ mt: 0.25, flexShrink: 0 }} fontSize="small" />
          <Typography component="pre" variant="caption" sx={{ flex: 1, whiteSpace: "pre-wrap", fontFamily: "monospace", m: 0 }}>
            {parseError?.message}
          </Typography>
          <IconButton size="small" color="inherit" onClick={() => setErrorPanelOpen(false)} aria-label={t("app.close")}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Paper>
      </Collapse>
    </Box>
  );
}
