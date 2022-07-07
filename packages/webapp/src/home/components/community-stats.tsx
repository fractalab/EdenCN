import { useQuery } from "react-query";

import {
    assetToLocaleString,
    queryMembersStats,
    queryTreasuryStats,
} from "_app";
import { Container, Heading, Link, Loader, Text } from "_app/ui";
import { ROUTES } from "_app/routes";
import { PendingInvites } from "_app/ui/icons";
import { MembershipNav, TreasuryNav } from "_app/ui/nav-icons";

interface CommunityStatsProps {
    className?: string;
}

export const CommunityStats = ({ className = "" }: CommunityStatsProps) => (
    <div className={className}>
        <CommunityStatsContents />
    </div>
);

export default CommunityStats;

const CommunityStatsContents = () => {
    const { data: memberStats, isLoading: isLoadingMemberStats } = useQuery({
        ...queryMembersStats,
        keepPreviousData: true,
    });

    const {
        data: treasuryBalance,
        isLoading: isLoadingTreasuryBalance,
    } = useQuery({
        ...queryTreasuryStats,
        keepPreviousData: true,
    });

    if (
        isLoadingMemberStats ||
        isLoadingTreasuryBalance ||
        (!memberStats && !treasuryBalance)
    ) {
        return (
            <div className="h-full py-12">
                <Loader />
            </div>
        );
    }

    return (
        <Container className="flex flex-col">
            <Heading size={2} className="mb-2">
            社區數據
            </Heading>
            <div className="space-y-2.5">
                {treasuryBalance && (
                    <div className="flex items-center space-x-2 group">
                        <div className="flex justify-center w-5 group-hover:text-blue-500 transition">
                            <TreasuryNav />
                        </div>
                        <Link href={ROUTES.TREASURY.href}>
                            社区金库: {assetToLocaleString(treasuryBalance, 4)}
                        </Link>
                    </div>
                )}
                {memberStats && (
                    <>
                        <div className="flex items-center space-x-2 group">
                            <div className="flex justify-center w-5 group-hover:text-blue-500 transition">
                                <MembershipNav />
                            </div>
                            <Link href={ROUTES.MEMBERS.href}>
                                當前成員
                                {memberStats.active_members !== 1 && ""}:{" "}
                                {memberStats.active_members}
                            </Link>
                        </div>
                        <div className="flex items-center space-x-2 group">
                            <div className="flex justify-center w-5 group-hover:text-blue-500 transition">
                                <PendingInvites />
                            </div>
                            <Link
                                href={`${ROUTES.INDUCTION.href}/pending-invitations`}
                            >
                                邀請中的成員
                                {memberStats.pending_members !== 1 && ""}:{" "}
                                {memberStats.pending_members}
                            </Link>
                        </div>
                    </>
                )}
            </div>
        </Container>
    );
};
