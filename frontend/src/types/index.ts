export interface UserProfile {
    id: number;
    username: string;
    email: string;
    phone: string;
    role: string;
    bio: string | null;
    institute: string | null;
    profile_url: string;
    pfp?: string; // fallback
}

export interface University {
    name: string;
    domains: string[];
    web_pages: string[];
    country: string;
    alpha_two_code: string;
    "state-province": string | null;
}
