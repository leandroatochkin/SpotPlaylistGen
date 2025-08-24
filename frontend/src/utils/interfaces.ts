interface SongItem {
    artists: string;
    input: string;
    track: string;
}

export interface PlaylistResponse {
    added: number;
    id: string;
    matched: SongItem[]
    unmatched: string[]
    url: string;
}