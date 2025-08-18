/* eslint-disable*/
//@ts-ignore
import { Image } from "@mantine/core";
import { User2 } from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";

// Type definitions
interface ContractChatProps {
  userToken: string;
  sessionId: string;
  supplierId?: string | null;
  contractId?: string | null;
  userType?: "user" | "supplier";
  onClose?: () => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  attachments?: Attachment[];
  options?: string[];
  action?: string;
  canResend?: boolean;
  resendPayload?: {
    chatInput: string;
    file: File | null;
  };
}

interface Attachment {
  type: "image" | "audio";
  url: string;
}

interface ChatState {
  baseUrlProd: string;
  baseUrlTest: string;
  env: "test" | "prod";
  userType: "user" | "supplier";
  userToken: string;
}

interface LocalStorageKeys {
  baseUrlProd: string;
  baseUrlTest: string;
  env: string;
  userType: string;
  userToken: string;
}

interface AssistantResponse {
  json?: any;
  output?: any;
  content?: string;
  message?: string;
  options?: string | string[];
  action?: string;
}

const ContractChat: React.FC<ContractChatProps> = ({
  userToken,
  sessionId,
  supplierId = null,
  contractId = null,
  userType = "user",
  onClose,
}) => {
  // Extracted from n8n workflow JSON → Webhook.path
  const N8N_WEBHOOK_PATH = "31202e0d-7ed4-4b6e-9368-4ae8d97302cd";

  // Local storage keys
  const LS_KEYS: LocalStorageKeys = {
    baseUrlProd: "contract_base_url_prod",
    baseUrlTest: "contract_base_url_test",
    env: "contract_env",
    userType: "contract_user_type",
    userToken: "contract_user_token",
  };

  // Local storage prefix for chat history per session
  const CHAT_STORAGE_PREFIX = "contract_chat_history_";

  const defaultState: ChatState = {
    baseUrlProd: "https://kimari.app.n8n.cloud",
    baseUrlTest: "https://kimari.app.n8n.cloud",
    env: "prod", // 'test' | 'prod'
    userType, // 'user' | 'supplier'
    userToken: userToken,
  };

  // State management
  const [state, setState] = useState<ChatState>({
    baseUrlProd:
      localStorage.getItem(LS_KEYS.baseUrlProd) || defaultState.baseUrlProd,
    baseUrlTest:
      localStorage.getItem(LS_KEYS.baseUrlTest) || defaultState.baseUrlTest,
    env:
      (localStorage.getItem(LS_KEYS.env) as "test" | "prod") ||
      defaultState.env,
    userType:
      (localStorage.getItem(LS_KEYS.userType) as "user" | "supplier") ||
      defaultState.userType,
    userToken:
      localStorage.getItem(LS_KEYS.userToken) || defaultState.userToken,
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");
  const [chatInput, setChatInput] = useState<string>("");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [lastSend, setLastSend] = useState<{
    chatInput: string;
    file: File | null;
  } | null>(null);
  const [isRestoringFromStorage, setIsRestoringFromStorage] =
    useState<boolean>(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Computed values
  const isTest: boolean = state.env === "test";
  const resolvedBaseUrl: string = (
    isTest ? state.baseUrlTest : state.baseUrlProd
  ).replace(/\/$/, "");
  const webhookUrl: string = resolvedBaseUrl
    ? `${resolvedBaseUrl}/${
        isTest ? "webhook-test" : "webhook"
      }/${N8N_WEBHOOK_PATH}`
    : "";
  const canSend: boolean =
    !!webhookUrl && (!!chatInput?.trim() || !!selectedFile || !!recordedBlob);

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEYS.baseUrlProd, state.baseUrlProd || "");
  }, [state.baseUrlProd]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.baseUrlTest, state.baseUrlTest || "");
  }, [state.baseUrlTest]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.env, state.env);
  }, [state.env]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.userType, state.userType);
  }, [state.userType]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.userToken, state.userToken);
  }, [state.userToken]);

  // Chat storage functions
  const getChatStorageKey = (id?: string): string | null => {
    const keySession = typeof id === "string" ? id : sessionId;
    if (!keySession) return null;
    return `${CHAT_STORAGE_PREFIX}${keySession}`;
  };

  const sanitizeRestoredMessage = (msg: any): ChatMessage | null => {
    if (!msg || typeof msg !== "object") return null;
    const { id, role, content, options, action } = msg;
    return {
      id: id || `${Date.now()}-restored`,
      role: role === "user" ? "user" : "assistant",
      content: String(content ?? ""),
      options: Array.isArray(options) ? options : [],
      action: action || "",
    };
  };

  const restoreMessagesFromStorage = (id: string): void => {
    const key = getChatStorageKey(id);
    if (!key) {
      setMessages([]);
      return;
    }
    try {
      const raw = localStorage.getItem(key);
      if (!raw) {
        setMessages([]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        setMessages([]);
        return;
      }
      setIsRestoringFromStorage(true);
      setMessages(
        parsed
          .map(sanitizeRestoredMessage)
          .filter((msg): msg is ChatMessage => msg !== null)
      );
    } catch (_) {
      setMessages([]);
    } finally {
      setTimeout(() => {
        setIsRestoringFromStorage(false);
        if (messages.length > 0) {
          scrollToBottom();
        }
      }, 0);
    }
  };

  const persistMessagesToStorage = useCallback((): void => {
    const key = getChatStorageKey();
    if (!key) return;
    try {
      const compact = messages.map(
        ({ id, role, content, options, action }) => ({
          id,
          role,
          content,
          options,
          action,
        })
      );
      localStorage.setItem(key, JSON.stringify(compact));
    } catch (_) {}
  }, [messages, sessionId]);

  // Restore messages when sessionId changes
  useEffect(() => {
    restoreMessagesFromStorage(sessionId);
  }, [sessionId]);

  // Persist messages on changes (except while restoring)
  useEffect(() => {
    if (isRestoringFromStorage) return;
    persistMessagesToStorage();
  }, [messages, isRestoringFromStorage, persistMessagesToStorage]);

  // Lightweight Markdown → HTML renderer
  const renderMarkdown = (md: string): string => {
    if (!md || typeof md !== "string") return "";
    // Escape HTML
    md = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    // Fenced code blocks
    md = md.replace(
      /```([\s\S]*?)```/g,
      (m, code) => `<pre><code>${code.trim()}</code></pre>`
    );
    // Inline code
    md = md.replace(/`([^`]+)`/g, "<code>$1</code>");
    // Headings
    md = md
      .replace(/^###\s+(.+)$/gm, "<h3>$1</h3>")
      .replace(/^##\s+(.+)$/gm, "<h2>$1</h2>")
      .replace(/^#\s+(.+)$/gm, "<h1>$1</h1>");
    // Bold/italic
    md = md.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    md = md.replace(/\*(?!\s)([^*]+)(?!\s)\*/g, "<em>$1</em>");
    md = md.replace(/_(?!\s)([^_]+)(?!\s)_/g, "<em>$1</em>");
    // Lists
    md = md.replace(/^(?:- |\* )(.*)$/gm, "<li>$1</li>");
    md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, (m) => `<ul>${m}</ul>`);
    md = md.replace(/^(\d+)\.\s+(.*)$/gm, "<li>$2</li>");
    md = md.replace(/(<li>.*<\/li>)(\n<li>.*<\/li>)+/g, (m) => `<ol>${m}</ol>`);
    // Paragraphs
    md = md
      .split(/\n{2,}/)
      .map((block) => {
        if (/^\s*<(h1|h2|h3|ul|ol|pre|blockquote)/.test(block)) return block;
        if (/^\s*<li>/.test(block)) return `<ul>${block}</ul>`;
        return `<p>${block.replace(/\n/g, "<br/>")}</p>`;
      })
      .join("\n");
    return md;
  };

  // Safer HTML sanitizer
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

  // Try parsing a JSON string safely
  const safeJsonParse = (str: string): any | null => {
    if (typeof str !== "string") return null;
    try {
      const v = JSON.parse(str);
      if (v && (typeof v === "object" || Array.isArray(v))) return v;
    } catch (_) {}
    return null;
  };

  // File handling
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0];
    if (!file) return;
    clearRecording();
    setSelectedFile(file);
    if (file.type.startsWith("image/")) {
      setImagePreviewUrl(URL.createObjectURL(file));
    } else {
      setImagePreviewUrl("");
    }
  };

  const removeAttachment = (): void => {
    setSelectedFile(null);
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl);
    setImagePreviewUrl("");
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
      setErrorText("Microphone access denied or unsupported browser.");
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

  // Scroll to bottom
  const scrollToBottom = (): void => {
    setTimeout(() => {
      try {
        chatContainerRef.current?.scrollTo({
          top: chatContainerRef.current.scrollHeight,
          behavior: "smooth",
        });
      } catch (_) {}
    }, 0);
  };

  // Keyboard handler
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

  // Build attachment preview
  const buildAttachmentPreview = (
    fileOpt: File | null = null
  ): Attachment[] => {
    const attachments: Attachment[] = [];
    const f = fileOpt || selectedFile;
    if (f) {
      if (f.type?.startsWith("image/")) {
        const url =
          f === selectedFile ? imagePreviewUrl : URL.createObjectURL(f);
        attachments.push({ type: "image", url });
      } else if (f.type?.startsWith("audio/")) {
        attachments.push({ type: "audio", url: URL.createObjectURL(f) });
      } else if (recordedUrl) {
        attachments.push({ type: "audio", url: recordedUrl });
      }
    } else if (recordedUrl) {
      attachments.push({ type: "audio", url: recordedUrl });
    }
    return attachments;
  };

  // Normalize assistant response
  const normalizeAssistantResponse = (
    payload: AssistantResponse | AssistantResponse[] | any
  ): ChatMessage => {
    let contentText = "";
    let options: string[] = [];
    let action = "";

    if (Array.isArray(payload)) {
      const first = payload[0]?.json || payload[0] || {};
      let output = first.output || first;
      const maybeParsedOutput =
        typeof output === "string" ? safeJsonParse(output) : null;
      if (maybeParsedOutput) output = maybeParsedOutput;
      contentText = String(
        output?.content ?? output?.message ?? first?.message ?? ""
      );
      const parsedOptions =
        typeof output?.options === "string"
          ? safeJsonParse(output.options)
          : output?.options;
      options = Array.isArray(parsedOptions) ? parsedOptions : [];
      action = output.action || "";
    } else if (payload && typeof payload === "object") {
      const obj = payload.json || payload;
      let output = obj.output || obj;
      const maybeParsedOutput =
        typeof output === "string" ? safeJsonParse(output) : null;
      if (maybeParsedOutput) output = maybeParsedOutput;
      contentText = String(
        output?.content ?? output?.message ?? obj?.message ?? ""
      );
      const parsedOptions =
        typeof output?.options === "string"
          ? safeJsonParse(output.options)
          : output?.options;
      options = Array.isArray(parsedOptions) ? parsedOptions : [];
      action = output.action || "";
    } else {
      contentText = String(payload ?? "");
    }

    return {
      id: `${Date.now()}-a`,
      role: "assistant",
      content: contentText,
      options,
      action,
    };
  };

  // Send message
  const sendMessage = async (
    messageText: string | null = null,
    fileOverride: File | null = null
  ): Promise<void> => {
    setErrorText("");
    if (!webhookUrl) {
      setErrorText("Please set the n8n base URL first.");
      return;
    }
    if (!sessionId) {
      setErrorText("Missing session in URL (?session=...)");
      return;
    }

    const textToSend = messageText || chatInput?.trim();
    const fileToUse = fileOverride || selectedFile;
    const userPayloadPreview =
      textToSend ||
      (fileToUse
        ? `[${
            fileToUse.type?.startsWith("image/") ? "Image" : "Audio"
          } attachment]`
        : "");
    const localId = `${Date.now()}`;

    if (userPayloadPreview) {
      // Mark all previous user messages as non-resendable
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = [...updated]
          .reverse()
          .findIndex((m) => m.role === "user");
        if (lastIndex !== -1) {
          const absoluteIdx = updated.length - 1 - lastIndex;
          if (updated[absoluteIdx]) updated[absoluteIdx].canResend = false;
        }

        updated.push({
          id: localId,
          role: "user",
          content: userPayloadPreview,
          attachments: buildAttachmentPreview(fileToUse),
          canResend: true,
          resendPayload: {
            chatInput: textToSend || "",
            file: fileToUse || null,
          },
        });

        return updated;
      });
    }

    setPending(true);
    scrollToBottom();

    const form = new FormData();
    if (fileToUse) form.append("file", fileToUse);
    form.append("chatInput", textToSend || "");
    form.append("sessionId", sessionId);

    if (supplierId) {
      form.append("supplierId", supplierId);
      if (contractId) form.append("contractId", contractId);
    }

    form.append("workflow", "keyman_contract"); // Always use contract workflow
    form.append("user_type", supplierId ? "SERVICE_PROVIDER" : "CLIENT");
    form.append("user_token", state.userToken || "");

    setLastSend({
      chatInput: textToSend || "",
      file: fileToUse || null,
    });

    try {
      const res = await fetch(webhookUrl, { method: "POST", body: form });
      const contentType = res.headers.get("content-type") || "";
      let assistantPayload: any = null;

      if (contentType.includes("application/json")) {
        assistantPayload = await res.json();
      } else {
        const text = await res.text();
        try {
          assistantPayload = JSON.parse(text);
        } catch (_) {
          assistantPayload = { action: "message", content: text };
        }
      }

      const assistantContent = normalizeAssistantResponse(assistantPayload);
      setMessages((prev) => [...prev, assistantContent]);
    } catch (err) {
      setErrorText("Failed to reach assistant. Check network or URL settings.");
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

  const selectOption = (option: string): void => {
    sendMessage(option);
  };

  const resendLast = (): void => {
    if (!lastSend || pending) return;
    sendMessage(lastSend.chatInput, lastSend.file || null);
  };

  const resendMessageFromBubble = (msg: ChatMessage): void => {
    if (pending || !msg?.resendPayload) return;
    sendMessage(msg.resendPayload.chatInput, msg.resendPayload.file || null);
  };

  const clearChat = (): void => {
    setMessages([]);
    persistMessagesToStorage();
  };

  const updateState = <K extends keyof ChatState>(
    key: K,
    value: ChatState[K]
  ): void => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="w-full h-full rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="relative bg-keyman-green">
        <div className="flex items-center justify-between p-4 md:p-5 text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/20 backdrop-blur ring-1 ring-white/30 grid place-items-center shadow-lg">
              <Image alt="" src="/keyman_logo.png" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 hidden"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <div className="text-lg font-bold">Contract Assistant</div>
              <div className="text-xs opacity-90">Powered by Keyman</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Close Button */}
            {onClose && (
              <button
                onClick={onClose}
                className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
                title="Close"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>

          <div className="hidden flexy items-center gap-2 flex-wrap justify-end">
            {/* Environment Toggle */}
            <div className="bg-white/20 backdrop-blur rounded-full p-0.5 flex items-center shadow-inner">
              <button
                onClick={() => updateState("env", "test")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  state.env === "test"
                    ? "bg-white text-keyman-green shadow-md"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Test
              </button>
              <button
                onClick={() => updateState("env", "prod")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  state.env === "prod"
                    ? "bg-white text-keyman-green shadow-md"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Production
              </button>
            </div>

            {/* User Type Toggle */}
            <div className="bg-white/20 backdrop-blur rounded-full p-0.5 flex items-center shadow-inner">
              <button
                onClick={() => updateState("userType", "user")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  state.userType === "user"
                    ? "bg-white text-keyman-green shadow-md"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Client
              </button>
              <button
                onClick={() => updateState("userType", "supplier")}
                className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all duration-200 ${
                  state.userType === "supplier"
                    ? "bg-white text-keyman-green shadow-md"
                    : "text-white/90 hover:text-white"
                }`}
              >
                Supplier
              </button>
            </div>

            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
              title="Settings"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.3-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.08-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64z"
                />
              </svg>
            </button>

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="h-9 w-9 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 grid place-items-center"
              title="Clear chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M19 4h-3.5l-1-1h-5l-1 1H5v2h14M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && false && (
        <div className="px-4 md:px-6 py-4 bg-gray-50 border-b border-gray-200 transition-all duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                n8n Base URL (Production)
              </label>
              <input
                value={state.baseUrlProd}
                onChange={(e) => updateState("baseUrlProd", e.target.value)}
                type="url"
                placeholder="https://n8n.example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-keyman-green focus:ring-2 focus:ring-keyman-green text-sm transition-colors"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Endpoint: {(state.baseUrlProd || "...").replace(/\/$/, "")}
                /webhook/{N8N_WEBHOOK_PATH}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                n8n Base URL (Test)
              </label>
              <input
                value={state.baseUrlTest}
                onChange={(e) => updateState("baseUrlTest", e.target.value)}
                type="url"
                placeholder="https://n8n.example.com"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-keyman-green focus:ring-2 focus:ring-keyman-green text-sm transition-colors"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Endpoint: {(state.baseUrlTest || "...").replace(/\/$/, "")}
                /webhook-test/{N8N_WEBHOOK_PATH}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                User Token
              </label>
              <input
                value={state.userToken}
                onChange={(e) => updateState("userToken", e.target.value)}
                type="text"
                placeholder="Enter your API token"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-keyman-green focus:ring-2 focus:ring-keyman-green text-sm font-mono transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Session ID
              </label>
              <input
                value={sessionId || "No session specified"}
                disabled
                className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100 text-gray-600 text-sm"
              />
              <p className="mt-1 text-[11px] text-gray-500">
                Add ?session=YOUR_ID to URL to set session
              </p>
            </div>
          </div>

          <div className="mt-3 p-3  rounded-lg border border-keyman-green-200">
            <div className="flex items-start gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-keyman-green mt-0.5"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2"
                />
              </svg>
              <div className="text-xs text-keyman-green-800">
                <strong>Active Configuration:</strong>
                {state.env === "test" ? " Test" : " Production"} environment •
                {state.userType === "user" ? " Client" : " Supplier"} mode •
                Contract workflow
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 p-4 md:p-6 bg-gray-50 flex flex-col min-h-0">
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto rounded-xl bg-white p-4 space-y-4 shadow-inner mb-4"
        >
          {/* Empty State */}
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1"
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm font-medium">
                Start a conversation about your contract
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Type a message or use voice/image input
              </p>
            </div>
          )}

          {/* Messages */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {/* Assistant Avatar */}
              {msg.role === "assistant" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full text-white grid place-items-center text-xs font-bold shadow-md">
                    <Image src="/keyman_logo.png" alt="Keyman Logo" />
                  </div>
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`group relative max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                  msg.role === "user"
                    ? "bg-keyman-green text-white"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {/* Message Content */}
                <div className="prose prose-sm max-w-none">
                  {msg.role === "user" ? (
                    <span className="whitespace-pre-wrap leading-relaxed">
                      {msg.content}
                    </span>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none [&>p]:mb-2 [&>p:last-child]:mb-0"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(renderMarkdown(msg.content)),
                      }}
                    />
                  )}
                </div>

                {/* Resend Button for User Messages */}
                {msg.role === "user" && msg.canResend && (
                  <button
                    onClick={() => resendMessageFromBubble(msg)}
                    className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 rounded-full bg-white shadow-md grid place-items-center text-keyman-green hover:bg-keyman-green-50"
                    title="Resend message"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4z"
                      />
                    </svg>
                  </button>
                )}

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.attachments.map((att, i) => (
                      <div key={i}>
                        {att.type === "image" ? (
                          <Image
                            src={att.url}
                            className="rounded-lg max-h-48 object-cover w-full border border-white/20"
                            alt="Attachment"
                          />
                        ) : att.type === "audio" ? (
                          <audio src={att.url} controls className="w-full" />
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}

                {/* Quick Action Options */}
                {msg.options &&
                  msg.options.length > 0 &&
                  msg.role === "assistant" && (
                    <div className="mt-4">
                      <div className="text-xs font-semibold text-gray-600 mb-2">
                        Suggested actions:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.options.map((option, idx) => (
                          <button
                            key={idx}
                            onClick={() => selectOption(option)}
                            className="px-3 py-1.5 rounded-full bg-white border border-gray-300 text-gray-700 text-xs font-medium hover:bg-keyman-green-50 hover:border-keyman-green-300 hover:text-keyman-green-700 transition-all duration-200"
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full   grid place-items-center text-xs font-bold shadow-md">
                    {/*{state.userType === "user" ? "C" : "S"}*/}
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
        <div className="bg-white rounded-xl p-4 shadow-inner border border-gray-200 space-y-3">
          {/* Attachment Preview */}
          {(imagePreviewUrl || recordedUrl) && (
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200">
              {imagePreviewUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={imagePreviewUrl}
                    className="h-12 w-12 object-cover rounded-lg border"
                    alt="Preview"
                  />
                  <span className="text-sm text-gray-600">Image attached</span>
                </div>
              )}
              {recordedUrl && !imagePreviewUrl && (
                <div className="flex items-center gap-3">
                  <audio src={recordedUrl} controls className="h-10" />
                  <span className="text-sm text-gray-600">Audio recorded</span>
                </div>
              )}
              <button
                onClick={removeAttachment}
                className="ml-auto px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          )}

          {/* Input Bar */}
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <textarea
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={onComposerKeydown}
                rows={3}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-keyman-green focus:ring-2 focus:ring-keyman-green-200 text-sm resize-none transition-all duration-200"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
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
                className="h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-keyman-green hover:border-keyman-green hover:bg-keyman-green-50 grid place-items-center transition-all duration-200"
                title="Attach file"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6z"
                  />
                </svg>
              </button>

              {/* Voice Recording */}
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="h-10 w-10 rounded-full border border-gray-300 bg-white text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 grid place-items-center transition-all duration-200"
                  title="Record audio"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="currentColor"
                      d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3m5.91-3c-.49 0-.9.36-.98.85C16.52 14.2 14.47 16 12 16s-4.52-1.8-4.93-4.15a.998.998 0 0 0-.98-.85c-.61 0-1.09.54-1 1.14c.49 3 2.89 5.35 5.91 5.78V20c0 .55.45 1 1 1s1-.45 1-1v-2.08c3.02-.43 5.42-2.78 5.91-5.78c.1-.6-.39-1.14-1-1.14"
                    />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={stopRecording}
                    className="relative h-10 w-10 rounded-full bg-red-500 text-white hover:bg-red-600 grid place-items-center transition-all duration-200 shadow-md"
                    title="Stop recording"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <path fill="currentColor" d="M6 6h12v12H6z" />
                    </svg>
                    <span className="absolute -inset-1 rounded-full bg-red-400 animate-ping opacity-75"></span>
                  </button>
                  <div className="flex items-center gap-1 px-3 py-1 bg-red-50 rounded-full">
                    <span className="text-xs text-red-600 font-medium">
                      Recording
                    </span>
                    <div className="flex gap-0.5">
                      <span className="w-1 h-3 bg-red-500 rounded-sm animate-pulse"></span>
                      <span
                        className="w-1 h-4 bg-red-500 rounded-sm animate-pulse"
                        style={{ animationDelay: "100ms" }}
                      ></span>
                      <span
                        className="w-1 h-2 bg-red-500 rounded-sm animate-pulse"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-medium text-white
               shadow-md disabled:opacity-50 disabled:cursor-not-allowed bg-keyman-green hover:bg-keyman-green-hover  transition-all duration-200 transform hover:scale-105"
            >
              <span>{pending ? "Sending..." : "Send"}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
              >
                <path fill="currentColor" d="M2 21l21-9L2 3v7l15 2l-15 2z" />
              </svg>
            </button>
          </div>

          {/* Error Message */}
          {errorText && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-red-600"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m1 15h-2v-2h2zm0-4h-2V7h2z"
                />
              </svg>
              <span className="text-sm text-red-700">{errorText}</span>
            </div>
          )}

          {/* Status Bar */}
          <div className="flex items-center justify-between text-[11px] text-gray-500">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    webhookUrl ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></span>
                {webhookUrl ? "Connected" : "Not configured"}
              </span>
              <a
                href="/Keymanstores, principle guidlines and codes of doing business.pdf"
                target="_blank"
                onClick={() => window.location.reload()}
                rel="noopener noreferrer"
                className="text-keyman-green hover:text-keyman-green-hover hover:underline"
              >
                Code of conduct
              </a>
              {/*sessionId && <span>Session: {sessionId}</span>*/}
            </div>

            {webhookUrl && false && (
              <div className="text-gray-400">
                {state.env === "test" ? "Test Mode" : "Production"} •{" "}
                {state.userType === "user" ? "Client" : "Supplier"}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractChat;
