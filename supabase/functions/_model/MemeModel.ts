/*
 * Meme interface
 * Represents a meme object with properties and data types
*/
export interface Meme {
  meme_id?: string;  // UUID
  user_id: string;  // UUID
  meme_title: string;  // Meme title (string)
  media_file: string;  // URL to the meme image (string)
  created_at: string;  // Timestamp (string format)
  updated_at: string;  // Timestamp (string format)
  meme_status: "Pending" | "Approved" | "Rejected";  // Meme status (enum)
  like_count: number;  // Like count (integer)
  comment_count: number;  // Comment count (integer)
  flag_count: number;  // Flag count (integer)
  risk_score: number;  // Risk score (float)
  tags: string[];  // Tags (array of strings)
  is_contest: boolean; // Is this a contest (boolean)
}