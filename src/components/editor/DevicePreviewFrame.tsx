import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Monitor, Tablet, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

export type PreviewDevice = "desktop" | "tablet" | "mobile";

export const DEVICE_WIDTHS: Record<Exclude<PreviewDevice, "desktop">, number> = {
  tablet: 768,
  mobile: 375,
};

/**
 * Renders the editor preview at a real emulated viewport width.
 * Tablet/mobile mount children into a same-origin iframe via a portal, so the
 * page's own responsive (media-query) styles apply exactly as on the published
 * page at that width — same components, no special mobile markup. Desktop
 * renders children inline, unchanged.
 */
export function DevicePreviewFrame({ device, children }: { device: PreviewDevice; children: ReactNode }) {
  if (device === "desktop") return <>{children}</>;
  return (
    <div className="flex-1 flex justify-center overflow-hidden bg-muted/40">
      <EmulatedViewport width={DEVICE_WIDTHS[device]}>{children}</EmulatedViewport>
    </div>
  );
}

function EmulatedViewport({ width, children }: { width: number; children: ReactNode }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [mount, setMount] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    const doc = iframe?.contentDocument;
    if (!iframe || !doc) return;

    doc.open();
    doc.write('<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>');
    doc.close();

    // Mirror the app's stylesheets (and keep mirroring: dev injects styles lazily).
    const clones = new Map<Node, Node>();
    const copyNode = (node: Node) => {
      if (clones.has(node)) return;
      const el = node as HTMLElement;
      const isStyle = el.tagName === "STYLE" || (el.tagName === "LINK" && (el as HTMLLinkElement).rel === "stylesheet");
      if (!isStyle) return;
      const clone = el.cloneNode(true);
      clones.set(node, clone);
      doc.head.appendChild(clone);
    };
    Array.from(document.head.children).forEach(copyNode);
    const headObserver = new MutationObserver((records) => {
      for (const r of records) {
        r.addedNodes.forEach(copyNode);
        r.removedNodes.forEach((n) => {
          const c = clones.get(n);
          if (c) { c.parentNode?.removeChild(c); clones.delete(n); }
        });
        if (r.type === "characterData" || r.type === "childList") {
          const styleEl = (r.target as Node).nodeType === 1 ? (r.target as HTMLElement) : r.target.parentElement;
          if (styleEl?.tagName === "STYLE" && clones.has(styleEl)) {
            (clones.get(styleEl) as HTMLElement).textContent = styleEl.textContent;
          }
        }
      }
    });
    headObserver.observe(document.head, { childList: true, subtree: true, characterData: true });

    // Mirror theme classes on <html>.
    const syncHtml = () => { doc.documentElement.className = document.documentElement.className; };
    syncHtml();
    const htmlObserver = new MutationObserver(syncHtml);
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    doc.documentElement.style.height = "100%";
    doc.body.style.margin = "0";
    doc.body.style.height = "100%";
    const root = doc.createElement("div");
    root.style.height = "100%";
    root.style.display = "flex";
    root.style.flexDirection = "column";
    doc.body.appendChild(root);
    setMount(root);

    return () => {
      headObserver.disconnect();
      htmlObserver.disconnect();
      setMount(null);
    };
  }, []);

  return (
    <iframe
      ref={iframeRef}
      title="Device preview"
      className="h-full border-x border-border bg-background"
      style={{ width, maxWidth: "100%" }}
    >
      {mount && createPortal(children, mount)}
    </iframe>
  );
}

const OPTIONS: { value: PreviewDevice; label: string; Icon: typeof Monitor }[] = [
  { value: "desktop", label: "Desktop", Icon: Monitor },
  { value: "tablet", label: "Tablet (768px)", Icon: Tablet },
  { value: "mobile", label: "Mobile (375px)", Icon: Smartphone },
];

export function DeviceToggle({ value, onChange }: { value: PreviewDevice; onChange: (d: PreviewDevice) => void }) {
  return (
    <div role="radiogroup" aria-label="Preview device" className="inline-flex items-center gap-0.5 rounded-md border border-border bg-background/80 p-0.5">
      {OPTIONS.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          aria-label={label}
          title={label}
          onClick={() => onChange(v)}
          className={cn(
            "rounded p-1 text-muted-foreground transition-colors hover:text-foreground",
            value === v && "bg-muted text-foreground"
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </button>
      ))}
    </div>
  );
}
