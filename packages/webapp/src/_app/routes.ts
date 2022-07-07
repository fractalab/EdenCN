import React from "react";
import {
    CommunityNav,
    DelegationNav,
    ElectionNav,
    HomeNav,
    MembershipNav,
    TreasuryNav,
} from "_app/ui/nav-icons";

export interface Route {
    href: string;
    label: string;
    Icon: React.ComponentType;
    exactPath?: boolean;
    hideNav?: boolean;
    requiresActiveCommunity?: boolean;
    requiresCompletedElection?: boolean;
    requiresMembership?: boolean;
}

export const ROUTES: { [key: string]: Route } = {
    HOME: {
        href: "/",
        label: "首頁",
        exactPath: true,
        Icon: HomeNav,
    },
    MEMBERS: {
        href: "/members",
        label: "社區成員",
        Icon: CommunityNav,
    },
    INDUCTION: {
        href: "/induction",
        label: "邀請成員",
        Icon: MembershipNav,
    },
    DELEGATION: {
        href: "/delegates",
        label: "社區代表",
        Icon: DelegationNav,
        requiresActiveCommunity: true,
        requiresCompletedElection: true,
        requiresMembership: true,
    },
    ELECTION: {
        href: "/election",
        label: "選舉活動",
        Icon: ElectionNav,
        requiresActiveCommunity: true,
    },
    // >>> MOBILE NAV BAR ENDS HERE, IT ONLY SHOWS THE FIRST 5 ITEMS, THE ONES ABOVE THIS LINE <<<
    TREASURY: {
        href: "/treasury",
        label: "社區金庫",
        Icon: TreasuryNav,
    },
    ELECTION_SLASH_ROUND_VIDEO_UPLOAD: {
        href: "/election/round-video-upload",
        label: "上傳視頻",
        hideNav: true,
        Icon: ElectionNav, // TODO: pick a better Icon
        requiresActiveCommunity: true,
    },
    ELECTION_STATS: {
        href: "/election/stats",
        label: "選舉結果",
        hideNav: true,
        Icon: ElectionNav,
        requiresActiveCommunity: true,
    },
};
