export interface DesignVersion {
  id: string;
  imageUri: string;
  prompt: string;
  tweaks: {
    style: string;
    colorPalette: string;
    layout: string;
  };
  createdAt: string;
}

export interface DesignState {
  originalImage: string | null;
  versions: DesignVersion[];
  currentVersionId: string | null;
}