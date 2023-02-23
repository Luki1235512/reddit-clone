import { Timestamp } from "firebase/firestore";
import { atom } from "recoil";

export interface Community {
    id: string;
    creatorId: string;
    numberOfMembers: number;
    privacyType: "public" | "restricted" | "private";
    createdAt?: Timestamp;
    imageURL?: string;
};

export interface CommunitySnippet {
    communityId: string;
    isModerator?: boolean;
    imageURL?: string;
}

interface CommunityState {
    [key: string]:
        | CommunitySnippet[]
        | {[key: string]: Community}
        | Community
        | boolean
        | undefined;
    mySnippets: CommunitySnippet[];
    initSnippetsFetched: boolean;
    visitedCommunities: {
        [key: string]: Community;
    }
    currentCommunity: Community;
}

export const defaultCommunity: Community = {
    id: "",
    creatorId: "",
    numberOfMembers: 0,
    privacyType: "public",
  };

export const defaultCommunityState: CommunityState = {
    mySnippets: [],
    initSnippetsFetched: false,
    visitedCommunities: {},
    currentCommunity: defaultCommunity,
};

export const CommunityState = atom<CommunityState>({
    key: "communitiesState",
    default: defaultCommunityState
});