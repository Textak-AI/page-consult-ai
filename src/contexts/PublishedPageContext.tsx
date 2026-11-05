import { createContext, useContext, type ReactNode } from 'react';

interface PublishedPageInfo {
  /** The published page's id when this is the live page; null in the editor and previews. */
  publishedPageId: string | null;
  previewMode: boolean;
}

const PublishedPageContext = createContext<PublishedPageInfo>({ publishedPageId: null, previewMode: false });

export function PublishedPageProvider({ value, children }: { value: PublishedPageInfo; children: ReactNode }) {
  return <PublishedPageContext.Provider value={value}>{children}</PublishedPageContext.Provider>;
}

export function usePublishedPage(): PublishedPageInfo {
  return useContext(PublishedPageContext);
}
