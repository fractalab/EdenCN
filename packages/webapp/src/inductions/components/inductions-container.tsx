import { useQuery } from "react-query";

import {
    CallToAction,
    useCurrentMember,
    useIsCommunityActive,
    LoadingCard,
    queryCurrentInductions,
    MemberStatus,
} from "_app";
import { EdenMember } from "members";

import { Endorsement } from "../interfaces";
import { PendingInductions } from "./pending-inductions";
import { GetAnInviteCTA } from "./get-an-invite-cta";
import { InviteBanner } from "./invite-banner";
import PendingInvitationsLink from "./pending-invitations-link";

interface InductionsContainerProps {
    ualAccount: any;
}
export const InductionsContainer = ({
    ualAccount,
}: InductionsContainerProps) => {
    const {
        data: isActiveCommunity,
        isLoading: isLoadingCommunityState,
    } = useIsCommunityActive();

    const {
        data: edenMember,
        isLoading: isLoadingEdenMember,
    } = useCurrentMember();

    if (isLoadingCommunityState || isLoadingEdenMember) {
        return <LoadingCard />;
    } else if (!edenMember) {
        return <GetAnInviteCTA />;
    } else {
        return (
            <MemberInductionsContainer
                ualAccount={ualAccount}
                edenMember={edenMember}
                isActiveCommunity={isActiveCommunity}
            />
        );
    }
};

interface MemberInductionsContainerProps {
    ualAccount: any;
    edenMember: EdenMember;
    isActiveCommunity?: boolean;
}
const MemberInductionsContainer = ({
    ualAccount,
    edenMember,
    isActiveCommunity,
}: MemberInductionsContainerProps) => {
    const isActiveMember = edenMember.status === MemberStatus.ActiveMember;

    const { data: currentInductions, isLoading } = useQuery(
        queryCurrentInductions(ualAccount.accountName, isActiveMember)
    );

    const inductions = currentInductions ? currentInductions.inductions : [];
    const endorsements = currentInductions
        ? currentInductions.endorsements
        : [];

    const userEndorsements: Endorsement[] = endorsements.filter(
        (end: Endorsement) => end.inviter !== end.endorser
    );

    return isLoading ? (
        <LoadingCard />
    ) : (
        <>
            {!isActiveCommunity && <GenesisBanner />}
            <PendingInductions
                inductions={inductions}
                endorsements={userEndorsements}
                isActiveCommunity={isActiveCommunity}
                isActiveMember={isActiveMember}
            />
            <PendingInvitationsLink />
            <InviteBanner canInvite={isActiveCommunity && isActiveMember} />
        </>
    );
};

const GenesisBanner = () => (
    <CallToAction>
        創始成員正在加入中。當全體成員填完資料並向社區進行捐贈後，系統將被激活。你便可以邀請其他人加入。
    </CallToAction>
);
