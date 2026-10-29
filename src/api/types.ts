/** Shapes of the existing backend's responses (fields are optional because the API is untyped). */

export type ProfileRef = { profile_ref?: string | null; profile_picture?: string | null };

export type ApiUser = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  profile?: ProfileRef | null;
};

export type PostMedia = {
  id?: number;
  image?: string | null;
  caption?: string | null;
  uploaded_at?: string;
  is_video?: boolean;
  video?: string | null;
};

export type Comment = {
  id?: number;
  content: string;
  posted_at?: string;
  user?: ApiUser;
};

export type Post = {
  ref: string;
  content: string;
  location?: string;
  posted_at?: string;
  images?: PostMedia[];
  likes?: unknown[];
  comments?: Comment[];
  user?: ApiUser;
};

export type Profile = {
  id?: number | string;
  profile_ref?: string | null;
  profile_picture?: string | null;
  cover_photo?: string | null;
  bio?: string | null;
  profession?: string | null;
  phone_number?: string | null;
  email?: string | null;
  bio_url?: string | null;
  address?: string | null;
  location?: string | null;
  postal_code?: string | null;
  gender?: string | null;
  is_verified?: boolean;
  date_joined?: string | null;
  user?: ApiUser;
};

export type ProfileResponse = {
  profile?: Profile;
  posts?: Post[];
  user_comments?: unknown[];
};

export type ProfilePreview = {
  id: number | string;
  profile_picture?: string | null;
  profile_ref?: string | null;
  location?: string | null;
  bio?: string | null;
  user?: { first_name?: string; last_name?: string; username?: string };
};

export type Business = {
  id: number | string;
  name?: string;
  cover_photo?: string | null;
  location_town?: string | null;
  business_description?: string | null;
};

export type EventItem = {
  id: number | string;
  title?: string;
  cover_image?: string | null;
  location?: string | null;
  description?: string | null;
};

export type Article = {
  title?: string;
  description?: string | null;
  url?: string;
  urlToImage?: string | null;
  source?: { name?: string };
};

export type LocalFile = { uri: string; name: string; type: string };
