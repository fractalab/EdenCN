import React, { Dispatch, SetStateAction, useState } from "react";

import { Heading, Link, Text, useIsCommunityActive, useUALAccount } from "_app";

import { Member } from "members";
import {
    convertPendingProfileToMember,
    EndorsementsStatus,
    InductionExpiresIn,
    InductionStepGenesis,
    InductionStepInviter,
    InductionStepsContainer,
    MemberCardPreview,
    WaitingForProfile,
} from "inductions";
import { Endorsement, Induction, InductionStatus } from "inductions/interfaces";

import {
    InductionVideoFormContainer,
    InductionEndorsementForm,
    InductionVideoSubmitConfirmation,
} from "./inviter-witnesses";

interface Props {
    endorsements: Endorsement[];
    induction: Induction;
    inductionStatus: InductionStatus;
}

export const InviterWitnessJourney = ({
    endorsements,
    induction,
    inductionStatus,
}: Props) => {
    const [submittedVideo, setSubmittedVideo] = useState(false);
    const [isRevisitingVideo, setIsRevisitingVideo] = useState(false);

    if (submittedVideo) {
        // not possible in Genesis mode
        return <SubmittedVideoStep induction={induction} />;
    }

    if (isRevisitingVideo) {
        // not possible in Genesis mode
        return (
            <VideoStep
                induction={induction}
                isRevisitingVideo={isRevisitingVideo}
                setSubmittedVideo={setSubmittedVideo}
            />
        );
    }

    switch (inductionStatus) {
        case InductionStatus.PendingProfile:
            return <PendingProfileStep induction={induction} />;
        case InductionStatus.PendingCeremonyVideo: // not possible in Genesis mode
            return (
                <VideoStep
                    induction={induction}
                    isRevisitingVideo={isRevisitingVideo}
                    setSubmittedVideo={setSubmittedVideo}
                />
            );
        case InductionStatus.PendingEndorsement: // not possible in Genesis mode
            return (
                <PendingEndorsementStep
                    induction={induction}
                    endorsements={endorsements}
                    setIsRevisitingVideo={setIsRevisitingVideo}
                />
            );
        case InductionStatus.PendingDonation:
            return (
                <PendingDonationStep
                    induction={induction}
                    endorsements={endorsements}
                    setIsRevisitingVideo={setIsRevisitingVideo}
                />
            );
        default:
            return <p>Unknown error</p>;
    }
};

export default InviterWitnessJourney;

interface ContainerProps {
    step: InductionStepInviter | InductionStepGenesis;
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

const RecommendReview = ({
    setIsRevisitingVideo,
}: {
    setIsRevisitingVideo: Dispatch<SetStateAction<boolean>>;
}) => (
    <div className="mt-4 space-y-3">
        <Heading size={2} className="mb-2">
            資料審核
        </Heading>
        <Text>
            請逐條仔細檢查該潛在社區成員的個人資料。如有需要更正的地方，請聯繫被邀請人做出修正。
        </Text>
        <Text>
            如果見證會視頻需要更改，請點擊這裡,{" "}
            <Link onClick={() => setIsRevisitingVideo(true)}>点击这里</Link>.
            請注意，更改見證會視頻將會重置所有人的確認。即，所有人都需要再次提交確認。
        </Text>
    </div>
);

const SubmittedVideoStep = ({ induction }: { induction: Induction }) => {
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    return (
        <Container
            step={InductionStepInviter.VideoAndEndorse}
            memberPreview={member}
        >
            <InductionVideoSubmitConfirmation />
        </Container>
    );
};

interface VideoStepProps {
    induction: Induction;
    isRevisitingVideo: boolean;
    setSubmittedVideo: Dispatch<SetStateAction<boolean>>;
}

const VideoStep = ({
    induction,
    isRevisitingVideo,
    setSubmittedVideo,
}: VideoStepProps) => {
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    return (
        <Container
            step={InductionStepInviter.VideoAndEndorse}
            memberPreview={member}
        >
            <InductionVideoFormContainer
                induction={induction}
                isRevisitingVideo={isRevisitingVideo}
                setSubmittedVideo={setSubmittedVideo}
            />
        </Container>
    );
};

const PendingProfileStep = ({ induction }: { induction: Induction }) => {
    const { data: isCommunityActive } = useIsCommunityActive();
    return (
        <Container
            step={
                isCommunityActive
                    ? InductionStepInviter.PendingProfile
                    : InductionStepGenesis.Profile
            }
        >
            <WaitingForProfile induction={induction} />
        </Container>
    );
};

interface PendingCompletionProps {
    induction: Induction;
    endorsements: Endorsement[];
    setIsRevisitingVideo: Dispatch<SetStateAction<boolean>>;
}

const PendingEndorsementStep = ({
    induction,
    endorsements,
    setIsRevisitingVideo,
}: PendingCompletionProps) => {
    const [ualAccount] = useUALAccount();
    const member = convertPendingProfileToMember(
        induction.new_member_profile,
        induction.invitee,
        induction.video
    );
    const userEndorsementIsPending =
        endorsements.find((e) => e.endorser === ualAccount?.accountName)
            ?.endorsed === 0;

    return (
        <Container
            step={InductionStepInviter.VideoAndEndorse}
            memberPreview={member}
        >
            <Heading size={1} className="mb-2">
                Endorsements
            </Heading>
            <InductionExpiresIn induction={induction} />
            <EndorsementsStatus endorsements={endorsements} />
            {userEndorsementIsPending ? (
                <InductionEndorsementForm
                    induction={induction}
                    setIsRevisitingVideo={setIsRevisitingVideo}
                />
            ) : (
                <>
                    <Text>
                        等待所有見證人確認。與此同時：:
                    </Text>
                    <RecommendReview
                        setIsRevisitingVideo={setIsRevisitingVideo}
                    />
                </>
            )}
        </Container>
    );
};

const PendingDonationStep = ({
    induction,
    endorsements,
    setIsRevisitingVideo,
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
                    ? InductionStepInviter.PendingDonation
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
                <>
                    <Text>
                    見證流程已完成！一旦準會員完成對Eden社區的捐贈，他們的會員資格將被激活，同時對應的Eden NFT將被鑄造和分發。
                    </Text>
                    <RecommendReview
                        setIsRevisitingVideo={setIsRevisitingVideo}
                    />
                </>
            ) : (
                <Text>
                    一旦準會員們完成了對Eden社區的捐贈，他們的會員資格將等待被激活。當全體創世成員都完成了加入流程，會員將被激活，Eden NFT將被創建並分發。
                </Text>
            )}
        </Container>
    );
};
