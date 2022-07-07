import React from "react";

import { Heading, Text, useIsCommunityActive } from "_app";
import { Member } from "members";
import {
    convertPendingProfileToMember,
    EndorsementsStatus,
    InductionExpiresIn,
    InductionStepGenesis,
    InductionStepInvitee,
    InductionStepsContainer,
    MemberCardPreview,
    WaitingForProfile,
    WaitingForVideo,
} from "inductions";
import { Endorsement, Induction, InductionStatus } from "inductions/interfaces";

interface ContainerProps {
    step: InductionStepInvitee | InductionStepGenesis;
    memberPreview?: Member;
    children: React.ReactNode;
}

const Container = ({ step, memberPreview, children }: ContainerProps) => (
    <>
        <InductionStepsContainer step={step}>
            {children}
        </InductionStepsContainer>
        {memberPreview && <MemberCardPreview member={memberPreview} />}
    </>
);

interface Props {
    endorsements: Endorsement[];
    induction: Induction;
    inductionStatus: InductionStatus;
}

export const ThirdPartyJourney = ({
    endorsements,
    induction,
    inductionStatus,
}: Props) => {
    switch (inductionStatus) {
        case InductionStatus.PendingProfile:
            return <PendingProfileStep induction={induction} />;
        case InductionStatus.PendingCeremonyVideo: // not possible in Genesis mode
            return <PendingVideoStep induction={induction} />;
        case InductionStatus.PendingEndorsement: // not possible in Genesis mode
            return (
                <PendingEndorsementStep
                    induction={induction}
                    endorsements={endorsements}
                />
            );
        case InductionStatus.PendingDonation:
            return (
                <PendingDonationStep
                    induction={induction}
                    endorsements={endorsements}
                />
            );
        default:
            return <p>Unknown error</p>;
    }
};

export default ThirdPartyJourney;

const PendingProfileStep = ({ induction }: { induction: Induction }) => {
    const { data: isCommunityActive } = useIsCommunityActive();
    return (
        <Container
            step={
                isCommunityActive
                    ? InductionStepInvitee.Profile
                    : InductionStepGenesis.Profile
            }
        >
            <WaitingForProfile induction={induction} />
        </Container>
    );
};

const PendingVideoStep = ({ induction }: { induction: Induction }) => {
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    return (
        <Container
            step={InductionStepInvitee.PendingVideoAndEndorsements}
            memberPreview={member}
        >
            <WaitingForVideo induction={induction} />
        </Container>
    );
};

interface PendingCompletionProps {
    induction: Induction;
    endorsements: Endorsement[];
}

const PendingEndorsementStep = ({
    induction,
    endorsements,
}: PendingCompletionProps) => {
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    return (
        <Container
            step={InductionStepInvitee.PendingVideoAndEndorsements}
            memberPreview={member}
        >
            <Heading size={1} className="mb-2">
                確認
            </Heading>
            <InductionExpiresIn induction={induction} />
            <EndorsementsStatus endorsements={endorsements} />
            <Text>等待所有見證人確認</Text>
        </Container>
    );
};

const PendingDonationStep = ({
    induction,
    endorsements,
}: PendingCompletionProps) => {
    const { data: isCommunityActive } = useIsCommunityActive();
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    return (
        <Container
            step={
                isCommunityActive
                    ? InductionStepInvitee.Donate
                    : InductionStepGenesis.Donate
            }
            memberPreview={member}
        >
            <Heading size={1} className="mb-2">
                待捐贈
            </Heading>
            <InductionExpiresIn induction={induction} />
            <EndorsementsStatus endorsements={endorsements} />
            {isCommunityActive ? (
                <Text>
                    見證過程已經完成！一旦準會員完成了對Eden社區的捐贈，他們的會員資格將被激活，同時對應的Eden NFT將被鑄造和分發。
                </Text>
            ) : (
                <Text>
                    一旦準會員們完成了對Eden社區的捐贈，他們的會員資格將等待被激活。當全體創世成員都完成了加入流程，會員將被激活，Eden NFT將被創建並分發。
                </Text>
            )}
        </Container>
    );
};
