import { useCallback, useEffect, useRef, useState } from "react";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  TextField,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import { useTranslation } from "react-i18next";
import { CodeEditor, type ParseError } from "./components/CodeEditor";
import { DiagramView } from "./components/DiagramView";
import { DIAGRAM_TYPES } from "./config/diagramTypes";
import { MERMAID_THEMES } from "./config/themes";
import { DEFAULT_MMD } from "./constants/defaultDiagram";
import * as api from "./api/diagrams";
import type { ThemeConfig } from "./config/themes";
import type { DiagramListItem } from "./api/diagrams";

const DRAWER_WIDTH = 280;
const CODE_PANEL_WIDTH_PERCENT = 38;

export default function App() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const darkMode = theme.palette.mode === "dark";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState(t("app.untitledDiagram"));
  const [mmdContent, setMmdContent] = useState(DEFAULT_MMD);
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [diagramTypeId, setDiagramTypeId] = useState("flowchart");
  const [themeId, setThemeId] = useState("dark");
  const [diagramList, setDiagramList] = useState<DiagramListItem[]>([]);
  const [titleEditing, setTitleEditing] = useState(false);
  const [titleEditValue, setTitleEditValue] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [parseError, setParseError] = useState<ParseError | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>(0);

  const themeConfig: ThemeConfig =
    MERMAID_THEMES.find((th) => th.id === themeId) ?? MERMAID_THEMES[0];

  const loadList = useCallback(async () => {
    try {
      const list = await api.listDiagrams();
      setDiagramList(list);
    } catch (e) {
      console.error("Failed to load diagram list", e);
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleNewDiagram = () => {
    setCurrentId(null);
    setTitle(t("app.untitledDiagram"));
    setMmdContent(DEFAULT_MMD);
    setDrawerOpen(false);
  };

  const handleOpenDiagram = async (id: string) => {
    try {
      const d = await api.getDiagram(id);
      setCurrentId(d.id);
      setTitle(d.title);
      setMmdContent(d.mmd_content);
      setDrawerOpen(false);
    } catch (e) {
      console.error("Failed to open diagram", e);
    }
  };

  const handleSave = async () => {
    try {
      if (currentId) {
        await api.updateDiagram(currentId, { title, mmd_content: mmdContent });
      } else {
        const created = await api.createDiagram(title, mmdContent);
        setCurrentId(created.id);
        setTitle(created.title);
      }
      await loadList();
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setMmdContent(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  };

  const handleDownloadMmd = () => {
    const blob = new Blob([mmdContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (title || "diagram").replace(/\s+/g, "_") + ".mmd";
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (!autoUpdate || !currentId) return;
    clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(handleSave, 1500);
    return () => clearTimeout(saveTimeoutRef.current);
  }, [mmdContent, title, autoUpdate, currentId]);

  const handleDiagramTypeChange = (id: string) => {
    setDiagramTypeId(id);
    const config = DIAGRAM_TYPES.find((c) => c.id === id);
    if (config) setMmdContent(config.starterSnippet);
  };

  const startTitleEdit = () => {
    setTitleEditValue(title);
    setTitleEditing(true);
  };

  const commitTitleEdit = async () => {
    setTitleEditing(false);
    const newTitle = (titleEditValue || t("app.untitledDiagram")).trim();
    if (newTitle === title) return;
    setTitle(newTitle);
    if (currentId) {
      try {
        await api.updateDiagram(currentId, { title: newTitle });
        await loadList();
      } catch (e) {
        console.error("Failed to update title", e);
      }
    }
  };

  const cancelTitleEdit = () => {
    setTitleEditing(false);
    setTitleEditValue("");
  };

  const openDeleteConfirm = () => {
    setDrawerOpen(false);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!currentId) {
      setDeleteConfirmOpen(false);
      return;
    }
    try {
      await api.deleteDiagram(currentId);
      setDeleteConfirmOpen(false);
      const list = await api.listDiagrams();
      setDiagramList(list);
      if (list.length > 0) {
        const d = await api.getDiagram(list[0].id);
        setCurrentId(d.id);
        setTitle(d.title);
        setMmdContent(d.mmd_content);
      } else {
        handleNewDiagram();
      }
    } catch (e) {
      console.error("Failed to delete diagram", e);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
  };

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("mmd-lang", lng);
  };

  const handleThemeModeChange = (checked: boolean) => {
    const mode = checked ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", mode);
    localStorage.setItem("mmd-theme", mode);
    window.dispatchEvent(new CustomEvent("theme-change", { detail: mode }));
  };

  useEffect(() => {
    const stored = localStorage.getItem("mmd-theme") as "dark" | "light" | null;
    const preferDark = stored ?? "dark";
    document.documentElement.setAttribute("data-theme", preferDark);
  }, []);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <AppBar position="static" elevation={0}>
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} aria-label="menu">
            <MenuIcon />
          </IconButton>
          <Box sx={{ ml: 1, flex: 1, display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
            <Typography variant="h6" component="span" noWrap sx={{ flex: "0 0 auto" }}>
              {t("app.projects")} / {t("app.personal")} /
            </Typography>
            {titleEditing ? (
              <TextField
                size="small"
                value={titleEditValue}
                onChange={(e) => setTitleEditValue(e.target.value)}
                onBlur={commitTitleEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") commitTitleEdit();
                  if (e.key === "Escape") cancelTitleEdit();
                }}
                autoFocus
                variant="standard"
                inputProps={{ maxLength: 255 }}
                sx={{
                  flex: 1,
                  minWidth: 120,
                  "& .MuiInput-root": { color: "inherit" },
                  "& .MuiInput-input": { fontSize: "1.25rem", fontWeight: 500 },
                }}
              />
            ) : (
              <>
                <Typography
                  variant="h6"
                  onClick={startTitleEdit}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "pointer",
                    "&:hover": { textDecoration: "underline" },
                  }}
                  title={t("app.rename")}
                >
                  {title}
                </Typography>
                <IconButton size="small" color="inherit" onClick={startTitleEdit} aria-label={t("app.rename")}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </>
            )}
          </Box>
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={darkMode}
                onChange={(_, c) => handleThemeModeChange(c)}
                color="default"
              />
            }
            label={<Typography variant="caption">{t("app.darkMode")}</Typography>}
          />
          <FormControl size="small" sx={{ minWidth: 90, ml: 1 }}>
            <Select
              value={i18n.language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              variant="outlined"
              sx={{ color: "inherit", ".MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.3)" } }}
            >
              <MenuItem value="en">EN</MenuItem>
              <MenuItem value="de">DE</MenuItem>
            </Select>
          </FormControl>
        </Toolbar>
      </AppBar>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{ "& .MuiDrawer-paper": { width: DRAWER_WIDTH } }}
      >
        <Toolbar />
        <List>
          <ListItemButton onClick={handleNewDiagram}>
            <ListItemIcon><AddIcon /></ListItemIcon>
            <ListItemText primary={t("app.newDiagram")} />
          </ListItemButton>
          <ListItemButton onClick={() => loadList().then(() => setDrawerOpen(true))}>
            <ListItemIcon><FolderOpenIcon /></ListItemIcon>
            <ListItemText primary={t("app.openDiagram")} />
          </ListItemButton>
          <ListItemButton
            onClick={() => {
              setDrawerOpen(false);
              startTitleEdit();
            }}
          >
            <ListItemIcon><DriveFileRenameOutlineIcon /></ListItemIcon>
            <ListItemText primary={t("app.rename")} />
          </ListItemButton>
          <ListItemButton
            onClick={openDeleteConfirm}
            disabled={!currentId}
            sx={currentId ? { color: "error.main" } : undefined}
          >
            <ListItemIcon sx={currentId ? { color: "error.main" } : undefined}>
              <DeleteOutlineIcon />
            </ListItemIcon>
            <ListItemText primary={t("app.deleteDiagram")} />
          </ListItemButton>
        </List>
        <Divider />
        <List>
          <ListItemButton component="a" href="https://mermaid.js.org/" target="_blank" rel="noopener noreferrer">
            <ListItemIcon><DashboardIcon /></ListItemIcon>
            <ListItemText primary={t("app.docs")} />
          </ListItemButton>
          <ListItemButton>
            <ListItemIcon><SettingsIcon /></ListItemIcon>
            <ListItemText primary={t("app.settings")} />
          </ListItemButton>
        </List>
        <Divider />
        <Box sx={{ px: 2, py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={(_, c) => handleThemeModeChange(c)}
                color="primary"
              />
            }
            label={t("app.darkMode")}
          />
        </Box>
        {diagramList.length > 0 && (
          <>
            <Typography variant="caption" sx={{ px: 2, pt: 1 }}>{t("app.openDiagram")}</Typography>
            <List dense>
              {diagramList.slice(0, 20).map((d) => (
                <ListItemButton key={d.id} onClick={() => handleOpenDiagram(d.id)}>
                  <ListItemText primary={d.title} secondary={d.updated_at?.slice(0, 10)} />
                </ListItemButton>
              ))}
            </List>
          </>
        )}
      </Drawer>

      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel} aria-labelledby="delete-diagram-dialog-title">
        <DialogTitle id="delete-diagram-dialog-title">{t("app.deleteDiagramConfirmTitle")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("app.deleteDiagramConfirmMessage", { title: title || t("app.untitledDiagram") })}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>{t("app.cancel")}</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {t("app.delete")}
          </Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Box sx={{ width: `${CODE_PANEL_WIDTH_PERCENT}%`, minWidth: 200, borderRight: 1, borderColor: "divider", display: "flex", flexDirection: "column" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider", p: 0.5 }}>
            <FormControl size="small" fullWidth>
              <InputLabel>{t("app.diagramType")}</InputLabel>
              <Select
                value={diagramTypeId}
                label={t("app.diagramType")}
                onChange={(e) => handleDiagramTypeChange(e.target.value)}
              >
                {DIAGRAM_TYPES.map((dt) => (
                  <MenuItem key={dt.id} value={dt.id}>{t(dt.nameKey)}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" fullWidth sx={{ mt: 0.5 }}>
              <InputLabel>{t("app.theme")}</InputLabel>
              <Select
                value={themeId}
                label={t("app.theme")}
                onChange={(e) => setThemeId(e.target.value)}
              >
                {MERMAID_THEMES.map((th) => (
                  <MenuItem key={th.id} value={th.id}>{t(th.nameKey)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <CodeEditor
            value={mmdContent}
            onChange={setMmdContent}
            onUpload={handleUpload}
            onSave={handleSave}
            onDownloadMmd={handleDownloadMmd}
            autoUpdate={autoUpdate}
            onAutoUpdateChange={setAutoUpdate}
            parseError={parseError}
            darkMode={darkMode}
            onDocs={() => window.open("https://mermaid.js.org/intro/", "_blank")}
          />
        </Box>
        <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
          <DiagramView
            mmdCode={mmdContent}
            themeConfig={themeConfig}
            darkMode={darkMode}
            onParseError={(message, line) => setParseError(message ? { message, line } : null)}
          />
        </Box>
      </Box>
    </Box>
  );
}
