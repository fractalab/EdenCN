import React from "react";

import { useMemberStats, useMemberListByAccountNames } from "_app";
import { LoadingContainer } from "_app/ui";
import {
    DelegateChip,
    ElectionParticipantChip,
    ElectionState,
} from "elections";
import { MembersGrid, useMembersByAccountNamesAsMemberNFTs } from "members";
import { EdenMember } from "members/interfaces";
import { MemberNFT } from "nfts/interfaces";

import { ErrorLoadingDelegation } from "./statuses";
import { LevelHeading } from "./level-heading";
import { MyDelegationArrow } from "./arrow-container";

interface Props {
    electionState?: ElectionState;
    members: MemberNFT[];
    myDelegation: EdenMember[];
}

export const MyDelegation = ({
    electionState,
    members,
    myDelegation,
}: Props) => (
    <>
        <LowerDelegates myDelegation={myDelegation} members={members} />
        <ChiefDelegates electionState={electionState} />
    </>
);

export default MyDelegation;

const LowerDelegates = ({ members, myDelegation }: Props) => {
    const { data: membersStats, isLoading, isError } = useMemberStats();

    if (isLoading) return <LoadingContainer />;
    if (isError || !membersStats) return <ErrorLoadingDelegation />;

    const heightOfDelegationWithoutChiefs = membersStats.ranks.length - 2;
    const diff = heightOfDelegationWithoutChiefs - myDelegation.length;
    const numLevelsWithNoRepresentation = diff > 0 ? diff : 0;

    return (
        <>
            {myDelegation
                .slice(0, heightOfDelegationWithoutChiefs)
                .map((delegate, index) => (
                    <div key={`my-delegation-${index}-${delegate.account}`}>
                        {index === 0 ? (
                            <ElectionParticipantChip
                                member={members.find(
                                    (d) => d.account === delegate.account
                                )}
                                subText="Member"
                            />
                        ) : (
                            <>
                                <LevelHeading>
                                    {index} 級代表
                                </LevelHeading>
                                <div className="-mt-px">
                                    <DelegateChip
                                        member={members.find(
                                            (d) =>
                                                d.account === delegate.account
                                        )}
                                        level={index + 1}
                                    />
                                </div>
                            </>
                        )}
                        <MyDelegationArrow />
                    </div>
                ))}
            {[...Array(numLevelsWithNoRepresentation)].map((v, idx) => (
                <div className="-mt-px" key={idx}>
                    {/* TODO: We'll need level headings for these too */}
                    <DelegateChip />
                    <MyDelegationArrow />
                </div>
            ))}
        </>
    );
};

const ChiefDelegates = ({
    electionState,
}: {
    electionState?: ElectionState;
}) => {
    const {
        data: membersStats,
        isLoading: isLoadingMemberStats,
        isError: isErrorMemberStats,
    } = useMemberStats();

    const allChiefAccountNames = electionState?.board || [];
    // Get EdenMember data, unwrap the QueryResults[] into an EdenMember[], and filter out non-existent members
    const chiefsAsMembers = useMemberListByAccountNames(allChiefAccountNames)
        .map((chiefQR) => chiefQR.data)
        .filter((el) => Boolean(el));

    const {
        data: memberData,
        isLoading: isLoadingMemberData,
        isError: isErrorMemberData,
    } = useMembersByAccountNamesAsMemberNFTs(
        chiefsAsMembers.map((chief) => chief!.account)
    );

    const isLoading = isLoadingMemberStats || isLoadingMemberData;
    const isError = isErrorMemberStats || isErrorMemberData;

    if (isLoading) {
        return <LoadingContainer />;
    }

    if (isError || !electionState || !memberData || !membersStats) {
        return <ErrorLoadingDelegation />;
    }

    // TODO: Handle the no-election-has-ever-happened scenario (just after genesis induction is complete)
    const headChiefAsEdenMember = chiefsAsMembers.find(
        (d) => d?.account === electionState.lead_representative
    );
    const headChiefAsMemberNFT = memberData.find(
        (d) => d?.account === electionState.lead_representative
    );

    if (!headChiefAsEdenMember || !headChiefAsMemberNFT) {
        return <ErrorLoadingDelegation />;
    }

    return (
        <>
            <div>
                <LevelHeading className="border-b">
                    首席代表
                </LevelHeading>
                <MembersGrid members={memberData}>
                    {(chiefDelegate: MemberNFT) => {
                        if (!chiefDelegate) return null;
                        return (
                            <DelegateChip
                                key={`chiefs-${chiefDelegate.account}`}
                                member={chiefDelegate}
                                level={membersStats.ranks.length - 1}
                            />
                        );
                    }}
                </MembersGrid>
                <MyDelegationArrow />
            </div>
            <div className="mb-16">
                <LevelHeading>主席</LevelHeading>
                <DelegateChip
                    member={headChiefAsMemberNFT}
                    level={headChiefAsEdenMember.election_rank + 1}
                    delegateTitle=""
                />
            </div>
        </>
    );
};
