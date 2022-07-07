import React from "react";

import { useElectionState } from "_app";
import { Button, Container, Heading, LoadingContainer, Text } from "_app/ui";
import { ROUTES } from "_app/routes";

export const ViewPreviousElectionResultsCTA = () => {
    const { data: electionState, isLoading } = useElectionState();

    if (isLoading) return <LoadingContainer />;
    if (!electionState?.last_election_time) return null;

    return (
        <Container className="space-y-2.5">
            <Heading size={3}>上次選舉詳情</Heading>
            <Text>
            查看上一屆選舉詳情。包括有哪些成員參加，哪些成員當選，以及選舉過程中的視頻記錄等。
            </Text>
            <Button
                size="xs"
                href={ROUTES.ELECTION_STATS.href}
                title="查看上一屆選舉詳情"
            >
                查看詳情
            </Button>
        </Container>
    );
};

export default ViewPreviousElectionResultsCTA;
