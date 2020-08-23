export interface TaskCreateModel {
  tag?: string;
  raw?: boolean;
  isStatic?: boolean;
  isRootInsert: boolean;
  isComment: boolean;
}