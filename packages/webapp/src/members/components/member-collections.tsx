import React from "react";
import { Tab } from "@headlessui/react";

import { Container, LoadingContainer, MessageContainer, Text } from "_app";
import { MemberChip, MembersGrid } from "members";
import { useMemberNFTCollection, useMemberNFTCollectors } from "nfts/hooks";
import { MemberNFT } from "nfts/interfaces";

import { Member } from "../interfaces";

interface Props {
    member: Member;
}

export const MemberCollections = ({ member }: Props) => {
    return (
        <Tab.Group>
            <Tab.List className="flex">
                <StyledTab>收藏的成員 NFT</StyledTab>
                <StyledTab>該成員 NFT 的收藏者</StyledTab>
            </Tab.List>
            <Tab.Panels>
                <Tab.Panel>
                    <Collection
                        accountName={member.accountName}
                        name={member.profile.name}
                    />
                </Tab.Panel>
                <Tab.Panel>
                    <Collectors
                        accountName={member.accountName}
                        name={member.profile.name}
                    />
                </Tab.Panel>
            </Tab.Panels>
        </Tab.Group>
    );
};

export default MemberCollections;

const tabClassName = ({ selected }: { selected: boolean }) => {
    const baseClass =
        "flex-1 lg:flex-none h-14 lg:px-12 border-b-2 focus:outline-none hover:bg-gray-100";
    if (!selected)
        return `${baseClass} text-gray-500 border-white hover:border-gray-100`;
    return `${baseClass} border-blue-500 text-gray-700`;
};

const StyledTab = ({ children }: { children: React.ReactNode }) => (
    <Tab className={tabClassName}>
        <p className="text-sm font-semibold">{children}</p>
    </Tab>
);

const Collection = ({
    accountName,
    name,
}: {
    accountName: string;
    name: string;
}) => {
    const { data: nfts, isLoading, isError } = useMemberNFTCollection(
        accountName
    );

    if (isLoading) return <LoadingContainer />;

    if (isError) {
        return (
            <MessageContainer
                title="加載失敗"
                message="請嘗試通過刷新頁面重新加載。"
            />
        );
    }

    if (!nfts?.length) {
        return (
            <MessageContainer
                title="No NFTs found"
                message="This user is not collecting any Eden member NFTs."
            />
        );
    }

    return (
        <>
            <Container>
                <Text>
                    <span className="font-medium">{name}</span> collects NFTs
                    for the following Eden members:
                </Text>
            </Container>
            <MembersGrid members={nfts}>
                {(member: MemberNFT) => (
                    <MemberChip
                        key={`member-collection-${member.account}`}
                        member={member}
                    />
                )}
            </MembersGrid>
        </>
    );
};

const Collectors = ({
    accountName,
    name,
}: {
    accountName: string;
    name: string;
}) => {
    const { data: collectors, isLoading, isError } = useMemberNFTCollectors(
        accountName
    );

    if (isLoading) return <LoadingContainer />;

    if (isError) {
        return (
            <MessageContainer
                title="加載收藏者信息時出錯"
                message="請嘗試通過刷新頁面重新加載。"
            />
        );
    }

    if (!collectors.length) {
        return (
            <MessageContainer
                title="No collectors found"
                message="No one is collecting this member's NFTs."
            />
        );
    }

    return (
        <>
            <Container>
                <Text>
                以下 Eden 成員收藏了一個或多個<span className="font-medium">{name}的</span> NFTs.
                </Text>
            </Container>
            <MembersGrid members={collectors}>
                {(member: MemberNFT) => (
                    <MemberChip
                        key={`member-collector-${member.account}`}
                        member={member}
                    />
                )}
            </MembersGrid>
        </>
    );
};
