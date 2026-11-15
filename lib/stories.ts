import data from "@/data/universities/demo/stories.json";

export type Story = {
  id: string;
  kind: string;
  title: string;
  name: string;
  meta: string;
  quote: string;
  video: string | null;
  sections: string[][];
  points: string[];
};
export const STORIES = data.stories as Story[];
export const STORY_NOTE = data.note;
