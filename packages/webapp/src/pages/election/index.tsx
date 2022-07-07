import { useEffect, useState } from "react";
import { useRouter } from "next/router";

import {
    ElectionParticipationStatus,
    SideNavLayout,
    useCurrentElection,
    useCurrentMember,
    usePrevious,
} from "_app";
import { ROUTES } from "_app/routes";
import { Container, Heading, Loader } from "_app/ui";

import {
    ErrorLoadingElection,
    OngoingElection,
    RegistrationElection,
} from "elections";
import { ElectionStatus } from "elections/interfaces";
import { EncryptionPasswordAlert } from "encryption";

export const ElectionPage = () => {
    const router = useRouter();
    const [isElectionComplete, setIsElectionComplete] = useState(false);
    const {
        data: currentMember,
        isLoading: isLoadingMember,
        isError: isErrorMember,
    } = useCurrentMember();
    const {
        data: currentElection,
        isLoading: isLoadingElection,
        isError: isErrorElection,
    } = useCurrentElection();
    const prevElectionState = usePrevious(currentElection?.electionState);

    useEffect(() => {
        if (prevElectionState !== ElectionStatus.Final) return;
        if (currentElection?.electionState === ElectionStatus.Registration) {
            setIsElectionComplete(true);
            router.push(ROUTES.DELEGATION.href);
        }
    }, [currentElection]);

    const isLoading = isLoadingMember || isLoadingElection;
    console.log("isLoading --------- > " + isLoading);
    const isError = isErrorMember || isErrorElection;

    if (isError) return <ErrorLoadingElection />;

    const renderBanner =
        currentElection?.electionState !== ElectionStatus.Registration ||
        currentMember?.election_participation_status === ElectionParticipationStatus.InElection;
    console.log("renderBanner --------- > " + renderBanner);
    console.log("electionState --------- > " + currentElection?.electionState);
    console.log("ElectionStatus.Registration --------- > " + ElectionStatus.Registration);
    console.log(currentElection);
    console.log("currentMember?.election_participation_status --------- > " + ElectionParticipationStatus.InElection);
    return (
        <SideNavLayout
            title="選舉"
            banner={
                renderBanner && (
                    <EncryptionPasswordAlert
                        promptSetupEncryptionKey={
                            currentElection?.electionState !==
                            ElectionStatus.Registration
                        }
                    />
                )
            }
        >
            {isLoading || isElectionComplete ? (
                <LoaderSection />
            ) : (
                <div className="divide-y">
                    <Container>
                        <Heading size={1}>選舉</Heading>
                    </Container>
                    <ElectionBody election={currentElection} />
                </div>
            )}
        </SideNavLayout>
    );
};

export default ElectionPage;

const ElectionBody = ({ election }: { election: any }) => {
    switch (election.electionState) {
        case ElectionStatus.Registration:
        case ElectionStatus.Seeding:
        case ElectionStatus.InitVoters:
            return <RegistrationElection election={election} />;
        case ElectionStatus.Active:
        case ElectionStatus.PostRound:
        case ElectionStatus.Final:
            return <OngoingElection election={election} />;
        default:
            return <LoaderSection />;
    }
};

const LoaderSection = () => (
    <Container>
        <Loader />
    </Container>
);
