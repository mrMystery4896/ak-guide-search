declare module "youtube-video" {
  export interface YoutubeVideo {
    kind: string;
    etag: string;
    items: Item[];
    pageInfo: PageInfo;
  }

  interface Item {
    kind: string;
    etag: string;
    id: string;
    snippet: Snippet;
  }

  interface Snippet {
    publishedAt: Date;
    channelId: string;
    title: string;
    description: string;
    thumbnails: Thumbnails;
    channelTitle: string;
    tags: string[];
    categoryId: string;
    liveBroadcastContent: string;
    localized: Localized;
    defaultAudioLanguage: string;
  }

  interface Localized {
    title: string;
    description: string;
  }

  interface Thumbnails {
    default: Default;
    medium: Default;
    high: Default;
    standard: Default;
    maxres: Default;
  }

  interface Default {
    url: string;
    width: number;
    height: number;
  }

  interface PageInfo {
    totalResults: number;
    resultsPerPage: number;
  }
}
