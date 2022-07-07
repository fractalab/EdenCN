import React from "react";
import dayjs from "dayjs";

import {
    SideNavLayout,
    useCurrentElection,
    useElectionState,
    useMyDelegation,
} from "_app";
import { Container, Heading, LoadingContainer, Text } from "_app/ui";
import { ElectionStatus } from "elections/interfaces";
import {
    MemberGateContainer,
    useMembersByAccountNamesAsMemberNFTs,
} from "members";
import {
    ErrorLoadingDelegation,
    ElectionInProgress,
    NoDelegationToDisplay,
} from "delegates/components/statuses";
import MyDelegation from "delegates/components/my-delegation"; // avoid circular dependency

export const DelegatesPage = () => {
    const {
        data: currentElection,
        isLoading: isLoadingCurrentElection,
        isError: isErrorCurrentElection,
    } = useCurrentElection();
    const isElectionInProgress =
        currentElection?.electionState !== ElectionStatus.Registration;

    const {
        data: myDelegation,
        isLoading: isLoadingMyDelegation,
        isError: isErrorMyDelegation,
    } = useMyDelegation({
        queryOptions: { enabled: !isElectionInProgress },
    });

    const {
        data: electionState,
        isLoading: isLoadingElectionState,
        isError: isErrorElectionState,
    } = useElectionState();

    const {
        data: myDelegationMemberData,
        isLoading: isLoadingMemberData,
        isError: isErrorMemberData,
    } = useMembersByAccountNamesAsMemberNFTs(
        myDelegation?.map((delegate) => delegate.account)
    );

    const isLoading =
        isLoadingCurrentElection ||
        isLoadingMyDelegation ||
        isLoadingElectionState ||
        isLoadingMemberData;

    const isError =
        isErrorCurrentElection ||
        isErrorMyDelegation ||
        isErrorElectionState ||
        isErrorMemberData;

    return (
        <SideNavLayout title="社區代表">
            <div className="divide-y">
                <Container>
                    <Heading size={1}>社區代表</Heading>
                    {!isLoading &&
                        !isError &&
                        !isElectionInProgress &&
                        myDelegation && (
                            <Text size="sm">
                                Elected{" "}
                                {dayjs(
                                    electionState?.last_election_time
                                ).format("LL")}
                            </Text>
                        )}
                </Container>
                {isLoading ? (
                    <LoadingContainer />
                ) : isError ? (
                    <ErrorLoadingDelegation />
                ) : isElectionInProgress ? (
                    <ElectionInProgress />
                ) : !myDelegation || !myDelegationMemberData ? (
                    <NoDelegationToDisplay />
                ) : (
                    <MemberGateContainer>
                        <MyDelegation
                            myDelegation={myDelegation}
                            members={myDelegationMemberData}
                            electionState={electionState}
                        />
                    </MemberGateContainer>
                )}
            </div>
        </SideNavLayout>
    );
};

export default DelegatesPage;
