import React from "react";
import { Container, Heading, Text } from "_app/ui";
import { MemberGateContainer } from "members";

export const ErrorLoadingDelegation = () => (
    <Container className="flex flex-col justify-center items-center py-16 text-center">
        <Heading size={4}>加載代表信息時出錯</Heading>
        <Text>請嘗試通過刷新頁面重新加載。</Text>
    </Container>
);

export const ElectionInProgress = () => (
    <Container className="flex flex-col justify-center items-center py-16 text-center">
        <Heading size={4}>社區成員名單</Heading>
        <Text>
            Come back after the election is complete to see your delegation.
        </Text>
    </Container>
);

export const NoDelegationToDisplay = () => (
    <Container className="flex flex-col justify-center items-center py-16 text-center">
        <Heading size={4}>No delegation to display</Heading>
        <MemberGateContainer>
            <Text>
                Your delegation will appear here after the first election
                completes.
            </Text>
        </MemberGateContainer>
    </Container>
);
