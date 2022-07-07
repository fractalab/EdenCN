import { useQueries, useQuery, UseQueryResult } from "react-query";

import {
    EdenMember,
    getEdenMember,
    getMembers,
    getTreasuryStats,
    getMembersStats,
    MemberStats,
    useMembersByAccountNamesAsMemberNFTs,
} from "members";
import { getCommunityGlobals, getTokenBalanceForAccount } from "_app/api";
import {
    getCurrentInductions,
    getEndorsementsByInductionId,
    getInduction,
    getInductions,
    getInductionWithEndorsements,
} from "inductions/api";
import {
    getChiefDelegates,
    getDistributionState,
    getMasterPool,
    getHeadDelegate,
    getMyDelegation,
} from "delegates/api";
import {
    getCurrentElection,
    getElectionState,
    getMemberGroupParticipants,
    getOngoingElectionData,
    getParticipantsInCompletedRound,
    getVoteData,
    getVoteDataRow,
} from "elections/api/eden-contract";
import {
    ActiveStateConfigType,
    CurrentElection,
    Election,
    ElectionCompletedRound,
    VoteData,
} from "elections/interfaces";
import { MemberNFT } from "nfts/interfaces";
import { EncryptionScope, getEncryptedData } from "encryption/api";
import { TableQueryOptions } from "_app/eos/interfaces";

import { useUALAccount } from "../eos";

export const queryHeadDelegate = {
    queryKey: "query_head_delegate",
    queryFn: getHeadDelegate,
};

export const queryChiefDelegates = {
    queryKey: "query_chief_delegates",
    queryFn: getChiefDelegates,
};

export const queryMyDelegation = (
    highestCompletedRoundIndex?: number,
    memberAccount?: string
) => ({
    queryKey: [
        "query_my_delegation",
        memberAccount,
        highestCompletedRoundIndex,
    ],
    queryFn: () => getMyDelegation(memberAccount, highestCompletedRoundIndex),
});

export const queryMemberGroupParticipants = (
    memberAccount?: string,
    roundIndex?: number,
    config?: ActiveStateConfigType
) => ({
    queryKey: [
        "query_member_group_participants",
        memberAccount,
        roundIndex,
        config,
    ],
    queryFn: () =>
        getMemberGroupParticipants(memberAccount, roundIndex, config),
});

export const queryVoteDataRow = (account?: string) => ({
    queryKey: ["query_vote_data_row", account],
    queryFn: () => {
        if (!account)
            throw new Error(
                "getVoteDataRow requires an account (got 'undefined')"
            );
        return getVoteDataRow({ fieldName: "member", fieldValue: account });
    },
});

export const queryVoteData = (options: TableQueryOptions = {}) => ({
    queryKey: ["query_vote_data"],
    queryFn: () => getVoteData(options),
});

export const queryEncryptedData = (scope: EncryptionScope, id: string) => ({
    queryKey: ["query_encrypted_data"],
    queryFn: () => getEncryptedData(scope, id),
});

export const queryParticipantsInCompletedRound = (
    electionRound: number,
    member?: EdenMember,
    voteData?: VoteData
) => ({
    queryKey: [
        "query_participants_in_completed_round",
        member,
        voteData,
        electionRound,
    ],
    queryFn: () => {
        if (!member)
            throw new Error(
                "useParticipantsInCompletedRound() requires a value for 'memberAccount'"
            );
        return getParticipantsInCompletedRound(electionRound, member, voteData);
    },
});

export const queryCurrentElection = {
    queryKey: "query_current_election",
    queryFn: getCurrentElection,
};

export const queryMembersStats = {
    queryKey: "query_member_stats",
    queryFn: getMembersStats,
};

export const queryElectionState = {
    queryKey: "query_election_state",
    queryFn: getElectionState,
};

export const queryTreasuryStats = {
    queryKey: "query_treasury_stats",
    queryFn: getTreasuryStats,
};

export const queryCommunityGlobals = {
    queryKey: "query_community_globals",
    queryFn: getCommunityGlobals,
};

export const queryOngoingElectionData = (
    votingMemberData?: MemberNFT[],
    currentElection?: CurrentElection,
    myDelegation?: EdenMember[],
    currentMember?: EdenMember
) => ({
    queryKey: [
        "query_ongoing_round",
        votingMemberData,
        currentElection,
        myDelegation,
        currentMember?.representative,
        currentMember?.election_participation_status,
    ],
    queryFn: () => {
        return getOngoingElectionData(
            votingMemberData,
            currentElection,
            myDelegation,
            currentMember
        );
    },
});

export const queryMembers = (
    page: number = 1,
    pageSize: number = 200,
    nftTemplateIds: number[] = []
) => {
    const ids = nftTemplateIds.map((id) => id.toString());
    return {
        queryKey: ["query_members", page, pageSize, nftTemplateIds],
        queryFn: () => getMembers(page, pageSize, ids),
    };
};

export const queryMemberByAccountName = (accountName: string) => ({
    queryKey: ["query_member", accountName],
    queryFn: () => getEdenMember(accountName),
});

export const queryDistributionState = () => ({
    queryKey: ["query_distribution_state"],
    queryFn: getDistributionState,
});

export const queryMasterPool = () => ({
    queryKey: ["query_master_pool"],
    queryFn: getMasterPool,
});

export const queryTokenBalanceForAccount = (account: string) => ({
    queryKey: ["query_token_balance_for_account", account],
    queryFn: () => getTokenBalanceForAccount(account),
});

export const queryInduction = (inductionId: string) => ({
    queryKey: ["query_induction", inductionId],
    queryFn: () => getInduction(inductionId),
});

export const queryInductions = (
    limit: number,
    lowerBound?: string,
    upperBound?: string
) => ({
    queryKey: ["query_inductions", lowerBound, upperBound, limit],
    queryFn: () => getInductions(lowerBound, upperBound, limit),
});

export const queryCurrentInductions = (
    account: string,
    isActiveMember: boolean
) => ({
    queryKey: ["query_current_inductions", account, isActiveMember],
    queryFn: () => getCurrentInductions(account, isActiveMember),
});

export const queryInductionWithEndorsements = (inductionId: string) => ({
    queryKey: ["query_induction_with_endorsements", inductionId],
    queryFn: () => getInductionWithEndorsements(inductionId),
});

export const queryEndorsementsByInductionId = (inductionId: string) => ({
    queryKey: ["query_endorsements_by_induction_id", inductionId],
    queryFn: () => getEndorsementsByInductionId(inductionId),
});

export const useMemberByAccountName = (accountName?: string) =>
    useQuery<EdenMember | undefined, Error>({
        ...queryMemberByAccountName(accountName ?? ""),
        enabled: Boolean(accountName),
    });

export const useDistributionState = () =>
    useQuery({
        ...queryDistributionState(),
    });

export const useMasterPool = () =>
    useQuery({
        ...queryMasterPool(),
    });

export const useTreasuryStats = () => useQuery({ ...queryTreasuryStats });

export const useTokenBalanceForAccount = (account: string) =>
    useQuery({
        ...queryTokenBalanceForAccount(account),
        enabled: Boolean(account),
    });

export const useMemberListByAccountNames = (
    accountNames: string[],
    queryOptions: any = {}
) => {
    // use queryOptions.enabled unless unspecified, in which case, ensure we don't disable the internal `enabled`
    let enabled = "enabled" in queryOptions ? queryOptions.enabled : true;
    return useQueries(
        accountNames.map((accountName) => ({
            ...queryMemberByAccountName(accountName),
            ...queryOptions,
            // want this to fail if queryOpts.enabled is disabled and merge if enabled; ignore not specified
            enabled: enabled && accountNames.length && Boolean(accountName),
        }))
    ) as UseQueryResult<EdenMember | undefined>[];
};

export const useCurrentMember = () => {
    const [ualAccount] = useUALAccount();
    return useMemberByAccountName(ualAccount?.accountName);
};

export const useCommunityGlobals = () => {
    return useQuery({
        ...queryCommunityGlobals,
        staleTime: Infinity,
        refetchOnWindowFocus: false,
    });
};

export const useIsCommunityActive = () => {
    const response = useCommunityGlobals();
    return {
        ...response,
        data: response.data ? response.data.stage > 0 : undefined,
    };
};

/**
 * Use this hook for querying signed-in user's delegation from a past/completed election. Pass in memberStats for retrieving fresh, during-election delegation results.
 * @param { MemberStats } memberStats - if omitted, internal useMemberStats() query will be used; include if you want to trigger rerender using fresher data
 * @param { any } queryOptions - any react-query queryOptions; enabled will be merged
 * @returns query of <EdenMember[], Error>
 */
export const useMyDelegation = ({
    memberStats,
    queryOptions = {},
}: {
    memberStats?: MemberStats;
    queryOptions?: any;
} = {}) => {
    const { data: member } = useCurrentMember();
    const { data: cachedMemberStats } = useMemberStats({
        enabled: !memberStats,
    });

    const stats = memberStats ?? cachedMemberStats;
    const enabled = Boolean(member?.account && stats);
    const highestCompletedRoundIndex = stats && stats.ranks.length - 1;

    return useQuery<EdenMember[], Error>({
        ...queryMyDelegation(highestCompletedRoundIndex, member?.account),
        ...queryOptions,
        enabled: enabled && (queryOptions.enabled ?? true),
    });
};

export const useChiefDelegates = () =>
    useQuery({
        ...queryChiefDelegates,
    });

export const useHeadDelegate = () =>
    useQuery({
        ...queryHeadDelegate,
    });

export const useParticipantsInMyCompletedRound = (
    electionRound: number
): UseQueryResult<ElectionCompletedRound> => {
    const { data: member } = useCurrentMember();
    const { data: voteData } = useVoteDataRow(member?.account);

    return useQuery<ElectionCompletedRound>({
        ...queryParticipantsInCompletedRound(electionRound, member, voteData),
        enabled: Boolean(member),
    });
};

export const useCurrentElection = (queryOptions: any = {}) =>
    useQuery<CurrentElection, Error>({
        ...queryCurrentElection,
        ...queryOptions,
    });

/**
 * Use `votes` table data (for a particular person and round).
 * This is only enabled during Active and Final ongoing rounds.
 * @param {string} memberAccount - account of member to get
 * @param {number} roundIndex - election round index
 * @param {any} queryOptions - any react-query queryOptions overrides (enabled merged)
 */
export const useMemberGroupParticipants = (
    memberAccount?: string,
    roundIndex?: number,
    queryOptions: any = {}
) => {
    const { data: currentElection } = useCurrentElection();

    let config;
    if (currentElection && "config" in currentElection) {
        config = currentElection.config;
    }

    let enabled = Boolean(memberAccount) && roundIndex !== undefined;

    return useQuery<VoteData[], Error>({
        ...queryMemberGroupParticipants(memberAccount, roundIndex, config),
        ...queryOptions,
        enabled: enabled && (queryOptions.enabled ?? true),
    });
};

export const useElectionState = () =>
    useQuery({
        ...queryElectionState,
    });

export const useMemberStats = (queryOptions: any = {}) =>
    useQuery<MemberStats, Error>({
        ...queryMembersStats,
        ...queryOptions,
    });

export const useVoteDataRow = (account?: string) => {
    return useQuery({
        ...queryVoteDataRow(account),
        enabled: Boolean(account),
    });
};

export const useVoteData = (
    voteQueryConfig: TableQueryOptions,
    queryOptions = {}
) =>
    useQuery({
        ...queryVoteData(voteQueryConfig),
        ...queryOptions,
    });

export const useMemberDataFromVoteData = (voteData?: VoteData[]) => {
    const responses = useMemberListByAccountNames(
        voteData?.map((participant) => participant.member) ?? []
    );
    const isFetchError = responses.some((res) => res.isError);
    const areQueriesComplete = responses.every((res) => res.isSuccess);
    const isLoading = responses.some((res) => res.isLoading);

    const accountNames = responses
        .filter((res) => Boolean(res?.data?.account))
        .map((res) => res.data as EdenMember)
        .map((member) => member.account);

    const memberDataRes = useMembersByAccountNamesAsMemberNFTs(accountNames);

    return {
        ...memberDataRes,
        isLoading: memberDataRes.isLoading || isLoading,
        isError: memberDataRes.isError || isFetchError,
        isSuccess: areQueriesComplete,
    } as UseQueryResult<MemberNFT[], Error>;
};

export const useEncryptedData = (scope: EncryptionScope, id: string) =>
    useQuery({
        ...queryEncryptedData(scope, id),
        enabled: Boolean(id),
    });

export const useOngoingElectionData = ({
    currentElection,
    queryOptions = {},
}: {
    currentElection: CurrentElection;
    queryOptions?: any;
}): UseQueryResult<Election | undefined> => {
    const currentMember = useCurrentMember();

    const memberStats = useMemberStats({
        queryKey: ["query_member_stats", currentElection],
    });

    const myDelegation = useMyDelegation({ memberStats: memberStats.data });

    const membersInOngoingRound = useMemberGroupParticipants(
        currentMember.data?.account,
        memberStats.data?.ranks.length
    );

    let votingMemberData = useMemberDataFromVoteData(
        membersInOngoingRound.data
    );

    let enabled = Boolean(currentMember.data && memberStats.data);

    const ongoingElection = useQuery<Election, Error>({
        ...queryOngoingElectionData(
            votingMemberData.data,
            currentElection,
            myDelegation.data,
            currentMember.data
        ),
        ...queryOptions,
        enabled: enabled && (queryOptions.enabled ?? true),
    });

    const isLoading =
        currentMember.isLoading ||
        memberStats.isLoading ||
        myDelegation.isLoading ||
        membersInOngoingRound.isLoading ||
        votingMemberData.isLoading ||
        ongoingElection.isLoading;

    const isError =
        currentMember.isError ||
        memberStats.isError ||
        myDelegation.isError ||
        membersInOngoingRound.isError ||
        votingMemberData.isError ||
        ongoingElection.isError;

    return {
        ...ongoingElection,
        isLoading,
        isError,
    } as UseQueryResult<Election, Error>;
};
