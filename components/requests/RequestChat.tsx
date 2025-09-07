/* eslint-disable */
//@ts-ignore
import { Image } from "@mantine/core";
import {
  User2,
  Settings,
  Trash2,
  Paperclip,
  Mic,
  MicOff,
  Send,
  RefreshCw,
  X,
  Check,
  Clock,
  Building,
  MapPin,
  Users,
  Hash,
  Package,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";

// Type definitions
interface RequestChatProps {
  userToken: string;
  sessionId?: string;
  userType?: "user" | "supplier";
  showEnvToggle?: boolean;
  baseUrlProd?: string;
  baseUrlTest?: string;
  webhookUrl?: string;
  onError?: (error: string) => void;
  onRequestSubmitted?: (message: ChatMessage) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  items?: MaterialItem[];
  projects?: Project[];
  action?: string;
  selectedItems?: MaterialItem[];
  userSelectedItems?: boolean;
  canResend?: boolean;
  resendPayload?: {
    text: string;
    file: File | null;
  };
}

interface Attachment {
  type: "image" | "audio";
  url: string;
}

interface MaterialItem {
  id?: string;
  name: string;
  description?: string;
  photo?: string;
  quantity?: number;
  selected: boolean;
  desiredQuantity: number;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  address: string;
  status?: string;
  image?: string;
}

interface RequestState {
  stage: number;
  currentAction: string;
  selectedItems: MaterialItem[];
  deliveryDate: Date | null;
  projectData: Project | null;
  supplierMode: string | null;
}

interface LocalStorageKeys {
  env: string;
  baseUrlProd: string;
  baseUrlTest: string;
  userType: string;
}

interface AssistantResponse {
  json?: any;
  output?: any;
  content?: string;
  message?: string;
  action?: string;
  items?: string | MaterialItem[];
  projects?: string | Project[];
  user_selected_items?: boolean | string | number;
}

const RequestChat: React.FC<RequestChatProps> = ({
  userToken,
  sessionId = "",
  userType: initialUserType = "user",
  showEnvToggle = true,
  baseUrlProd: propBaseUrlProd = "https://kimari.app.n8n.cloud",
  baseUrlTest: propBaseUrlTest = "https://kimari.app.n8n.cloud",
  webhookUrl: propWebhookUrl,
  onError,
  onRequestSubmitted,
  isOpen = false,
  onToggle,
}) => {
  // n8n webhook path
  const N8N_WEBHOOK_PATH = "31202e0d-7ed4-4b6e-9368-4ae8d97302cd";

  // Local storage keys
  const LS_KEYS: LocalStorageKeys = {
    env: "request_env",
    baseUrlProd: "request_base_url_prod",
    baseUrlTest: "request_base_url_test",
    userType: "request_user_type",
  };

  // Local storage prefix for chat history
  const CHAT_STORAGE_PREFIX = "request_chat_history_";

  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Audio recording state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");

  // Project selection state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null
  );
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [availableProjects, setAvailableProjects] = useState<Project[]>([]);

  // Environment and settings state
  const [env, setEnv] = useState<"test" | "prod">("prod");
  const [userType, setUserType] = useState<"user" | "supplier">(
    (typeof window !== "undefined"
      ? (localStorage.getItem(LS_KEYS.userType) as "user" | "supplier")
      : null) || initialUserType
  );
  const [baseUrlProdState, setBaseUrlProdState] = useState<string>(
    (typeof window !== "undefined"
      ? localStorage.getItem(LS_KEYS.baseUrlProd)
      : null) || propBaseUrlProd
  );
  const [baseUrlTestState, setBaseUrlTestState] = useState<string>(
    (typeof window !== "undefined"
      ? localStorage.getItem(LS_KEYS.baseUrlTest)
      : null) || propBaseUrlTest
  );

  // Current request state tracking
  const [requestState, setRequestState] = useState<RequestState>({
    stage: 1,
    currentAction: "",
    selectedItems: [],
    deliveryDate: null,
    projectData: null,
    supplierMode: null,
  });

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Computed values
  const isTest = env === "test";
  const resolvedBaseUrl = (
    isTest ? baseUrlTestState : baseUrlProdState
  ).replace(/\/$/, "");
  const webhookUrl =
    propWebhookUrl?.trim() ||
    (resolvedBaseUrl
      ? `${resolvedBaseUrl}/${
          isTest ? "webhook-test" : "webhook"
        }/${N8N_WEBHOOK_PATH}`
      : "");
  const canSend =
    !!webhookUrl && (!!chatInput.trim() || !!selectedFile || !!recordedBlob);
  const selectedProject = availableProjects.find(
    (p) => p.id === selectedProjectId
  );
  const currentSessionId = sessionId || userToken || "";

  // Persist state changes to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.env, env);
    }
  }, [env]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.userType, userType);
    }
  }, [userType]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.baseUrlProd, baseUrlProdState || "");
    }
  }, [baseUrlProdState]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(LS_KEYS.baseUrlTest, baseUrlTestState || "");
    }
  }, [baseUrlTestState]);

  // Chat persistence functions
  const getChatStorageKey = useCallback((): string | null => {
    return currentSessionId
      ? `${CHAT_STORAGE_PREFIX}${currentSessionId}`
      : null;
  }, [currentSessionId]);

  const persistMessages = useCallback((): void => {
    const key = getChatStorageKey();
    if (!key || typeof window === "undefined") return;
    try {
      const compact = messages.map(
        ({
          id,
          role,
          content,
          items,
          projects,
          action,
          selectedItems,
          userSelectedItems,
        }) => ({
          id,
          role,
          content,
          items,
          projects,
          action,
          selectedItems,
          userSelectedItems,
        })
      );
      localStorage.setItem(key, JSON.stringify(compact));
    } catch (_) {}
  }, [messages, getChatStorageKey]);

  const restoreMessages = useCallback((): void => {
    const key = getChatStorageKey();
    if (!key || typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        setMessages(Array.isArray(parsed) ? parsed : []);
      }
    } catch (_) {
      setMessages([]);
    }
  }, [getChatStorageKey]);

  const clearChat = useCallback((): void => {
    setMessages([]);
    setRequestState({
      stage: 1,
      currentAction: "",
      selectedItems: [],
      deliveryDate: null,
      projectData: null,
      supplierMode: null,
    });
    setSelectedProjectId(null);
    persistMessages();
  }, [persistMessages]);

  // Lifecycle effects
  useEffect(() => {
    restoreMessages();
  }, [restoreMessages]);

  useEffect(() => {
    persistMessages();
  }, [messages, persistMessages]);

  // Scroll to bottom function
  const scrollToBottom = useCallback(async (): Promise<void> => {
    // Small delay to ensure DOM is updated
    await new Promise((resolve) => setTimeout(resolve, 100));
    try {
      chatContainerRef.current?.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    } catch (_) {}
  }, []);

  // Markdown renderer
  const renderMarkdown = (md: string): string => {
    if (!md || typeof md !== "string") return "";
    // Escape HTML
    let result = md
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    // Fenced code blocks
    result = result.replace(
      /```([\s\S]*?)```/g,
      (m, code) => `<pre><code>${code.trim()}</code></pre>`
    );
    // Inline code
    result = result.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Headings
    result = result
      .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
    // Bold/italic
    result = result.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    result = result.replace(/\*(?!\s)([^*]+)(?!\s)\*/g, "<em>$1</em>");
    result = result.replace(/_(?!\s)([^_]+)(?!\s)_/g, "<em>$1</em>");
    // Lists
    result = result.replace(/^(?:- |\* )(.*)$/gm, "<li>$1</li>");
    result = result.replace(
      /(<li>.*<\/li>)(\n<li>.*<\/li>)+/g,
      (m) => `<ul>${m}</ul>`
    );
    result = result.replace(/^(\d+)\.\s+(.*)$/gm, "<li>$2</li>");
    // Paragraphs
    result = result
      .split(/\n{2,}/)
      .map((block) => {
        if (/^\s*<(h1|h2|h3|ul|ol|pre|blockquote)/.test(block)) return block;
        if (/^\s*<li>/.test(block)) return `<ul>${block}</ul>`;
        return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
    return result;
  };

  // HTML sanitizer
  const sanitizeHtml = (dirtyHtml: string): string => {
    if (!dirtyHtml) return "";
    if (typeof window === "undefined" || !window.document)
      return String(dirtyHtml);

    const allowedTags = new Set([
      "p",
      "strong",
      "em",
      "u",
      "s",
      "br",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "span",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
    ]);
    const allowedAttrs: Record<string, Set<string>> = {
      a: new Set(["href", "target", "rel"]),
      span: new Set(["style"]),
    };

    const temp = document.createElement("div");
    temp.innerHTML = dirtyHtml;

    const sanitizeNode = (node: Node): Node => {
      const doc = document;
      if (node.nodeType === Node.TEXT_NODE) {
        return doc.createTextNode(node.nodeValue || "");
      }
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return doc.createDocumentFragment();
      }

      const element = node as Element;
      const tag = element.tagName.toLowerCase();
      const children = Array.from(element.childNodes).map(sanitizeNode);

      if (!allowedTags.has(tag)) {
        const frag = doc.createDocumentFragment();
        children.forEach((c) => frag.appendChild(c));
        return frag;
      }

      const cleanEl = doc.createElement(tag);
      const owner = allowedAttrs[tag];
      if (owner) {
        for (const attr of Array.from(element.attributes)) {
          const attrName = attr.name.toLowerCase();
          if (owner.has(attrName)) cleanEl.setAttribute(attrName, attr.value);
        }
      }

      if (tag === "a") {
        const href = cleanEl.getAttribute("href") || "";
        if (!/^https?:\/\//i.test(href) && !/^mailto:/i.test(href)) {
          cleanEl.removeAttribute("href");
        } else {
          cleanEl.setAttribute("target", "_blank");
          cleanEl.setAttribute("rel", "nofollow noopener noreferrer");
        }
      }

      children.forEach((c) => cleanEl.appendChild(c));
      return cleanEl;
    };

    const wrapper = document.createElement("div");
    Array.from(temp.childNodes).forEach((child) => {
      wrapper.appendChild(sanitizeNode(child));
    });
    return wrapper.innerHTML;
  };

  // File handling
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearRecording();
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setImagePreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeAttachment = (): void => {
    setSelectedFile(null);
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      setImagePreviewUrl("");
    }
  };

  // Audio recording
  const startRecording = async (): Promise<void> => {
    try {
      removeAttachment();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordedChunksRef.current = [];
      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: mime });

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) recordedChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        setRecordedBlob(blob);
        setRecordedUrl(URL.createObjectURL(blob));
        setSelectedFile(new File([blob], "recording.webm", { type: mime }));
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (err) {
      onError?.("Microphone access denied or unsupported browser");
    }
  };

  const stopRecording = (): void => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const clearRecording = (): void => {
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedUrl("");
    setRecordedBlob(null);
  };

  // Safe JSON parsing
  const safeJsonParse = (str: string): any | null => {
    if (typeof str !== "string") return null;
    try {
      const v = JSON.parse(str);
      if (v && (typeof v === "object" || Array.isArray(v))) return v;
    } catch (_) {}
    return null;
  };

  // Parse assistant response
  const parseAssistantResponse = (payload: any): ChatMessage => {
    // Normalize diverse n8n response shapes
    let output = payload;
    if (Array.isArray(payload)) {
      const first = payload[0]?.json || payload[0] || {};
      output = first.output || first;
    } else if (payload && typeof payload === "object") {
      output = payload.output || payload.json?.output || payload;
    }

    // If output is a JSON string, try parse
    if (typeof output === "string") {
      const maybe = safeJsonParse(output);
      if (!maybe) {
        return {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: output,
          action: "message",
          items: [],
          selectedItems: [],
          userSelectedItems: false,
        };
      }
      output = maybe;
    }

    const itemsRaw =
      typeof output?.items === "string"
        ? safeJsonParse(output.items)
        : output?.items;
    const projectsRaw =
      typeof output?.projects === "string"
        ? safeJsonParse(output.projects)
        : output?.projects;

    // Update availableProjects when projects are received
    if (Array.isArray(projectsRaw) && projectsRaw.length > 0) {
      setAvailableProjects(projectsRaw);
    }

    return {
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: String(output?.content ?? output?.message ?? ""),
      action: output?.action || "message",
      items: Array.isArray(itemsRaw)
        ? itemsRaw.map((item: any) => ({
            ...item,
            selected: false,
            desiredQuantity: Math.max(1, Number(item.quantity) || 1),
          }))
        : [],
      projects: Array.isArray(projectsRaw) ? projectsRaw : [],
      selectedItems: [],
      userSelectedItems:
        output?.user_selected_items === true ||
        output?.user_selected_items === "true" ||
        output?.user_selected_items === 1,
    };
  };

  // Update request state
  const updateRequestState = (message: ChatMessage): void => {
    setRequestState((prev) => ({
      ...prev,
      currentAction: message.action || "",
      stage: getStageFromAction(message.action || ""),
    }));
  };

  const getStageFromAction = (action: string): number => {
    const stageMap: Record<string, number> = {
      detect_intent: 1,
      set_source: 2,
      show_items: 3,
      confirm_items: 4,
      set_delivery_date: 5,
      select_project: 6,
      set_supplier_mode: 7,
      final_confirm: 8,
      request_items: 9,
    };
    return stageMap[action] || 1;
  };

  // Main send message function
  const sendMessage = async (
    messageText: string | null = null,
    fileOverride: File | null = null
  ): Promise<void> => {
    const textToSend = messageText || chatInput?.trim();
    const fileToUse = fileOverride || selectedFile;

    if (pending) return;
    if (!webhookUrl) {
      onError?.("Assistant endpoint is not configured.");
      return;
    }
    if (!textToSend && !fileToUse && !recordedBlob) return;

    // Add user message
    if (textToSend || fileToUse) {
      const userContent =
        textToSend ||
        `[${
          fileToUse?.type?.startsWith("image/") ? "Image" : "Audio"
        } attachment]`;

      // Mark previous user messages as non-resendable
      setMessages((prev) => {
        const updated = [...prev];
        const lastUserIdx = [...updated]
          .reverse()
          .findIndex((m) => m.role === "user");
        if (lastUserIdx !== -1) {
          const absoluteIdx = updated.length - 1 - lastUserIdx;
          if (updated[absoluteIdx]) updated[absoluteIdx].canResend = false;
        }

        updated.push({
          id: `${Date.now()}-user`,
          role: "user",
          content: userContent,
          attachments: fileToUse
            ? [
                {
                  type: fileToUse.type?.startsWith("image/")
                    ? "image"
                    : "audio",
                  url: imagePreviewUrl || recordedUrl,
                },
              ]
            : [],
          canResend: true,
          resendPayload: { text: textToSend || "", file: fileToUse || null },
        });

        return updated;
      });
    }

    setPending(true);
    scrollToBottom();

    try {
      const form = new FormData();
      if (fileToUse) form.append("file", fileToUse);
      form.append("chatInput", textToSend || "");
      form.append("sessionId", currentSessionId);
      form.append("workflow", "requests"); // Always use requests workflow
      form.append(
        "user_type",
        userType === "user" ? "CLIENT" : "SERVICE_PROVIDER"
      );
      form.append("user_token", userToken || "");

      const res = await fetch(webhookUrl, { method: "POST", body: form });
      const contentType = res.headers.get("content-type") || "";
      let response;

      if (contentType.includes("application/json")) {
        response = await res.json();
      } else {
        const text = await res.text();
        try {
          response = JSON.parse(text);
        } catch (_) {
          response = { action: "message", content: text, items: [] };
        }
      }

      // Parse response
      const assistantMessage = parseAssistantResponse(response);
      setMessages((prev) => [...prev, assistantMessage]);

      // Update request state
      updateRequestState(assistantMessage);

      // Emit event if request was submitted
      if (assistantMessage.action === "request_items") {
        onRequestSubmitted?.(assistantMessage);
      }
    } catch (err) {
      onError?.("Failed to reach assistant. Check network connection.");
    } finally {
      setPending(false);
      if (!messageText && !fileOverride) {
        setChatInput("");
        removeAttachment();
        clearRecording();
      }
      scrollToBottom();
    }
  };

  // Project selection
  const selectProject = (projectId: string): void => {
    setSelectedProjectId(projectId);
    setRequestState((prev) => ({
      ...prev,
      projectData: availableProjects.find((p) => p.id === projectId) || null,
    }));
    setShowProjectModal(false);

    // Send project selection message
    const project = availableProjects.find((p) => p.id === projectId);
    if (project) {
      sendMessage(`I want to deliver to: ${project.name} (${project.address})`);
    }
  };

  // Item interaction functions
  const toggleItemSelection = (messageId: string, itemIndex: number): void => {
    console.log("Toggling item", messageId, itemIndex);

    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId && message.items) {
          const updatedItems = [...message.items];
          updatedItems[itemIndex].selected = !updatedItems[itemIndex].selected;
          return {
            ...message,
            items: updatedItems,
            selectedItems: updatedItems.filter((item) => item.selected),
          };
        }
        return message;
      })
    );
  };

  const adjustItemQuantity = React.useCallback(
    (messageId: string, itemIndex: number, delta: number): void => {
      setMessages((prev) =>
        prev.map((message) => {
          if (message.id === messageId && message.items?.[itemIndex]) {
            const updatedItems = [...message.items];
            const item = updatedItems[itemIndex];

            item.desiredQuantity = Math.max(
              1,
              (item.desiredQuantity || 1) + delta
            );
            console.log(item.desiredQuantity, delta, "delta");
            if (item.selected) {
              return {
                ...message,
                items: updatedItems,
                selectedItems: updatedItems.filter((i) => i.selected),
              };
            }
            return { ...message, items: updatedItems };
          }
          return message;
        })
      );
    },
    [messages]
  );

  const sendSelectedItems = (messageId: string): void => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.selectedItems?.length) {
      const itemsList = message.selectedItems
        .map((item) => `${item.name} (Qty: ${item.desiredQuantity})`)
        .join(", ");
      sendMessage(`Selected items: ${itemsList}`);
    }
  };

  // Quick actions for different stages
  const sendQuickAction = (action: string, data?: string): void => {
    switch (action) {
      case "confirm_yes":
        sendMessage("Yes, proceed");
        break;
      case "confirm_no":
        sendMessage("No, let me change that");
        break;
      case "get_quotes":
        sendMessage("Request quotes from multiple suppliers");
        break;
      case "use_ks_number":
        sendMessage("I have a specific KS number to use");
        break;
      case "show_projects":
        setShowProjectModal(true);
        break;
      default:
        if (data) {
          sendMessage(data);
        }
    }
  };

  // Keyboard handling
  const onComposerKeydown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (canSend && !pending) {
        sendMessage();
      }
    }
  };

  // Resend message
  const resendMessage = (message: ChatMessage): void => {
    if (pending || !message?.resendPayload) return;
    sendMessage(message.resendPayload.text, message.resendPayload.file);
  };

  // Get progress percentage
  const progressPercentage = Math.round((requestState.stage / 9) * 100);

  // Get stage label
  const getStageLabel = (action: string): string => {
    const labels: Record<string, string> = {
      detect_intent: "Understanding request",
      set_source: "Setting source",
      show_items: "Selecting items",
      confirm_items: "Confirming items",
      set_delivery_date: "Setting delivery",
      select_project: "Choosing location",
      set_supplier_mode: "Supplier selection",
      final_confirm: "Final review",
      request_items: "Request submitted",
    };
    return labels[action] || "Getting started";
  };

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col items-end ">
      {/* Chat Widget */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[450px] sm:h-[500px] max-h-[calc(100vh-120px)] rounded-2xl border border-gray-200 bg-white shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-2 fade-in-0 duration-300">
          {/* Header */}
          <div
            className="relative bg-keyman-green"
            style={{ backgroundColor: "#3D6B2C" }}
          >
            <div className="flex items-center justify-between p-3 md:p-4 text-white">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur ring-1 ring-white/30 grid place-items-center shadow-lg">
                  <Image
                    src="/keyman_logo.png"
                    alt="Keyman Logo"
                    className="h-5 w-5"
                  />
                </div>
                <div>
                  <div className="text-sm font-bold">Keyman Assistant</div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                {/* Clear Chat Button */}
                <button
                  onClick={clearChat}
                  className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
                  title="Clear chat"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                {/* Close Button */}
                {onToggle && (
                  <button
                    onClick={onToggle}
                    className="h-7 w-7 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center ml-1"
                    title="Close chat"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Chat Container */}
          <div className="flex-1 p-3 md:p-4 bg-gray-50 flex flex-col min-h-0">
            <div
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto rounded-lg bg-white p-3 space-y-3 shadow-inner mb-3"
            >
              {/* Empty State */}
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-12 w-12 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1"
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  <p className="text-sm font-medium text-center">
                    Ready to help you request materials
                  </p>
                  <p className="text-xs text-gray-400 mt-1 text-center">
                    Tell me what construction materials you need
                  </p>
                </div>
              )}

              {/* Messages */}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* Assistant Avatar */}
                  {message.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full text-white grid place-items-center text-xs font-bold shadow-md">
                        <Image
                          src="/keyman_logo.png"
                          alt="Keyman Logo"
                          className="h-6 w-6"
                        />
                      </div>
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`group relative max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      message.role === "user"
                        ? "bg-keyman-green text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {/* Message Content */}
                    <div className="prose prose-sm max-w-none">
                      {message.role === "user" ? (
                        <span className="whitespace-pre-wrap leading-relaxed">
                          {message.content}
                        </span>
                      ) : (
                        <div
                          className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHtml(
                              renderMarkdown(message.content)
                            ),
                          }}
                        />
                      )}
                    </div>

                    {/* Resend Button for User Messages */}
                    {message.role === "user" && message.canResend && (
                      <button
                        onClick={() => resendMessage(message)}
                        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full bg-white shadow-md grid place-items-center text-keyman-green hover:bg-keyman-green-50"
                        title="Resend message"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                    )}

                    {/* Attachments */}
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.attachments.map((att, i) => (
                          <div key={i}>
                            {att.type === "image" ? (
                              <img
                                src={att.url}
                                className="rounded-lg max-h-48 object-cover w-full border border-white/20"
                                alt="Attachment"
                              />
                            ) : att.type === "audio" ? (
                              <audio
                                src={att.url}
                                controls
                                className="w-full"
                              />
                            ) : null}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Show Items Grid */}
                    {message.action === "show_items" &&
                      message.items &&
                      message.items.length > 0 && (
                        <div className="mt-4 space-y-4">
                          <div className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            Available Materials
                          </div>

                          <div className="grid gap-3">
                            {message.items.map((item, idx) => (
                              <div
                                key={idx}
                                className={`border rounded-xl p-3 transition-all duration-200 cursor-pointer hover:shadow-md ${
                                  item.selected
                                    ? "border-keyman-green 0"
                                    : "border-gray-200 hover:border-gray-300 bg-white"
                                }`}
                                onClick={() =>
                                  toggleItemSelection(message.id, idx)
                                }
                              >
                                <div className="flex gap-3">
                                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                    {item.photo ? (
                                      <img
                                        src={item.photo}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center">
                                        <Package className="h-6 w-6 text-gray-400" />
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between">
                                      <h4 className="font-semibold text-gray-900 text-sm">
                                        {item.name}
                                      </h4>
                                      <div
                                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                          item.selected
                                            ? "border-keyman-green bg-keyman-green"
                                            : "border-gray-300"
                                        }`}
                                      >
                                        {item.selected && (
                                          <Check className="w-3 h-3 text-white" />
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                      {item.description}
                                    </p>

                                    <div className="flex items-center justify-between mt-3">
                                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            adjustItemQuantity(
                                              message.id,
                                              idx,
                                              -1
                                            );
                                          }}
                                          className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                        >
                                          <span className="text-sm">−</span>
                                        </button>
                                        <span className="text-sm font-medium w-8 text-center">
                                          {item.desiredQuantity}
                                        </span>
                                        <button
                                          onClick={(e) => {
                                            // e.stopPropagation();
                                            adjustItemQuantity(
                                              message.id,
                                              idx,
                                              1
                                            );
                                          }}
                                          className="w-6 h-6 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50"
                                        >
                                          <span className="text-sm">+</span>
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {message.selectedItems &&
                            message.selectedItems.length > 0 && (
                              <button
                                onClick={() => sendSelectedItems(message.id)}
                                className="w-full bg-keyman-green text-white px-4 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-keyman-green-hover transition-all shadow-md"
                              >
                                <span className="text-lg">+</span>
                                Add {message.selectedItems.length} Items to
                                Request
                              </button>
                            )}
                        </div>
                      )}

                    {/* Project Selection */}
                    {message.action === "select_project" && (
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">
                            Choose delivery location
                          </span>
                          <button
                            onClick={() => sendQuickAction("show_projects")}
                            className="text-keyman-green hover:text-keyman-green-hover text-sm font-medium"
                          >
                            View All Projects
                          </button>
                        </div>

                        <div className="grid gap-2 max-h-48 overflow-y-auto">
                          {(message.projects && message.projects.length
                            ? message.projects
                            : availableProjects
                          ).map((project) => (
                            <div
                              key={project.id}
                              onClick={() => selectProject(project.id)}
                              className="border rounded-lg p-3 hover:border-keyman-green hover:bg-keyman-green-50 cursor-pointer transition-all bg-white"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-keyman-green-50 rounded-full flex items-center justify-center flex-shrink-0">
                                  <Building className="h-5 w-5 text-keyman-green" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-sm text-gray-900">
                                    {project.name}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <p className="text-xs text-gray-600">
                                      {project.address}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Supplier Mode Selection */}
                    {message.action === "supplier_mode_selection" && (
                      <div className="mt-4 space-y-3">
                        <p className="text-sm text-gray-700 mb-3">
                          How would you like to find suppliers?
                        </p>
                        <div className="grid gap-3">
                          <button
                            onClick={() => sendQuickAction("get_quotes")}
                            className="flex items-center gap-3 p-4 border border-keyman-green rounded-xl hover:bg-keyman-green-50 transition-all text-left bg-white"
                          >
                            <div className="w-10 h-10 bg-keyman-green-50 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-keyman-green" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Get Multiple Quotes
                              </h4>
                              <p className="text-xs text-gray-600">
                                Compare prices from nearby suppliers
                              </p>
                            </div>
                          </button>

                          <button
                            onClick={() => sendQuickAction("use_ks_number")}
                            className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-left bg-white"
                          >
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                              <Hash className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">
                                Use KS Number
                              </h4>
                              <p className="text-xs text-gray-600">
                                Order from a specific supplier directly
                              </p>
                            </div>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Final Confirmation */}
                    {message.action === "final_confirm" && (
                      <div className="mt-4 space-y-4">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Check className="h-5 w-5 text-green-600" />
                            <h3 className="font-semibold text-green-800">
                              Ready to Submit
                            </h3>
                          </div>
                          <p className="text-sm text-green-700">
                            Review your request details before submission.
                          </p>
                        </div>

                        <div className="flex gap-3">
                          <button
                            onClick={() => sendQuickAction("confirm_yes")}
                            className="flex-1 bg-keyman-green text-white px-4 py-3 rounded-xl font-semibold hover:bg-keyman-green-hover transition-all shadow-md"
                          >
                            Submit Request
                          </button>
                          <button
                            onClick={() => sendQuickAction("confirm_no")}
                            className="px-4 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                          >
                            Modify
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Request Submitted */}
                    {message.action === "request_items" && (
                      <div className="mt-4 space-y-4">
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Clock className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-800">
                                Request Submitted Successfully!
                              </h3>
                              <p className="text-sm text-blue-600">
                                Your materials request is now being processed.
                              </p>
                            </div>
                          </div>

                          <div className="bg-white rounded-lg p-3 border">
                            <h4 className="font-medium text-gray-900 text-sm mb-2">
                              Next Steps:
                            </h4>
                            <ul className="text-xs text-gray-600 space-y-1">
                              <li>
                                • Suppliers will receive your request within 10
                                minutes
                              </li>
                              <li>
                                • You'll get quotes/confirmations within 2-4
                                hours
                              </li>
                              <li>
                                • Payment is protected in escrow until delivery
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Generic Quick Actions */}
                    {[
                      "detect_intent",
                      "set_source",
                      "set_delivery_date",
                    ].includes(message.action || "") && (
                      <div className="mt-3">
                        <div className="flex flex-wrap gap-2">
                          {message.action === "detect_intent" && (
                            <button
                              onClick={() => sendQuickAction("confirm_yes")}
                              className="px-4 py-2 bg-keyman-green-50 text-keyman-green rounded-full text-sm font-medium hover:bg-keyman-green-100 transition-all"
                            >
                              Yes, check availability
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full grid place-items-center text-xs font-bold shadow-md">
                        <User2 />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Typing Indicator */}
              {pending && (
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full bg-keyman-green text-white grid place-items-center text-xs font-bold shadow-md">
                    AI
                  </div>
                  <div className="rounded-2xl px-4 py-3 bg-gray-100 shadow-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Processing</span>
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 rounded-full bg-keyman-green animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full bg-keyman-green animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></span>
                        <span
                          className="w-2 h-2 rounded-full bg-keyman-green animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input Section */}
            <div className="bg-white rounded-lg p-3 shadow-inner border border-gray-200 space-y-3">
              {/* Attachment Preview */}
              {(imagePreviewUrl || recordedUrl) && (
                <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
                  {imagePreviewUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={imagePreviewUrl}
                        className="h-8 w-8 object-cover rounded border"
                        alt="Preview"
                      />
                      <span className="text-xs text-gray-600">
                        Image attached
                      </span>
                    </div>
                  )}
                  {recordedUrl && !imagePreviewUrl && (
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 bg-red-100 rounded flex items-center justify-center">
                        <Mic className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-xs text-gray-600">
                        Audio recorded
                      </span>
                    </div>
                  )}
                  <button
                    onClick={removeAttachment}
                    className="ml-auto p-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}

              {/* Input Bar */}
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <textarea
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={onComposerKeydown}
                    disabled={pending}
                    rows={2}
                    placeholder="Describe materials needed..."
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-keyman-green focus:ring-1 focus:ring-keyman-green-200 text-sm resize-none transition-all duration-200 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {/* File Upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,audio/*"
                    className="hidden"
                    onChange={onPickFile}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={pending}
                    className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-keyman-green hover:border-keyman-green hover:bg-keyman-green-50 grid place-items-center transition-all duration-200 disabled:opacity-50"
                    title="Attach file"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>

                  {/* Voice Recording */}
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      disabled={pending}
                      className="h-8 w-8 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 grid place-items-center transition-all duration-200 disabled:opacity-50"
                      title="Record audio"
                    >
                      <Mic className="h-4 w-4" />
                    </button>
                  ) : (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={stopRecording}
                        className="relative h-8 w-8 rounded-full bg-red-500 text-white hover:bg-red-600 grid place-items-center transition-all duration-200 shadow-md"
                        title="Stop recording"
                      >
                        <MicOff className="h-4 w-4" />
                        <span className="absolute -inset-0.5 rounded-full bg-red-400 animate-ping opacity-75"></span>
                      </button>
                      <div className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full">
                        <span className="text-xs text-red-600 font-medium">
                          Rec
                        </span>
                        <div className="flex gap-0.5">
                          <span className="w-0.5 h-2 bg-red-500 rounded-sm animate-pulse"></span>
                          <span
                            className="w-0.5 h-3 bg-red-500 rounded-sm animate-pulse"
                            style={{ animationDelay: "100ms" }}
                          ></span>
                          <span
                            className="w-0.5 h-2 bg-red-500 rounded-sm animate-pulse"
                            style={{ animationDelay: "200ms" }}
                          ></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Send Button */}
                <button
                  disabled={!canSend || pending}
                  onClick={() => sendMessage()}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg font-medium text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-keyman-green hover:bg-keyman-green-hover transition-all duration-200"
                >
                  <span className="text-sm">
                    {pending ? "Sending..." : "Send"}
                  </span>
                  <Send className="h-3 w-3" />
                </button>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-gray-400 pt-2">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        webhookUrl ? "bg-green-500" : "bg-gray-300"
                      }`}
                    ></span>
                    {webhookUrl ? "Connected" : "Not configured"}
                  </span>
                </div>
                <a
                  href="/Keymanstores, principle guidlines and codes of doing business.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-keyman-green hover:text-keyman-green-hover hover:underline"
                >
                  Code of conduct
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Toggle Button */}
      <button
        onClick={onToggle}
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 grid place-items-center ${
          isOpen
            ? "bg-gray-600 hover:bg-gray-700"
            : "bg-keyman-green hover:bg-keyman-green-hover"
        }`}
        title={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <X className="h-6 w-6 text-white" />
        ) : (
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            {/* Notification badge for new messages */}
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
              !
            </span>
          </div>
        )}
      </button>
    </div>
  );
};

export default RequestChat;
