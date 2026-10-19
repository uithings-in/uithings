import { useEffect, useMemo, useState, useCallback } from "react";
import type {
  ComponentFormValues,
  DesignType,
  PlatformTag,
  PricingType,
  ValidationErrors,
  ChecklistItem,
} from "./types";

const DRAFT_STORAGE_KEY = "uithings_add_component_draft";
const PREFS_STORAGE_KEY = "uithings_last_classification";

interface SavedDraft {
  name: string;
  description: string;
  tags: string[];
  figmaDataBase64: string;
  designType: DesignType;
  pricingType: PricingType;
  platformTag: PlatformTag;
  savedAt: number;
}

export function useAddComponentForm(allowPro: boolean = false) {
  // Load saved preferences for classification defaults
  const getInitialClassification = (): { designType: DesignType; platformTag: PlatformTag } => {
    if (typeof window === "undefined") {
      return { designType: "UI Design", platformTag: "web" };
    }
    try {
      const saved = localStorage.getItem(PREFS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          designType: parsed.designType || "UI Design",
          platformTag: parsed.platformTag || "web",
        };
      }
    } catch {}
    return { designType: "UI Design", platformTag: "web" };
  };

  const initialClassification = getInitialClassification();

  const [name, setNameState] = useState("");
  const [description, setDescriptionState] = useState("");
  const [tags, setTagsState] = useState<string[]>([]);
  const [figmaDataBase64, setFigmaPayloadState] = useState("");
  const [previewFile, setPreviewFileState] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [darkPreviewFile, setDarkPreviewFileState] = useState<File | null>(null);
  const [darkPreviewUrl, setDarkPreviewUrl] = useState<string>("");
  const [lightPreviewFile, setLightPreviewFileState] = useState<File | null>(null);
  const [lightPreviewUrl, setLightPreviewUrl] = useState<string>("");
  const [designType, setDesignTypeState] = useState<DesignType>(initialClassification.designType);
  const [pricingType, setPricingTypeState] = useState<PricingType>("Free");
  const [platformTag, setPlatformTagState] = useState<PlatformTag>(initialClassification.platformTag);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<number | null>(null);

  // Restore draft on initial mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed: SavedDraft = JSON.parse(saved);
        if (parsed.name) setNameState(parsed.name);
        if (parsed.description) setDescriptionState(parsed.description);
        if (parsed.tags && Array.isArray(parsed.tags)) setTagsState(parsed.tags);
        if (parsed.figmaDataBase64) setFigmaPayloadState(parsed.figmaDataBase64);
        if (parsed.designType) setDesignTypeState(parsed.designType);
        if (parsed.platformTag) setPlatformTagState(parsed.platformTag);
        if (parsed.pricingType && (allowPro || parsed.pricingType === "Free")) {
          setPricingTypeState(parsed.pricingType);
        }
        setLastSavedTime(parsed.savedAt);
      }
    } catch {}
    setIsDraftLoaded(true);
  }, [allowPro]);

  // Object URL cleanup for dark mode preview
  useEffect(() => {
    if (darkPreviewFile) {
      const url = URL.createObjectURL(darkPreviewFile);
      setDarkPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setDarkPreviewUrl("");
    }
  }, [darkPreviewFile]);

  // Object URL cleanup for light mode preview
  useEffect(() => {
    if (lightPreviewFile) {
      const url = URL.createObjectURL(lightPreviewFile);
      setLightPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLightPreviewUrl("");
    }
  }, [lightPreviewFile]);

  // Object URL cleanup for legacy/fallback previewFile
  useEffect(() => {
    if (previewFile) {
      const url = URL.createObjectURL(previewFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }, [previewFile]);

  // Autosave draft to localStorage (debounce)
  useEffect(() => {
    if (!isDraftLoaded) return;
    const hasAnyContent = !!(name.trim() || description.trim() || tags.length || figmaDataBase64);

    if (!hasAnyContent) {
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        setLastSavedTime(null);
      } catch {}
      return;
    }

    const timer = setTimeout(() => {
      try {
        const now = Date.now();
        const draft: SavedDraft = {
          name,
          description,
          tags,
          figmaDataBase64,
          designType,
          pricingType,
          platformTag,
          savedAt: now,
        };
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        setLastSavedTime(now);
      } catch {}
    }, 600);

    return () => clearTimeout(timer);
  }, [name, description, tags, figmaDataBase64, designType, pricingType, platformTag, isDraftLoaded]);

  // Save last used preferences
  useEffect(() => {
    try {
      localStorage.setItem(
        PREFS_STORAGE_KEY,
        JSON.stringify({ designType, platformTag })
      );
    } catch {}
  }, [designType, platformTag]);

  // Unsaved changes alert
  const isDirty = useMemo(() => {
    return Boolean(
      name.trim() ||
        description.trim() ||
        tags.length ||
        figmaDataBase64 ||
        darkPreviewFile ||
        lightPreviewFile ||
        previewFile
    );
  }, [name, description, tags, figmaDataBase64, darkPreviewFile, lightPreviewFile, previewFile]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  // Field change setters
  const setName = useCallback((val: string) => {
    setNameState(val.slice(0, 60));
  }, []);

  const setDescription = useCallback((val: string) => {
    setDescriptionState(val.slice(0, 240));
  }, []);

  const setTags = useCallback((val: string[]) => {
    setTagsState(val.slice(0, 3));
  }, []);

  const setFigmaPayload = useCallback((val: string) => {
    setFigmaPayloadState(val);
  }, []);

  const setDesignType = useCallback((val: DesignType) => {
    setDesignTypeState(val);
  }, []);

  const setPricingType = useCallback((val: PricingType) => {
    if (val === "Pro" && !allowPro) return;
    setPricingTypeState(val);
  }, [allowPro]);

  const setPlatformTag = useCallback((val: PlatformTag) => {
    setPlatformTagState(val);
  }, []);

  const suggestNameFromFile = useCallback(
    (file: File | null) => {
      if (file && !name.trim()) {
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "") // remove extension
          .replace(/[-_]+/g, " ") // replace dash/underscore with spaces
          .replace(/\b\w/g, (char) => char.toUpperCase()) // Title Case
          .trim();
        if (cleanName) {
          setNameState(cleanName.slice(0, 60));
        }
      }
    },
    [name]
  );

  const setDarkPreviewFile = useCallback(
    (file: File | null) => {
      setDarkPreviewFileState(file);
      if (!file) {
        setDarkPreviewUrl("");
      } else {
        suggestNameFromFile(file);
      }
    },
    [suggestNameFromFile]
  );

  const setLightPreviewFile = useCallback(
    (file: File | null) => {
      setLightPreviewFileState(file);
      if (!file) {
        setLightPreviewUrl("");
      } else {
        suggestNameFromFile(file);
      }
    },
    [suggestNameFromFile]
  );

  // Set preview file + auto-suggest component name from filename if name is empty (legacy/generic)
  const setPreviewFile = useCallback(
    (file: File | null) => {
      setPreviewFileState(file);
      if (!darkPreviewFile) {
        setDarkPreviewFileState(file);
      }
      suggestNameFromFile(file);
    },
    [darkPreviewFile, suggestNameFromFile]
  );

  const markTouched = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  const hasAnyPreview = Boolean(darkPreviewFile || lightPreviewFile || previewFile);

  // Validation
  const errors = useMemo<ValidationErrors>(() => {
    const errs: ValidationErrors = {};
    if (touched.name && !name.trim()) {
      errs.name = "Component name is required.";
    }
    if (touched.figmaPayload && !figmaDataBase64.trim()) {
      errs.figmaPayload = "Figma asset payload is required.";
    }
    if (touched.previewFile && !hasAnyPreview) {
      errs.previewFile = "At least one preview screenshot (Dark or Light) is required.";
    }
    return errs;
  }, [name, figmaDataBase64, hasAnyPreview, touched]);

  // Missing required list for tooltip/hints
  const missingFields = useMemo(() => {
    const missing: string[] = [];
    if (!figmaDataBase64.trim()) missing.push("Figma Asset Payload");
    if (!hasAnyPreview) missing.push("Preview Screenshot");
    if (!name.trim()) missing.push("Component Name");
    return missing;
  }, [figmaDataBase64, hasAnyPreview, name]);

  const canPublish = missingFields.length === 0;

  // Publish Checklist items
  const checklist = useMemo<ChecklistItem[]>(() => {
    return [
      {
        id: "figma",
        label: "Figma asset payload pasted",
        completed: Boolean(figmaDataBase64.trim()),
        required: true,
      },
      {
        id: "screenshot",
        label: "Preview screenshot uploaded",
        completed: hasAnyPreview,
        required: true,
      },
      {
        id: "name",
        label: "Component name provided",
        completed: Boolean(name.trim()),
        required: true,
      },
      {
        id: "classification",
        label: "Classification & tags configured",
        completed: Boolean(tags.length > 0),
        required: false,
      },
    ];
  }, [figmaDataBase64, hasAnyPreview, name, tags]);

  const completedCount = checklist.filter((item) => item.completed).length;

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {}
    setNameState("");
    setDescriptionState("");
    setTagsState([]);
    setFigmaPayloadState("");
    setPreviewFileState(null);
    setPreviewUrl("");
    setDarkPreviewFileState(null);
    setDarkPreviewUrl("");
    setLightPreviewFileState(null);
    setLightPreviewUrl("");
    setTouched({});
    setLastSavedTime(null);
  }, []);

  const effectivePreviewFile = darkPreviewFile || lightPreviewFile || previewFile;
  const effectivePreviewUrl = darkPreviewUrl || lightPreviewUrl || previewUrl;

  const values: ComponentFormValues = {
    name,
    description,
    tags,
    figmaDataBase64,
    previewFile: effectivePreviewFile,
    previewUrl: effectivePreviewUrl,
    darkPreviewFile,
    darkPreviewUrl,
    lightPreviewFile,
    lightPreviewUrl,
    designType,
    pricingType,
    platformTag,
  };

  return {
    values,
    setName,
    setDescription,
    setTags,
    setFigmaPayload,
    setPreviewFile,
    setDarkPreviewFile,
    setLightPreviewFile,
    setDesignType,
    setPricingType,
    setPlatformTag,
    markTouched,
    errors,
    missingFields,
    canPublish,
    checklist,
    completedCount,
    isDirty,
    lastSavedTime,
    clearDraft,
  };
}
